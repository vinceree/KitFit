-- Add product categories and complementary product pairings

-- Add category to products so brands can classify their items
alter table products add column if not exists category text
  check (category in ('jersey', 'bib_shorts', 'jacket', 'vest', 'baselayer', 'longsleeve', 'accessories', 'other'));

-- Product pairings: links a primary product to a complementary product
create table if not exists product_pairings (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  complement_id uuid not null references products(id) on delete cascade,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique(product_id, complement_id),
  check (product_id != complement_id)
);

create index idx_product_pairings_product on product_pairings(product_id);
create index idx_product_pairings_brand on product_pairings(brand_id);

-- RLS
alter table product_pairings enable row level security;

create policy "Brands can view own pairings" on product_pairings
  for select using (brand_id::text = auth.uid()::text);

create policy "Brands can insert own pairings" on product_pairings
  for insert with check (brand_id::text = auth.uid()::text);

create policy "Brands can delete own pairings" on product_pairings
  for delete using (brand_id::text = auth.uid()::text);
