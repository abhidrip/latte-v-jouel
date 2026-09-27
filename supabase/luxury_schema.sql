-- ============================================================
-- Luxury Section Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Luxury column on Products ──────────────────────────────
-- Toggle this on any product via the admin app to feature it
-- in the homepage "Luxury" editorial section.

ALTER TABLE products ADD COLUMN IF NOT EXISTS luxury BOOLEAN NOT NULL DEFAULT FALSE;

-- ── site_content additions ─────────────────────────────────
-- Section headings editable from admin app

INSERT INTO site_content (key, value) VALUES
  ('luxury_heading',    'The Luxury Edit'),
  ('luxury_subheading', 'Extraordinary pieces for extraordinary moments'),
  ('luxury_kicker',     'Maison Sélection')
ON CONFLICT (key) DO NOTHING;
