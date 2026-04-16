import { describe, it, expect } from 'vitest';
import { checkFileSize, checkQuota, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from '@/lib/file-limits';

describe('checkFileSize', () => {
  it('accepts a 1 MB file', () => {
    expect(checkFileSize(1_000_000)).toEqual({ ok: true });
  });
  it('accepts exactly MAX_FILE_BYTES', () => {
    expect(checkFileSize(MAX_FILE_BYTES)).toEqual({ ok: true });
  });
  it('rejects one byte over MAX_FILE_BYTES', () => {
    expect(checkFileSize(MAX_FILE_BYTES + 1)).toEqual({ ok: false, reason: 'file_too_large' });
  });
  it('rejects zero-byte file', () => {
    expect(checkFileSize(0)).toEqual({ ok: false, reason: 'empty_file' });
  });
});

describe('checkQuota', () => {
  it('accepts when total + new fits', () => {
    expect(checkQuota(1_000_000_000, 1_000_000)).toEqual({ ok: true });
  });
  it('accepts at exactly MAX_TOTAL_BYTES', () => {
    expect(checkQuota(MAX_TOTAL_BYTES - 100, 100)).toEqual({ ok: true });
  });
  it('rejects one byte over', () => {
    expect(checkQuota(MAX_TOTAL_BYTES, 1)).toEqual({ ok: false, reason: 'quota_exceeded' });
  });
});
