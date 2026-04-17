import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateIntakeLink } from '@/lib/tokens';
import { intakeFormSchema } from '@/lib/validation';
import { sendSubmissionAlert } from '@/lib/email';
import { originFromRequest } from '@/lib/base-url';

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  // Validate token
  const { data: link } = await admin.from('intake_links').select('*').eq('token', token).maybeSingle();
  const result = validateIntakeLink(link);
  if (!result.valid) return NextResponse.json({ error: 'invalid_link' }, { status: 403 });

  // Parse body
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const parsed = intakeFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed', details: parsed.error.flatten() }, { status: 400 });
  const logoPath = typeof body.logo_path === 'string' || body.logo_path === null ? body.logo_path : null;

  const now = new Date().toISOString();

  // Upsert submission
  const { error: subErr } = await admin.from('client_submissions').upsert({
    client_id: link!.client_id,
    logo_url: logoPath,
    description: parsed.data.description,
    recommended_site: parsed.data.recommended_site,
    contact_email: parsed.data.contact_email,
    contact_phone: parsed.data.contact_phone,
    contact_whatsapp: parsed.data.contact_whatsapp,
    wants_whatsapp_button: parsed.data.wants_whatsapp_button,
    whatsapp_button_number: parsed.data.whatsapp_button_number,
    has_existing_domain: parsed.data.has_existing_domain,
    existing_domain: parsed.data.existing_domain,
    domain_suggestions: parsed.data.domain_suggestions,
    submitted_at: now,
  });
  if (subErr) return NextResponse.json({ error: 'db_error', details: subErr.message }, { status: 500 });

  // Invalidate link
  const { error: linkErr } = await admin.from('intake_links').update({ used_at: now }).eq('token', token).is('used_at', null);
  if (linkErr) return NextResponse.json({ error: 'db_error', details: linkErr.message }, { status: 500 });

  // Flip client status
  await admin.from('clients').update({ status: 'submitted', submitted_at: now }).eq('id', link!.client_id);

  // Fetch client name for the email
  const { data: client } = await admin.from('clients').select('name').eq('id', link!.client_id).single();

  // Fetch all team emails
  const { data: usersResp } = await admin.auth.admin.listUsers();
  const teamEmails = (usersResp?.users ?? []).map((u) => u.email).filter((e): e is string => !!e);

  // Send notification (swallow errors — submission itself succeeded)
  if (client && teamEmails.length > 0) {
    try {
      await sendSubmissionAlert({ to: teamEmails, clientName: client.name, clientId: link!.client_id, appUrl: originFromRequest(request) });
    } catch (err) {
      console.error('submission email failed', err);
    }
  }

  return NextResponse.json({ ok: true });
}
