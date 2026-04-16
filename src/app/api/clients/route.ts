import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { newClientSchema } from '@/lib/validation';
import { generateToken } from '@/lib/tokens';
import { originFromRequest } from '@/lib/base-url';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = newClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { name, clickup_id } = parsed.data;

  const admin = createAdminClient();

  // Case-insensitive duplicate check (unique index enforces this in DB, we pre-check for a nice error message)
  const { data: existing } = await admin
    .from('clients')
    .select('id, name')
    .ilike('name', name)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'duplicate_name', existing_name: existing.name }, { status: 409 });
  }

  const { data: client, error: clientErr } = await admin
    .from('clients')
    .insert({ name, clickup_id, created_by: user.id, status: 'invited' })
    .select()
    .single();
  if (clientErr || !client) {
    // Race condition against the unique index returns 23505
    if (clientErr?.code === '23505') {
      return NextResponse.json({ error: 'duplicate_name' }, { status: 409 });
    }
    return NextResponse.json({ error: 'db_error', details: clientErr?.message }, { status: 500 });
  }

  const { data: link, error: linkErr } = await admin
    .from('intake_links')
    .insert({ token: generateToken(), client_id: client.id })
    .select()
    .single();
  if (linkErr || !link) return NextResponse.json({ error: 'db_error', details: linkErr?.message }, { status: 500 });

  return NextResponse.json({ client, intake_url: `${originFromRequest(request)}/intake/${link.token}` });
}
