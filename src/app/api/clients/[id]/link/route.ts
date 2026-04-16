import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateToken } from '@/lib/tokens';
import { originFromRequest } from '@/lib/base-url';

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// POST: generate a new link (revokes previous non-revoked/non-used for this client)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { error: revokeErr } = await admin
    .from('intake_links')
    .update({ revoked: true })
    .eq('client_id', id)
    .is('used_at', null)
    .eq('revoked', false);
  if (revokeErr) return NextResponse.json({ error: 'db_error', details: revokeErr.message }, { status: 500 });

  const { data: link, error: insertErr } = await admin
    .from('intake_links')
    .insert({ token: generateToken(), client_id: id })
    .select()
    .single();
  if (insertErr || !link) return NextResponse.json({ error: 'db_error', details: insertErr?.message }, { status: 500 });

  return NextResponse.json({ intake_url: `${originFromRequest(request)}/intake/${link.token}` });
}
