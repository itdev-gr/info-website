import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateIntakeLink } from '@/lib/tokens';
import { checkFileSize, checkQuota } from '@/lib/file-limits';
import { rateLimit } from '@/lib/rate-limit';

function ipOf(req: Request) {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const rl = rateLimit(`upload:${ipOf(request)}`, { limit: 30, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const body = await request.json().catch(() => null) as { kind?: string; file_name?: string; size?: number; mime_type?: string } | null;
  if (!body || !body.file_name || typeof body.size !== 'number') return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const admin = createAdminClient();
  const { data: link } = await admin.from('intake_links').select('*').eq('token', token).maybeSingle();
  const result = validateIntakeLink(link);
  if (!result.valid) return NextResponse.json({ error: 'invalid_link' }, { status: 403 });

  const sizeCheck = checkFileSize(body.size);
  if (!sizeCheck.ok) return NextResponse.json({ error: sizeCheck.reason }, { status: 413 });

  // Quota check: sum of existing files for this client
  const { data: existing } = await admin.from('client_files').select('file_size').eq('client_id', link!.client_id);
  const totalSoFar = (existing ?? []).reduce((acc, r) => acc + Number(r.file_size), 0);
  const quotaCheck = checkQuota(totalSoFar, body.size);
  if (!quotaCheck.ok) return NextResponse.json({ error: quotaCheck.reason }, { status: 413 });

  const isLogo = body.kind === 'logo';
  const bucket = isLogo ? 'client-logos' : 'client-files';
  const safeName = body.file_name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = isLogo
    ? `${link!.client_id}/${safeName}`
    : `${link!.client_id}/${crypto.randomUUID()}-${safeName}`;

  const { data: signed, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !signed) return NextResponse.json({ error: 'signing_failed', details: error?.message }, { status: 500 });

  return NextResponse.json({
    signed_url: signed.signedUrl,
    storage_path: signed.path,
  });
}
