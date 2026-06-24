import { describe, expect, it } from 'vitest';
import { isSuperAdminCredentials, isSuperAdminUsername } from '@/lib/super-admin';

describe('super admin credentials', () => {
  it('accepts the configured username case-insensitively', () => {
    expect(isSuperAdminUsername(' admin ')).toBe(true);
    expect(isSuperAdminUsername('ADMIN')).toBe(true);
  });

  it('requires the exact password', () => {
    expect(isSuperAdminCredentials('admin', 'poutsa')).toBe(true);
    expect(isSuperAdminCredentials('admin', ' POUTSA ')).toBe(false);
  });

  it('rejects non-admin usernames', () => {
    expect(isSuperAdminCredentials('user@example.com', 'poutsa')).toBe(false);
  });
});
