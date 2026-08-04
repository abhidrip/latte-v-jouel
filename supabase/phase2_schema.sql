-- ============================================================
-- Phase 2 Schema: Banner + Reviews Tables
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Banner Table ─────────────────────────────────────────────
-- Single-row table for site-wide discount/announcement banner.
-- Admin app: toggle enabled, edit text and optional CTA link.

CREATE TABLE IF NOT EXISTS banner (
  id INT PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN DEFAULT FALSE,
  text TEXT DEFAULT '🎉 New collection just dropped — DM us to order',
  link TEXT DEFAULT '',
  link_label TEXT DEFAULT 'Shop Now',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Add missing column if the table already existed from a previous run
ALTER TABLE banner ADD COLUMN IF NOT EXISTS link_label TEXT DEFAULT 'Shop Now';

-- Enforce single row
CREATE UNIQUE INDEX IF NOT EXISTS banner_single_row ON banner (id);

-- RLS
ALTER TABLE banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to banner"
  ON banner FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated full access to banner"
  ON banner FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed default row
INSERT INTO banner (id, enabled, text, link, link_label)
VALUES (1, FALSE, '🎉 New collection just dropped — DM us to order', '', 'Shop Now')
ON CONFLICT (id) DO NOTHING;

-- ── Reviews Table ─────────────────────────────────────────────
-- Stores customer review screenshots and names.
-- Admin app: upload image to Storage → paste URL, enter name, set order.

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated full access to reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── site_content additions ─────────────────────────────────────
-- New keys for the reviews section heading (editable from admin app)
INSERT INTO site_content (key, value) VALUES
  ('reviews_heading', 'What they''re saying'),
  ('reviews_subheading', 'Real customers, real love')
ON CONFLICT (key) DO NOTHING;
