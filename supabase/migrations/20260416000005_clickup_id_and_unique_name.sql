-- Require a ClickUp task/list id on every client and enforce
-- case-insensitive unique client names.

alter table public.clients
  add column if not exists clickup_id text not null default '';

create unique index if not exists clients_name_unique_ci
  on public.clients (lower(name));
