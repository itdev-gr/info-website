-- Enable RLS on all dashboard tables
alter table public.clients enable row level security;
alter table public.client_submissions enable row level security;
alter table public.client_files enable row level security;
alter table public.intake_links enable row level security;

-- Authenticated users can do everything on client-related tables
create policy "authenticated can select clients" on public.clients for select to authenticated using (true);
create policy "authenticated can insert clients" on public.clients for insert to authenticated with check (true);
create policy "authenticated can update clients" on public.clients for update to authenticated using (true) with check (true);
create policy "authenticated can delete clients" on public.clients for delete to authenticated using (true);

create policy "authenticated can select submissions" on public.client_submissions for select to authenticated using (true);
create policy "authenticated can update submissions" on public.client_submissions for update to authenticated using (true) with check (true);
create policy "authenticated can delete submissions" on public.client_submissions for delete to authenticated using (true);

create policy "authenticated can select files" on public.client_files for select to authenticated using (true);
create policy "authenticated can delete files" on public.client_files for delete to authenticated using (true);

-- Anonymous users get NO policies on these tables — all anon writes go through service role in API routes.

-- Storage policies: authenticated users can read/write in both buckets.
create policy "authenticated can select client-logos"
  on storage.objects for select to authenticated
  using (bucket_id = 'client-logos');
create policy "authenticated can insert client-logos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'client-logos');
create policy "authenticated can delete client-logos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'client-logos');

create policy "authenticated can select client-files"
  on storage.objects for select to authenticated
  using (bucket_id = 'client-files');
create policy "authenticated can insert client-files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'client-files');
create policy "authenticated can delete client-files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'client-files');
