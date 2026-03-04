-- KitFit initial schema

-- Brands table
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  stripe_customer_id text,
  plan_tier text not null default 'starter' check (plan_tier in ('starter', 'growth', 'pro')),
  created_at timestamptz not null default now()
);

-- API keys table
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  key text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_api_keys_key on api_keys(key);
create index idx_api_keys_brand_id on api_keys(brand_id);

-- Products table (brand jersey/kit catalog)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  name text not null,
  image_url text not null,
  product_url text,
  created_at timestamptz not null default now()
);

create index idx_products_brand_id on products(brand_id);

-- Try-ons table (usage tracking, no PII)
create table if not exists try_ons (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  scene_preset text not null check (scene_preset in ('alpine', 'coastal', 'forest', 'urban')),
  result_image_url text,
  created_at timestamptz not null default now()
);

create index idx_try_ons_brand_id on try_ons(brand_id);
create index idx_try_ons_created_at on try_ons(created_at);

-- Row Level Security
alter table brands enable row level security;
alter table api_keys enable row level security;
alter table products enable row level security;
alter table try_ons enable row level security;

-- Policies: brands can read/update their own data
create policy "Brands can view own data" on brands
  for select using (auth.uid()::text = id::text);

create policy "Brands can update own data" on brands
  for update using (auth.uid()::text = id::text);

-- Policies: brands can manage their own API keys
create policy "Brands can view own api_keys" on api_keys
  for select using (brand_id::text = auth.uid()::text);

create policy "Brands can insert own api_keys" on api_keys
  for insert with check (brand_id::text = auth.uid()::text);

create policy "Brands can update own api_keys" on api_keys
  for update using (brand_id::text = auth.uid()::text);

-- Policies: brands can manage their own products
create policy "Brands can view own products" on products
  for select using (brand_id::text = auth.uid()::text);

create policy "Brands can insert own products" on products
  for insert with check (brand_id::text = auth.uid()::text);

create policy "Brands can update own products" on products
  for update using (brand_id::text = auth.uid()::text);

create policy "Brands can delete own products" on products
  for delete using (brand_id::text = auth.uid()::text);

-- Policies: brands can view their own try-ons
create policy "Brands can view own try_ons" on try_ons
  for select using (brand_id::text = auth.uid()::text);

-- Service role can do everything (for API routes)
-- Note: service_role key bypasses RLS by default in Supabase
