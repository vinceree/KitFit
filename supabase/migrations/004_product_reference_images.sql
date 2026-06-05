-- Product reference images: allows brands to select which product images
-- are sent to the AI for virtual try-on generation (up to 3 per product).

create table if not exists product_reference_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  position smallint not null default 0,
  created_at timestamptz default now()
);

create index idx_product_ref_images_product on product_reference_images(product_id);

-- Enforce max 3 reference images per product via a partial unique index
-- on (product_id, position) where position < 3.
alter table product_reference_images
  add constraint max_3_per_product
  check (position >= 0 and position < 3);

-- Prevent duplicate URLs for the same product
create unique index idx_product_ref_images_unique_url
  on product_reference_images(product_id, image_url);
