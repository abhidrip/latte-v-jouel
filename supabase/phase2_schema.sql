-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 2 Schema Migration — Product Experience
-- Run this in your Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Add new columns to products table
-- (uses IF NOT EXISTS guards so it's safe to run more than once)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS material TEXT,
  ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS featured_in_search BOOLEAN DEFAULT TRUE;

-- 2. Product images table — supports multiple images per product with ordering
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,  -- 0 = primary / gallery order
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read product_images" ON product_images;
CREATE POLICY "Public read product_images"
  ON product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth write product_images" ON product_images;
CREATE POLICY "Auth write product_images"
  ON product_images FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Index for fast per-product lookups (the most common query)
CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images (product_id, sort_order);

-- 3. Back-fill existing single images into product_images
--    Only inserts rows that don't already exist (idempotent)
INSERT INTO product_images (product_id, url, alt, sort_order)
SELECT
  p.id,
  p.img,
  p.name,
  0
FROM products p
WHERE p.img IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.sort_order = 0
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- Admin prompt (add to your AI Studio admin app):
-- ═══════════════════════════════════════════════════════════════════════════
-- "Add a Product Images section to the product edit page.
--  Allow uploading multiple images per product (up to 6).
--  Images should be stored in the product_images table with columns:
--  product_id (UUID), url (TEXT), alt (TEXT), sort_order (INTEGER).
--  Show a drag-to-reorder thumbnail strip. The image with sort_order=0
--  is the primary image shown in the shop grid.
--
--  Also add these fields to the product edit form:
--  - description (TEXT, multiline textarea)
--  - material (TEXT, e.g. 'Gold-plated brass', 'Sterling silver')
--  - stock (INTEGER, nullable — null means 'contact for availability')
--  - sizes (TEXT array, comma-separated input, e.g. '6,7,8,9,10,11,12')
--
--  In the products list table, add a Stock column showing:
--  - a green dot for stock > 3
--  - an orange dot for stock 1-3 ('Low Stock')
--  - a red dot for stock = 0 or sold = true ('Sold Out')
--  - a grey dash for stock = null"
