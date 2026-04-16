import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, resetRateLimiter } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => { resetRateLimiter(); });

  it('allows first request', () => {
    expect(rateLimit('ip1', { limit: 3, windowMs: 60_000 })).toEqual({ ok: true });
  });
  it('blocks after limit', () => {
    for (let i = 0; i < 3; i++) rateLimit('ip1', { limit: 3, windowMs: 60_000 });
    expect(rateLimit('ip1', { limit: 3, windowMs: 60_000 })).toEqual({ ok: false, retryAfterMs: expect.any(Number) });
  });
  it('different keys tracked separately', () => {
    for (let i = 0; i < 3; i++) rateLimit('ip1', { limit: 3, windowMs: 60_000 });
    expect(rateLimit('ip2', { limit: 3, windowMs: 60_000 })).toEqual({ ok: true });
  });
  it('expired entries are forgotten', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 3; i++) rateLimit('ip1', { limit: 3, windowMs: 1000 });
    vi.advanceTimersByTime(1100);
    expect(rateLimit('ip1', { limit: 3, windowMs: 1000 })).toEqual({ ok: true });
    vi.useRealTimers();
  });
});
