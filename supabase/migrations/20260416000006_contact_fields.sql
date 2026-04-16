-- Client contact fields collected in the intake form.
-- email + phone are required at the app layer; whatsapp is optional.
alter table public.client_submissions
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists contact_whatsapp text;
