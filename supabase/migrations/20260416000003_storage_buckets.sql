-- Private bucket for client logos
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-logos', 'client-logos', false, 5 * 1024 * 1024)
on conflict (id) do nothing;

-- Private bucket for client files (images, zips)
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-files', 'client-files', false, 500 * 1024 * 1024)
on conflict (id) do nothing;
