-- ============================================================
-- Phase 3 Schema: Also Featured On + Featured Column on Products
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── also_featured Table ───────────────────────────────────────
-- Each row is one "Also Featured On" card:
--   left side  = person photo + name + description
--   right side = product image + name + price + buy link
-- Admin app: add/edit/delete cards, toggle visible, set order.

CREATE TABLE IF NOT EXISTS also_featured (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_url       TEXT        NOT NULL,
  person_name     TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  product_id      UUID        REFERENCES products(id) ON DELETE SET NULL, -- internal product UUID
  product_name    TEXT        NOT NULL DEFAULT '',
  product_img     TEXT        NOT NULL DEFAULT '',
  product_link    TEXT        NOT NULL DEFAULT '',   -- kept for reference, not used for nav
  product_price   NUMERIC,
  display_order   INT         NOT NULL DEFAULT 0,
  visible         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE also_featured ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to also_featured"
  ON also_featured FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated full access to also_featured"
  ON also_featured FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed data: Shreya card — update via admin app with real URLs
INSERT INTO also_featured
  (photo_url, person_name, description, product_name, product_img, product_link, product_price, display_order, visible)
VALUES
  (
    'REPLACE_WITH_SHREYA_REVIEW_SCREENSHOT_URL',
    'Shreya',
    'on Lockup',
    'Pamela',
    'REPLACE_WITH_PAMELA_PRODUCT_IMAGE_URL',
    'REPLACE_WITH_PAMELA_BUY_LINK',
    NULL,
    1,
    TRUE
  )
ON CONFLICT DO NOTHING;

-- ── Featured column on Products ──────────────────────────────
-- Instead of a separate table, we simply add a `featured` boolean
-- to the existing products table. The admin app toggles this on
-- any product to include it in the homepage "Featured Pieces" slider.

ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

-- ── site_content additions ───────────────────────────────────
-- Section headings (editable from admin app)
INSERT INTO site_content (key, value) VALUES
  ('also_featured_heading',        'Also Featured On'),
  ('also_featured_subheading',     'Spotted on real people, real moments'),
  ('featured_pieces_heading',      'Featured Pieces'),
  ('featured_pieces_subheading',   'Curated favourites from the maison')
ON CONFLICT (key) DO NOTHING;
