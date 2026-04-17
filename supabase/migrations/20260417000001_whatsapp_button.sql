-- Whether the client wants a WhatsApp chat button on their website,
-- and which number it should connect to.
alter table public.client_submissions
  add column if not exists wants_whatsapp_button boolean not null default false,
  add column if not exists whatsapp_button_number text;
