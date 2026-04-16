import { createClient } from '@/lib/supabase/server';
import { ClientTable } from '@/components/dashboard/client-table';
import { NewClientDialog } from '@/components/dashboard/new-client-dialog';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <NewClientDialog />
      </div>
      <ClientTable clients={clients ?? []} />
    </div>
  );
}
