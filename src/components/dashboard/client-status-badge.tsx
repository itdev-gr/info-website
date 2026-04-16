import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/database';

type Status = Database['public']['Enums']['client_status'];

const variantByStatus: Record<Status, 'default' | 'secondary' | 'outline'> = {
  invited: 'outline',
  submitted: 'default',
  archived: 'secondary',
};

export function ClientStatusBadge({ status }: { status: Status }) {
  return <Badge variant={variantByStatus[status]}>{status}</Badge>;
}
