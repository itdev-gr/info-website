import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: client } = await admin.from('clients').select('id').eq('id', id).maybeSingle();
  if (!client) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: submission } = await admin
    .from('client_submissions')
    .select('logo_url')
    .eq('client_id', id)
    .maybeSingle();
  const { data: files } = await admin
    .from('client_files')
    .select('storage_path')
    .eq('client_id', id);

  if (submission?.logo_url) {
    await admin.storage.from('client-logos').remove([submission.logo_url]);
  }
  const filePaths = (files ?? []).map((f) => f.storage_path);
  if (filePaths.length > 0) {
    await admin.storage.from('client-files').remove(filePaths);
  }

  const { error: delErr } = await admin.from('clients').delete().eq('id', id);
  if (delErr) return NextResponse.json({ error: 'db_error', details: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
