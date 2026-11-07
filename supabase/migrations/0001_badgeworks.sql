-- Products: public read. Orders: written only by the server (service role); no public policies.
create table bw_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind text not null check (kind in ('badge','prop')),
  description text not null default '',
  price_cents int not null check (price_cents > 0),
  image text not null default '',
  badge text,                       -- e.g. 'SALE'
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table bw_orders (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  contact_name text not null,
  email text not null,
  notes text not null default '',
  total_cents int not null,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create table bw_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references bw_orders(id) on delete cascade,
  product_id uuid not null references bw_products(id),
  qty int not null check (qty between 1 and 5000),
  unit_cents int not null
);

alter table bw_products enable row level security;
alter table bw_orders enable row level security;
alter table bw_order_items enable row level security;
create policy "public read active products" on bw_products for select using (active);

-- Seed. Prop cards use FICTIONAL issuers only and are watermarked in the UI.
insert into bw_products (slug, name, kind, description, price_cents, badge) values
 ('staff-badge-pvc', 'Staff Badge (PVC, photo)', 'badge', 'CR80 PVC card, full-colour front, photo + name + role, optional barcode or QR.', 450, null),
 ('student-id-card', 'Student ID Card', 'badge', 'Durable CR80 card with photo, student number and magnetic stripe option.', 380, 'SALE'),
 ('visitor-pass-pack', 'Visitor Pass Pack (50)', 'badge', 'Pack of 50 printed visitor passes with lanyards.', 6500, null),
 ('event-lanyard-badge', 'Event Lanyard Badge', 'badge', 'Printed event badge with lanyard, minimum 25.', 520, null),
 ('prop-detective-license', 'Prop: Detective Licence', 'prop', 'Film/game prop from the fictional "Republic of Eldoria". Marked PROP – NOT A GOVERNMENT ID.', 1500, null),
 ('prop-space-academy', 'Prop: Space Academy Cadet ID', 'prop', 'Sci-fi cosplay card for a fictional academy. Marked PROP – NOT A GOVERNMENT ID.', 1200, 'SALE');
