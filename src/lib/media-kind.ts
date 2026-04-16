const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg', 'heic', 'heif', 'tiff', 'tif', 'ico'];
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', 'ogv', '3gp', '3g2', 'mpg', 'mpeg', 'wmv', 'flv'];

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', avif: 'image/avif', bmp: 'image/bmp', svg: 'image/svg+xml',
  heic: 'image/heic', heif: 'image/heif', tiff: 'image/tiff', tif: 'image/tiff', ico: 'image/x-icon',
  mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', mkv: 'video/x-matroska',
  avi: 'video/x-msvideo', m4v: 'video/mp4', ogv: 'video/ogg', '3gp': 'video/3gpp', '3g2': 'video/3gpp2',
  mpg: 'video/mpeg', mpeg: 'video/mpeg', wmv: 'video/x-ms-wmv', flv: 'video/x-flv',
};

export type MediaKind = 'image' | 'video' | 'other';

function extOf(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

export function mediaKind(fileName: string, mimeType: string | null): MediaKind {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';
  const ext = extOf(fileName);
  if (IMAGE_EXT.includes(ext)) return 'image';
  if (VIDEO_EXT.includes(ext)) return 'video';
  return 'other';
}

export function guessMimeType(fileName: string, fallback?: string | null): string {
  if (fallback && fallback !== 'application/octet-stream') return fallback;
  const ext = extOf(fileName);
  return EXT_TO_MIME[ext] ?? fallback ?? 'application/octet-stream';
}
