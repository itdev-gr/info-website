import { describe, it, expect } from 'vitest';
import { generateToken, validateIntakeLink, type IntakeLinkRow } from '@/lib/tokens';

describe('generateToken', () => {
  it('returns a uuid v4', () => {
    const token = generateToken();
    expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it('returns different tokens on successive calls', () => {
    expect(generateToken()).not.toBe(generateToken());
  });
});

function makeRow(partial: Partial<IntakeLinkRow> = {}): IntakeLinkRow {
  return {
    token: 'abc',
    client_id: 'cid',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400_000).toISOString(),
    used_at: null,
    revoked: false,
    ...partial,
  };
}

describe('validateIntakeLink', () => {
  it('valid when not expired, not used, not revoked', () => {
    expect(validateIntakeLink(makeRow())).toEqual({ valid: true });
  });
  it('invalid when expired', () => {
    const row = makeRow({ expires_at: new Date(Date.now() - 1000).toISOString() });
    expect(validateIntakeLink(row)).toEqual({ valid: false, reason: 'expired' });
  });
  it('invalid when already used', () => {
    const row = makeRow({ used_at: new Date().toISOString() });
    expect(validateIntakeLink(row)).toEqual({ valid: false, reason: 'used' });
  });
  it('invalid when revoked', () => {
    const row = makeRow({ revoked: true });
    expect(validateIntakeLink(row)).toEqual({ valid: false, reason: 'revoked' });
  });
  it('revoked takes precedence over expired', () => {
    const row = makeRow({ revoked: true, expires_at: new Date(0).toISOString() });
    expect(validateIntakeLink(row)).toEqual({ valid: false, reason: 'revoked' });
  });
  it('null row returns not-found', () => {
    expect(validateIntakeLink(null)).toEqual({ valid: false, reason: 'not_found' });
  });
});
