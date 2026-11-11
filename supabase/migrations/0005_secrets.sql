-- Private admin settings (notification inbox, Discord webhook). RLS on with NO policies:
-- the public/anon key can't read it; only the server's service-role key can.
create table bw_secrets (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
alter table bw_secrets enable row level security;
