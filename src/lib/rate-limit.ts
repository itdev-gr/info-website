interface Options { limit: number; windowMs: number }
type HitLog = number[];

const store = new Map<string, HitLog>();

export function rateLimit(key: string, { limit, windowMs }: Options): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const existing = (store.get(key) ?? []).filter((t) => t > cutoff);

  if (existing.length >= limit) {
    const oldest = existing[0];
    store.set(key, existing);
    return { ok: false, retryAfterMs: Math.max(0, oldest + windowMs - now) };
  }

  existing.push(now);
  store.set(key, existing);
  return { ok: true };
}

export function resetRateLimiter() {
  store.clear();
}
