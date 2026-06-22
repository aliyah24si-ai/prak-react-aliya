-- ============================================================
-- SEDAP ADMIN & MEMBER MANAGEMENT SYSTEM
-- Full DDL: Tables, Indexes, Functions, Triggers, RLS
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('admin', 'member', 'guest')),
  points      INTEGER NOT NULL DEFAULT 0,
  tier        TEXT NOT NULL DEFAULT 'Bronze'
                  CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role   ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_tier   ON profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_email  ON profiles(email);

-- ============================================================
-- 2. TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name      ON products(name);

-- ============================================================
-- 3. TABLE: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  subtotal         NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  discount_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_member_id ON orders(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created   ON orders(created_at DESC);

-- ============================================================
-- 4. TABLE: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================================
-- 5. TABLE: point_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  description   TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_tx_member_id ON point_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_point_tx_created   ON point_transactions(created_at DESC);

-- ============================================================
-- 6. FUNCTIONS
-- ============================================================

-- Function: Calculate tier from point total
CREATE OR REPLACE FUNCTION calculate_member_tier(p_points INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE
    WHEN p_points >= 7000 THEN 'Platinum'
    WHEN p_points >= 3000 THEN 'Gold'
    WHEN p_points >= 1000 THEN 'Silver'
    ELSE 'Bronze'
  END;
END;
$$;

-- Function: Auto-create profile on new auth.users row
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role, points, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'member'),
    0,
    'Bronze'
  );
  RETURN NEW;
END;
$$;

-- Function: Award points + update tier when order becomes 'completed'
CREATE OR REPLACE FUNCTION update_member_points_and_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_earned_points  INTEGER;
  v_current_points INTEGER;
  v_new_tier       TEXT;
  v_order_desc     TEXT;
BEGIN
  -- Only fire when status changes TO 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN

    -- floor(total_amount / 1000)
    v_earned_points := FLOOR(NEW.total_amount / 1000)::INTEGER;

    IF v_earned_points > 0 THEN
      -- Update member points
      UPDATE profiles
      SET points = points + v_earned_points
      WHERE id = NEW.member_id
      RETURNING points INTO v_current_points;

      -- Recalculate tier
      v_new_tier := calculate_member_tier(v_current_points);

      UPDATE profiles
      SET tier = v_new_tier
      WHERE id = NEW.member_id;

      -- Log to point_transactions
      v_order_desc := 'Points from order #' || LEFT(NEW.id::TEXT, 8);
      INSERT INTO point_transactions (member_id, order_id, points_earned, description)
      VALUES (NEW.member_id, NEW.id, v_earned_points, v_order_desc);
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

-- Trigger: Auto-create profile on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger: Award points when order status -> 'completed'
CREATE OR REPLACE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_member_points_and_tier();

-- Trigger: Auto-update updated_at on orders
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8a. PROFILES policies
-- ============================================================

-- Admin: full access
CREATE POLICY profiles_admin_all
  ON profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Member: select own profile
CREATE POLICY profiles_member_select_own
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Member: update own profile
CREATE POLICY profiles_member_update_own
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- 8b. PRODUCTS policies
-- ============================================================

-- Anyone (guest/member/admin): select active products
CREATE POLICY products_select_active
  ON products FOR SELECT
  USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Admin: full access
CREATE POLICY products_admin_all
  ON products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 8c. ORDERS policies
-- ============================================================

-- Admin: full access
CREATE POLICY orders_admin_all
  ON orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Member: select own orders
CREATE POLICY orders_member_select_own
  ON orders FOR SELECT
  USING (member_id = auth.uid());

-- Member: insert own orders
CREATE POLICY orders_member_insert_own
  ON orders FOR INSERT
  WITH CHECK (member_id = auth.uid());

-- ============================================================
-- 8d. ORDER_ITEMS policies
-- ============================================================

-- Admin: full access
CREATE POLICY order_items_admin_all
  ON order_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Member: select items of own orders
CREATE POLICY order_items_member_select_own
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND member_id = auth.uid())
  );

-- Member: insert items into own orders
CREATE POLICY order_items_member_insert_own
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND member_id = auth.uid())
  );

-- ============================================================
-- 8e. POINT_TRANSACTIONS policies
-- ============================================================

-- Admin: full access
CREATE POLICY point_tx_admin_all
  ON point_transactions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Member: select own point transactions
CREATE POLICY point_tx_member_select_own
  ON point_transactions FOR SELECT
  USING (member_id = auth.uid());
