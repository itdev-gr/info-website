-- Client status enum
create type public.client_status as enum ('invited', 'submitted', 'archived');

-- Clients table
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status public.client_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- index for dashboard listing
create index clients_created_at_desc_idx on public.clients (created_at desc);
