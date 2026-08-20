-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 3 Schema Migration — Orders & Checkout
-- Run this in your Supabase SQL editor (safe to run multiple times)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Orders table — stores every order regardless of payment method
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Razorpay payment references (null for COD orders)
  razorpay_order_id   TEXT        UNIQUE,
  razorpay_payment_id TEXT,

  -- Customer info (captured at checkout time)
  customer_name       TEXT        NOT NULL,
  customer_email      TEXT,
  customer_phone      TEXT        NOT NULL,

  -- Full shipping address as a JSON object
  -- { line1, line2?, city, state, pincode, country }
  shipping_address    JSONB       NOT NULL DEFAULT '{}',

  -- Snapshot of cart at purchase time — never modified after creation
  -- [ { name, price, quantity, img? } ]
  items               JSONB       NOT NULL DEFAULT '[]',

  -- Financials
  subtotal            NUMERIC     NOT NULL DEFAULT 0,
  shipping_fee        NUMERIC     NOT NULL DEFAULT 0,
  total_amount        NUMERIC     NOT NULL DEFAULT 0,

  -- Lifecycle:
  --   pending      → created, payment not confirmed
  --   paid         → Razorpay confirmed payment
  --   cod_pending  → COD order placed, awaiting delivery
  --   processing   → being packed
  --   shipped      → dispatched (add tracking_number)
  --   delivered    → customer received
  --   cancelled    → cancelled before dispatch
  --   refunded     → money returned
  status              TEXT        NOT NULL DEFAULT 'pending',

  tracking_number     TEXT,
  notes               TEXT,   -- gift note or special instructions

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_set_updated_at ON orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public: can insert (create their own order) but NOT read others
DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Authenticated (admin): full access
DROP POLICY IF EXISTS "Auth full access orders" ON orders;
CREATE POLICY "Auth full access orders"
  ON orders FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 2. Add COD flag to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cod_available BOOLEAN NOT NULL DEFAULT TRUE;

-- Useful indexes for the admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer    ON orders (customer_phone);
