'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function NewClientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [clickupId, setClickupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ intake_url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, clickup_id: clickupId }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body.error === 'duplicate_name') {
        setError(`A client named "${body.existing_name ?? name}" already exists.`);
      } else if (body.error === 'invalid_input') {
        const fields = body.details ?? {};
        const msgs = Object.entries(fields).flatMap(([k, v]) => (v as string[]).map((m) => `${k}: ${m}`));
        setError(msgs.join(' · ') || 'Invalid input');
      } else {
        setError(body.error || 'Failed to create client');
      }
      return;
    }
    const data = await res.json();
    setResult({ intake_url: data.intake_url });
    router.refresh();
  }

  function close() {
    setOpen(false);
    setName('');
    setClickupId('');
    setResult(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogTrigger asChild>
        <Button>New client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{result ? 'Intake link ready' : 'Create client'}</DialogTitle>
        </DialogHeader>
        {result ? (
          <div className="space-y-3">
            <p className="text-sm">Share this link with the client. It expires in 7 days and can be used once.</p>
            <div className="flex gap-2">
              <Input readOnly value={result.intake_url} />
              <Button onClick={() => navigator.clipboard.writeText(result.intake_url)}>Copy</Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="client-name">Client name</Label>
              <Input
                id="client-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="clickup-id">ClickUp ID</Label>
              <Input
                id="clickup-id"
                value={clickupId}
                onChange={(e) => setClickupId(e.target.value)}
                placeholder="e.g. 86a7xy2bc"
                required
              />
              <p className="text-xs text-muted-foreground">Task or list ID from ClickUp — links this client to the project there.</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button variant="outline" type="button" onClick={close} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading || !name.trim() || !clickupId.trim()}>
                {loading ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
