import { headers } from 'next/headers';

/**
 * Preferred origin for outbound URLs (intake links, email links).
 * Priority: NEXT_PUBLIC_APP_URL (if set and not localhost) > forwarded host > request URL.
 */
export function originFromRequest(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured && !/^https?:\/\/localhost/i.test(configured)) return configured;
  return new URL(request.url).origin;
}

export async function originFromHeaders(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured && !/^https?:\/\/localhost/i.test(configured)) return configured;
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}
