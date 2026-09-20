-- QuarryOS reference schema (PostgreSQL / Supabase). A starting point, not a migration that has been run.
-- Every business table carries organization_id and is protected by row-level security.

create type app_role as enum ('owner', 'admin', 'manager', 'sales', 'worker');
create type block_status as enum ('available', 'reserved', 'in_processing', 'sold', 'dispatched');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,             -- public storefront: /quarry/:slug
  created_at timestamptz not null default now()
);

create table memberships (
  user_id uuid not null references auth.users on delete cascade,
  organization_id uuid not null references organizations on delete cascade,
  role app_role not null default 'worker',
  primary key (user_id, organization_id)
);

create table quarries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  name text not null, district text, state text, country text default 'India',
  area_hectares numeric
);

create table blocks (
  id text primary key,                   -- e.g. GR-1042, also the QR payload
  organization_id uuid not null references organizations on delete cascade,
  quarry_id uuid not null references quarries,
  granite_type text not null,
  length_ft numeric not null, width_ft numeric not null, height_ft numeric not null,
  volume_cft numeric generated always as (length_ft * width_ft * height_ft) stored,
  weight_t numeric generated always as (length_ft * width_ft * height_ft * 0.0283168 * 2.7) stored,
  status block_status not null default 'available',
  price_per_cft numeric, location text, extracted_on date, notes text,
  customer_id uuid,
  is_public boolean not null default false   -- controls the public QR page and storefront
);

-- Helper: the caller's role inside an organisation
create function current_role_in(org uuid) returns app_role
language sql stable security definer set search_path = public as
$$ select role from memberships where user_id = auth.uid() and organization_id = org $$;

alter table organizations enable row level security;
alter table memberships   enable row level security;
alter table quarries      enable row level security;
alter table blocks        enable row level security;

create policy "members read their org" on organizations for select
  using (exists (select 1 from memberships m where m.organization_id = id and m.user_id = auth.uid()));
create policy "members read memberships" on memberships for select using (user_id = auth.uid());

create policy "members read blocks" on blocks for select
  using (current_role_in(organization_id) is not null);
create policy "managers and sales write blocks" on blocks for all
  using (current_role_in(organization_id) in ('owner', 'admin', 'manager', 'sales'))
  with check (current_role_in(organization_id) in ('owner', 'admin', 'manager', 'sales'));

-- Public QR page: expose only non-sensitive columns of public blocks through a view
create view public_blocks as
  select id, granite_type, length_ft, width_ft, height_ft, weight_t, status, extracted_on, organization_id
  from blocks where is_public;
grant select on public_blocks to anon;

-- Put the role in the JWT as app_metadata (writable only server-side) so the frontend can read it:
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"manager"}' where id = '...';
