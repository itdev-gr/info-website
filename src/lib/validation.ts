import { z } from 'zod';

export const clientNameSchema = z.string().trim().min(1).max(200);

const trimmedString = (min = 0, max?: number) => {
  let s = z.string().trim().min(min);
  if (max !== undefined) s = s.max(max);
  return s;
};

const domainSuggestion = z.string().trim().min(1).max(253);

export const intakeFormSchema = z
  .object({
    description: trimmedString(1, 5_000),
    recommended_site: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === '' || /^https?:\/\/[^\s]+$/i.test(v), { message: 'Must be a valid http(s) URL' })
      .transform((v) => (v === '' ? null : v))
      .nullable()
      .default(null),
    has_existing_domain: z.boolean(),
    existing_domain: z.string().trim().max(253).nullable().optional().transform((v) => v ?? null),
    domain_suggestions: z.array(domainSuggestion).max(3),
  })
  .superRefine((data, ctx) => {
    if (data.has_existing_domain) {
      if (!data.existing_domain || data.existing_domain.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['existing_domain'], message: 'Required when has_existing_domain is true' });
      }
    } else {
      if (data.domain_suggestions.length < 1) {
        ctx.addIssue({ code: 'custom', path: ['domain_suggestions'], message: 'At least one suggestion required' });
      }
    }
  });

export type IntakeFormValues = z.infer<typeof intakeFormSchema>;
