-- 1:1 with clients
create table public.client_submissions (
  client_id uuid primary key references public.clients(id) on delete cascade,
  logo_url text,
  description text,
  recommended_site text,
  has_existing_domain boolean not null default false,
  existing_domain text,
  domain_suggestions text[] not null default '{}',
  submitted_at timestamptz,
  constraint domain_suggestions_max_3 check (array_length(domain_suggestions, 1) is null or array_length(domain_suggestions, 1) <= 3)
);

-- many files per client
create table public.client_files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  file_name text not null,
  file_size bigint not null,
  mime_type text,
  storage_path text not null unique,
  uploaded_at timestamptz not null default now()
);
create index client_files_client_id_idx on public.client_files (client_id);

-- one row per generated intake link
create table public.intake_links (
  token uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  revoked boolean not null default false
);
create index intake_links_client_id_idx on public.intake_links (client_id);
