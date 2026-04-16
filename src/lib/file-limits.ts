export const MAX_FILE_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_TOTAL_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

export type LimitResult = { ok: true } | { ok: false; reason: 'empty_file' | 'file_too_large' | 'quota_exceeded' };

export function checkFileSize(bytes: number): LimitResult {
  if (bytes <= 0) return { ok: false, reason: 'empty_file' };
  if (bytes > MAX_FILE_BYTES) return { ok: false, reason: 'file_too_large' };
  return { ok: true };
}

export function checkQuota(currentTotal: number, addition: number): LimitResult {
  if (currentTotal + addition > MAX_TOTAL_BYTES) return { ok: false, reason: 'quota_exceeded' };
  return { ok: true };
}
