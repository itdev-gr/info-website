'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirm.trim() === clientName;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canDelete) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Delete failed');
      return;
    }
    setOpen(false);
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setConfirm('');
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">Delete client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &quot;{clientName}&quot;?</DialogTitle>
          <DialogDescription>
            This removes the client record, all submitted data, and every uploaded file. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="confirm-name">
              Type <strong>{clientName}</strong> to confirm
            </Label>
            <Input
              id="confirm-name"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!canDelete || loading}>
              {loading ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
