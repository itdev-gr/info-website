import { randomUUID } from 'node:crypto';

export interface IntakeLinkRow {
  token: string;
  client_id: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  revoked: boolean;
}

export function generateToken(): string {
  return randomUUID();
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: 'not_found' | 'expired' | 'used' | 'revoked' };

export function validateIntakeLink(row: IntakeLinkRow | null): ValidationResult {
  if (!row) return { valid: false, reason: 'not_found' };
  if (row.revoked) return { valid: false, reason: 'revoked' };
  if (row.used_at) return { valid: false, reason: 'used' };
  if (new Date(row.expires_at).getTime() < Date.now()) return { valid: false, reason: 'expired' };
  return { valid: true };
}
