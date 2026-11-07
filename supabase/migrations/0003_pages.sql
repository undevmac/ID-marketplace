-- Page builder: each page is a JSON stack of blocks. Writes via server (service role) only.
create table bw_pages (
  slug text primary key,
  title text not null,
  nav boolean not null default false,
  published boolean not null default true,
  blocks jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
alter table bw_pages enable row level security;
create policy "public read published pages" on bw_pages for select using (published);

-- Products belong to a category page.
alter table bw_products add column category text not null default 'staff-badges';
update bw_products set category = case slug
  when 'staff-badge-pvc' then 'staff-badges'
  when 'student-id-card' then 'student-ids'
  when 'visitor-pass-pack' then 'visitor-passes'
  when 'event-lanyard-badge' then 'event-badges'
  else 'prop-cards' end;
