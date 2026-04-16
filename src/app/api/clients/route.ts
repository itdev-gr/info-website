import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { clientNameSchema } from '@/lib/validation';
import { generateToken } from '@/lib/tokens';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = clientNameSchema.safeParse(body?.name);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_name' }, { status: 400 });

  const admin = createAdminClient();

  const { data: client, error: clientErr } = await admin
    .from('clients')
    .insert({ name: parsed.data, created_by: user.id, status: 'invited' })
    .select()
    .single();
  if (clientErr || !client) return NextResponse.json({ error: 'db_error', details: clientErr?.message }, { status: 500 });

  const { data: link, error: linkErr } = await admin
    .from('intake_links')
    .insert({ token: generateToken(), client_id: client.id })
    .select()
    .single();
  if (linkErr || !link) return NextResponse.json({ error: 'db_error', details: linkErr?.message }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return NextResponse.json({ client, intake_url: `${appUrl}/intake/${link.token}` });
}
