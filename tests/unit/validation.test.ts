import { describe, it, expect } from 'vitest';
import { intakeFormSchema, clientNameSchema, newClientSchema } from '@/lib/validation';

describe('clientNameSchema', () => {
  it('accepts a normal name', () => {
    expect(clientNameSchema.safeParse('Acme Co').success).toBe(true);
  });
  it('trims whitespace', () => {
    const parsed = clientNameSchema.parse('  Acme  ');
    expect(parsed).toBe('Acme');
  });
  it('rejects empty string', () => {
    expect(clientNameSchema.safeParse('').success).toBe(false);
  });
  it('rejects >200 chars', () => {
    expect(clientNameSchema.safeParse('a'.repeat(201)).success).toBe(false);
  });
});

describe('newClientSchema', () => {
  it('accepts a valid payload', () => {
    const r = newClientSchema.safeParse({ name: 'Acme', clickup_id: '86a7xy' });
    expect(r.success).toBe(true);
  });
  it('rejects missing clickup_id', () => {
    expect(newClientSchema.safeParse({ name: 'Acme' }).success).toBe(false);
  });
  it('rejects empty clickup_id', () => {
    expect(newClientSchema.safeParse({ name: 'Acme', clickup_id: '   ' }).success).toBe(false);
  });
  it('rejects empty name', () => {
    expect(newClientSchema.safeParse({ name: '', clickup_id: 'abc' }).success).toBe(false);
  });
  it('trims both fields', () => {
    const r = newClientSchema.parse({ name: '  Acme  ', clickup_id: '  86a7  ' });
    expect(r.name).toBe('Acme');
    expect(r.clickup_id).toBe('86a7');
  });
});

describe('intakeFormSchema', () => {
  const base = {
    description: 'A description.',
    recommended_site: 'https://example.com',
    has_existing_domain: true,
    existing_domain: 'acme.com',
    domain_suggestions: [],
  };

  it('accepts full valid payload', () => {
    expect(intakeFormSchema.safeParse(base).success).toBe(true);
  });
  it('requires existing_domain when has_existing_domain is true', () => {
    const parsed = intakeFormSchema.safeParse({ ...base, existing_domain: '' });
    expect(parsed.success).toBe(false);
  });
  it('requires 1-3 domain_suggestions when has_existing_domain is false', () => {
    const noDomain = { ...base, has_existing_domain: false, existing_domain: null };
    expect(intakeFormSchema.safeParse({ ...noDomain, domain_suggestions: [] }).success).toBe(false);
    expect(intakeFormSchema.safeParse({ ...noDomain, domain_suggestions: ['a.com'] }).success).toBe(true);
    expect(intakeFormSchema.safeParse({ ...noDomain, domain_suggestions: ['a.com','b.com','c.com'] }).success).toBe(true);
    expect(intakeFormSchema.safeParse({ ...noDomain, domain_suggestions: ['a','b','c','d'] }).success).toBe(false);
  });
  it('rejects non-URL recommended_site', () => {
    expect(intakeFormSchema.safeParse({ ...base, recommended_site: 'not a url' }).success).toBe(false);
  });
  it('accepts empty recommended_site (optional)', () => {
    const parsed = intakeFormSchema.parse({ ...base, recommended_site: '' });
    expect(parsed.recommended_site).toBe(null);
  });
  it('accepts missing recommended_site key', () => {
    const { recommended_site: _drop, ...rest } = base; void _drop;
    const parsed = intakeFormSchema.parse(rest);
    expect(parsed.recommended_site).toBe(null);
  });
  it('trims description', () => {
    const parsed = intakeFormSchema.parse({ ...base, description: '  hello  ' });
    expect(parsed.description).toBe('hello');
  });
});
