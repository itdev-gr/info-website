'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function LogoUpload({ token, onChange }: { token: string; onChange: (path: string | null) => void }) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus('error');
      setErrorMsg('Logo must be under 5 MB');
      return;
    }

    setStatus('uploading');
    setFileName(file.name);
    setErrorMsg(null);

    const res = await fetch(`/api/intake/${token}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'logo', file_name: file.name, size: file.size, mime_type: file.type }),
    });
    if (!res.ok) {
      setStatus('error');
      setErrorMsg('Could not start upload');
      return;
    }
    const { signed_url, storage_path } = await res.json();

    const uploadRes = await fetch(signed_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!uploadRes.ok) {
      setStatus('error');
      setErrorMsg('Upload failed');
      return;
    }

    setStatus('done');
    onChange(storage_path);
  }

  return (
    <div className="space-y-2">
      <Label>Logo (optional, max 5 MB)</Label>
      <input type="file" accept="image/*" onChange={handle} className="text-sm" />
      {status === 'uploading' && <p className="text-xs text-muted-foreground">Uploading {fileName}…</p>}
      {status === 'done' && <p className="text-xs text-green-600">Uploaded ✓</p>}
      {status === 'error' && <p className="text-xs text-destructive">{errorMsg}</p>}
      {status === 'done' && (
        <Button type="button" variant="outline" size="sm" onClick={() => { onChange(null); setStatus('idle'); setFileName(null); }}>
          Remove
        </Button>
      )}
    </div>
  );
}
