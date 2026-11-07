-- Editable site copy/images. Public read; writes only via server (service role).
create table bw_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
alter table bw_content enable row level security;
create policy "public read content" on bw_content for select using (true);

-- Public image bucket, images only, 5 MB. Uploads go through signed URLs issued to admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site', 'site', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do nothing;
