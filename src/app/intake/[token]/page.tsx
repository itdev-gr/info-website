import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateIntakeLink } from '@/lib/tokens';
import { IntakeForm } from '@/components/intake/intake-form';

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const admin = createAdminClient();
  const { data: link } = await admin.from('intake_links').select('*').eq('token', token).maybeSingle();
  const result = validateIntakeLink(link);
  if (!result.valid) redirect(`/intake/${token}/expired`);

  const { data: client } = await admin.from('clients').select('id, name').eq('id', link!.client_id).single();
  if (!client) redirect(`/intake/${token}/expired`);

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-2xl space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {client.name}</h1>
          <p className="text-sm text-muted-foreground">Please fill out this form so we can get started on your project.</p>
        </div>
        <IntakeForm token={token} clientId={client.id} />
      </div>
    </div>
  );
}
