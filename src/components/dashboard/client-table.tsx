import Link from 'next/link';
import { ClientStatusBadge } from './client-status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Database } from '@/types/database';

type Client = Database['public']['Tables']['clients']['Row'];

export function ClientTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return <p className="text-sm text-muted-foreground">No clients yet. Create one to get started.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>ClickUp ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <Link href={`/dashboard/clients/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{c.clickup_id || '—'}</TableCell>
            <TableCell><ClientStatusBadge status={c.status} /></TableCell>
            <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-muted-foreground">
              {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
