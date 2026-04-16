'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/browser';
import { mediaKind, guessMimeType } from '@/lib/media-kind';
import type { Database } from '@/types/database';

type ClientFile = Database['public']['Tables']['client_files']['Row'];

export function FileGallery({ files }: { files: ClientFile[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const entries = await Promise.all(
        files.map(async (f) => {
          const { data } = await supabase.storage.from('client-files').createSignedUrl(f.storage_path, 3600);
          return [f.id, data?.signedUrl ?? ''] as const;
        }),
      );
      setUrls(Object.fromEntries(entries));
    })();
  }, [files]);

  if (files.length === 0) return <p className="text-sm text-muted-foreground">No files uploaded.</p>;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {files.map((f) => {
        const url = urls[f.id];
        const kind = mediaKind(f.file_name, f.mime_type);
        return (
          <Card key={f.id} className="overflow-hidden">
            {kind === 'image' && url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={f.file_name} className="aspect-square w-full object-cover" loading="lazy" />
            ) : kind === 'video' && url ? (
              <video
                src={url}
                controls
                preload="metadata"
                className="aspect-square w-full bg-black object-cover"
              >
                <source src={url} type={guessMimeType(f.file_name, f.mime_type)} />
              </video>
            ) : (
              <div className="flex aspect-square items-center justify-center bg-muted p-2 text-center text-xs text-muted-foreground">
                {f.file_name}
              </div>
            )}
            <div className="p-2 space-y-1">
              <p className="truncate text-xs font-medium" title={f.file_name}>{f.file_name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(f.file_size)}</p>
              {url && (
                <Button asChild size="sm" variant="outline" className="w-full">
                  <a href={url} download={f.file_name}>Download</a>
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let i = -1;
  let n = bytes;
  do { n /= 1024; i++; } while (n >= 1024 && i < units.length - 1);
  return `${n.toFixed(1)} ${units[i]}`;
}
