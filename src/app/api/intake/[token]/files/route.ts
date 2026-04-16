import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateIntakeLink } from '@/lib/tokens';

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: link } = await admin.from('intake_links').select('*').eq('token', token).maybeSingle();
  const result = validateIntakeLink(link);
  if (!result.valid) return NextResponse.json({ error: 'invalid_link' }, { status: 403 });

  const body = await request.json().catch(() => null) as { file_name?: string; size?: number; mime_type?: string; storage_path?: string } | null;
  if (!body?.file_name || !body.storage_path || typeof body.size !== 'number') return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: file, error } = await admin
    .from('client_files')
    .insert({
      client_id: link!.client_id,
      file_name: body.file_name,
      file_size: body.size,
      mime_type: body.mime_type ?? null,
      storage_path: body.storage_path,
    })
    .select()
    .single();
  if (error || !file) return NextResponse.json({ error: 'db_error', details: error?.message }, { status: 500 });

  return NextResponse.json({ file });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: link } = await admin.from('intake_links').select('*').eq('token', token).maybeSingle();
  const result = validateIntakeLink(link);
  if (!result.valid) return NextResponse.json({ error: 'invalid_link' }, { status: 403 });

  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: row } = await admin.from('client_files').select('*').eq('id', body.id).eq('client_id', link!.client_id).maybeSingle();
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  await admin.storage.from('client-files').remove([row.storage_path]);
  await admin.from('client_files').delete().eq('id', row.id);
  return NextResponse.json({ ok: true });
}
