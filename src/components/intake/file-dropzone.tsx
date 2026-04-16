'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { guessMimeType } from '@/lib/media-kind';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  path: string;
}

interface UploadingState {
  tempId: string;
  name: string;
  progress: number;
  error?: string;
}

export function FileDropzone({ token, files, onChange }: { token: string; files: UploadedFile[]; onChange: (files: UploadedFile[]) => void }) {
  const [uploading, setUploading] = useState<UploadingState[]>([]);

  async function uploadOne(file: File) {
    const tempId = crypto.randomUUID();
    const mime = guessMimeType(file.name, file.type);
    setUploading((u) => [...u, { tempId, name: file.name, progress: 0 }]);

    const startRes = await fetch(`/api/intake/${token}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'file', file_name: file.name, size: file.size, mime_type: mime }),
    });
    if (!startRes.ok) {
      const body = await startRes.json().catch(() => ({}));
      setUploading((u) => u.map((x) => x.tempId === tempId ? { ...x, error: body.error || 'Failed to start' } : x));
      return;
    }
    const { signed_url, storage_path } = await startRes.json();

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signed_url);
    xhr.setRequestHeader('Content-Type', mime);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.round((ev.loaded / ev.total) * 100);
        setUploading((u) => u.map((x) => x.tempId === tempId ? { ...x, progress: pct } : x));
      }
    };
    await new Promise<void>((resolve, reject) => {
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`HTTP ${xhr.status}`));
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(file);
    }).catch((e) => {
      setUploading((u) => u.map((x) => x.tempId === tempId ? { ...x, error: e.message } : x));
      throw e;
    });

    const metaRes = await fetch(`/api/intake/${token}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_name: file.name, size: file.size, mime_type: mime, storage_path }),
    });
    if (!metaRes.ok) {
      setUploading((u) => u.map((x) => x.tempId === tempId ? { ...x, error: 'Metadata save failed' } : x));
      return;
    }
    const { file: meta } = await metaRes.json();

    setUploading((u) => u.filter((x) => x.tempId !== tempId));
    onChange([...files, { id: meta.id, name: meta.file_name, size: meta.file_size, mime: meta.mime_type, path: meta.storage_path }]);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => { accepted.forEach((f) => uploadOne(f)); },
  });

  async function removeFile(f: UploadedFile) {
    const res = await fetch(`/api/intake/${token}/files`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: f.id }),
    });
    if (res.ok) onChange(files.filter((x) => x.id !== f.id));
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer ${isDragActive ? 'bg-accent' : 'bg-muted/30'}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm">Drag & drop images, videos, zips, or folders here, or click to select</p>
        <p className="text-xs text-muted-foreground mt-1">Max 500 MB per file, 5 GB total. Any file type.</p>
      </div>

      {uploading.map((u) => (
        <div key={u.tempId} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="truncate">{u.name}</span>
            <span>{u.error ? 'Error' : `${u.progress}%`}</span>
          </div>
          {u.error ? <p className="text-xs text-destructive">{u.error}</p> : <Progress value={u.progress} />}
        </div>
      ))}

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between rounded border p-2 text-sm">
              <span className="truncate">{f.name} <span className="text-muted-foreground">({formatBytes(f.size)})</span></span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(f)}>Remove</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB','MB','GB'];
  let i = -1, n = bytes;
  do { n /= 1024; i++; } while (n >= 1024 && i < units.length - 1);
  return `${n.toFixed(1)} ${units[i]}`;
}
