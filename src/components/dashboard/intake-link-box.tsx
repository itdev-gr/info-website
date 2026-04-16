'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function IntakeLinkBox({ clientId, initialUrl }: { clientId: string; initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    if (!confirm('Regenerate link? The current link will stop working immediately.')) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/clients/${clientId}/link`, { method: 'POST' });
    setLoading(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || 'Failed to regenerate link');
      return;
    }
    const data = await res.json();
    setUrl(data.intake_url);
  }

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <h2 className="font-medium">Intake link</h2>
      {url ? (
        <div className="flex gap-2">
          <Input readOnly value={url} />
          <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(url)}>Copy</Button>
          <Button type="button" variant="destructive" onClick={regenerate} disabled={loading}>
            {loading ? 'Working…' : 'Regenerate'}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <p className="text-sm text-muted-foreground">No active link.</p>
          <Button type="button" onClick={regenerate} disabled={loading}>Generate</Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
