-- Categories become data (add/delete from the admin). Each category automatically gets a page at /<slug>.
create table bw_categories (
  slug text primary key,
  label text not null,
  description text not null default '',
  image text not null default '',
  is_prop boolean not null default false,   -- products here always carry the PROP watermark
  sort int not null default 100,
  created_at timestamptz not null default now()
);
alter table bw_categories enable row level security;
create policy "public read categories" on bw_categories for select using (true);

insert into bw_categories (slug, label, description, is_prop, sort) values
 ('staff-badges',   'Staff badges',   'Durable PVC ID cards for your team.', false, 10),
 ('student-ids',    'Student IDs',    'Photo cards with student numbers, barcodes or QR.', false, 20),
 ('visitor-passes', 'Visitor passes', 'Packs of printed passes with lanyards.', false, 30),
 ('event-badges',   'Event badges',   'Lanyard badges for conferences and events.', false, 40),
 ('prop-cards',     'Prop cards',     'For film, games and cosplay. Fictional issuers, always marked.', true, 50);

-- A category can't be deleted while products still use it (enforced in the database too).
alter table bw_products add constraint bw_products_category_fk
  foreign key (category) references bw_categories(slug) on update cascade on delete restrict;

alter table bw_orders add constraint bw_orders_status_chk
  check (status in ('received','proof_sent','printing','shipped','done','cancelled'));
