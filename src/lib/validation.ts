import { z } from 'zod';

export const clientNameSchema = z.string().trim().min(1).max(200);

export const newClientSchema = z.object({
  name: clientNameSchema,
  clickup_id: z.string().trim().min(1, 'ClickUp ID is required').max(100),
});
export type NewClientValues = z.infer<typeof newClientSchema>;

const trimmedString = (min = 0, max?: number) => {
  let s = z.string().trim().min(min);
  if (max !== undefined) s = s.max(max);
  return s;
};

const domainSuggestion = z.string().trim().min(1).max(253);

// Very loose phone validation — international numbers vary too much to lock down.
// Accepts digits, spaces, dashes, parentheses, dots, and a leading +.
const phoneRegex = /^[+\d][\d\s().-]{5,30}$/;

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
    contact_email: z.string().trim().min(1, 'Email is required').email('Invalid email').max(320),
    contact_phone: z
      .string()
      .trim()
      .min(1, 'Phone is required')
      .max(40)
      .refine((v) => phoneRegex.test(v), { message: 'Invalid phone number' }),
    contact_whatsapp: z
      .string()
      .trim()
      .max(40)
      .refine((v) => v === '' || phoneRegex.test(v), { message: 'Invalid WhatsApp number' })
      .transform((v) => (v === '' ? null : v))
      .nullable()
      .default(null),
    wants_whatsapp_button: z.boolean(),
    whatsapp_button_number: z
      .string()
      .trim()
      .max(40)
      .refine((v) => v === '' || phoneRegex.test(v), { message: 'Invalid WhatsApp number' })
      .transform((v) => (v === '' ? null : v))
      .nullable()
      .default(null),
    has_existing_domain: z.boolean(),
    existing_domain: z.string().trim().max(253).nullable().optional().transform((v) => v ?? null),
    domain_suggestions: z.array(domainSuggestion).max(3),
  })
  .superRefine((data, ctx) => {
    if (data.wants_whatsapp_button && !data.whatsapp_button_number) {
      ctx.addIssue({ code: 'custom', path: ['whatsapp_button_number'], message: 'WhatsApp number is required when the button is enabled' });
    }
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
