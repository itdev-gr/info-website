import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { ClientStatusBadge } from '@/components/dashboard/client-status-badge';
import { IntakeLinkBox } from '@/components/dashboard/intake-link-box';
import { FileGallery } from '@/components/dashboard/file-gallery';
import { originFromHeaders } from '@/lib/base-url';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from('clients').select('*').eq('id', id).single();
  if (!client) notFound();

  const { data: submission } = await supabase.from('client_submissions').select('*').eq('client_id', id).maybeSingle();
  const { data: files } = await supabase.from('client_files').select('*').eq('client_id', id).order('uploaded_at', { ascending: false });
  const { data: activeLink } = await supabase
    .from('intake_links').select('token').eq('client_id', id).eq('revoked', false).is('used_at', null)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();

  const appUrl = await originFromHeaders();
  const intakeUrl = activeLink ? `${appUrl}/intake/${activeLink.token}` : null;

  let logoUrl: string | null = null;
  if (submission?.logo_url) {
    const { data } = await supabase.storage.from('client-logos').createSignedUrl(submission.logo_url, 3600);
    logoUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <div className="mt-1"><ClientStatusBadge status={client.status} /></div>
        </div>
      </div>

      <IntakeLinkBox clientId={client.id} initialUrl={intakeUrl} />

      {submission ? (
        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-2">
            <h2 className="font-medium">Logo</h2>
            {logoUrl ? <Image src={logoUrl} alt="Logo" width={200} height={200} className="rounded border" /> : <p className="text-sm text-muted-foreground">No logo uploaded.</p>}
          </section>
          <section className="space-y-2">
            <h2 className="font-medium">Domain</h2>
            {submission.has_existing_domain ? (
              <p className="text-sm">Existing: <strong>{submission.existing_domain}</strong></p>
            ) : (
              <div className="text-sm">
                <p>Client wants us to buy a domain. Suggestions:</p>
                <ul className="list-disc pl-5">
                  {submission.domain_suggestions.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
          </section>
          <section className="md:col-span-2 space-y-2">
            <h2 className="font-medium">Description</h2>
            <p className="whitespace-pre-wrap text-sm">{submission.description}</p>
          </section>
          <section className="md:col-span-2 space-y-2">
            <h2 className="font-medium">Recommended reference site</h2>
            {submission.recommended_site ? (
              <a className="text-sm text-primary underline" href={submission.recommended_site} target="_blank" rel="noreferrer">{submission.recommended_site}</a>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </section>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Awaiting client submission.</p>
      )}

      <section className="space-y-2">
        <h2 className="font-medium">Files</h2>
        <FileGallery files={files ?? []} />
      </section>
    </div>
  );
}
