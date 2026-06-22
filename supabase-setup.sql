-- ============================================================
-- SUPABASE FULL SETUP SQL
-- Jalankan seluruh file ini di Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  email       text,
  phone       text,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
  points      integer NOT NULL DEFAULT 0,
  tier        text NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  price       numeric(12,2) NOT NULL DEFAULT 0,
  stock       integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. TABLE: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subtotal         numeric(12,2) NOT NULL DEFAULT 0,
  discount_percent integer NOT NULL DEFAULT 0,
  discount_amount  numeric(12,2) NOT NULL DEFAULT 0,
  total_amount     numeric(12,2) NOT NULL DEFAULT 0,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. TABLE: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    integer NOT NULL DEFAULT 1,
  unit_price  numeric(12,2) NOT NULL DEFAULT 0,
  total_price numeric(12,2) NOT NULL DEFAULT 0
);

-- ============================================================
-- 5. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role      ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_orders_member_id   ON public.orders(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- ============================================================
-- 6. FUNCTION: calculate_member_tier
-- Menentukan tier berdasarkan total points
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_member_tier(p_points integer)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_points >= 7000 THEN
    RETURN 'Platinum';
  ELSIF p_points >= 3000 THEN
    RETURN 'Gold';
  ELSIF p_points >= 1000 THEN
    RETURN 'Silver';
  ELSE
    RETURN 'Bronze';
  END IF;
END;
$$;

-- ============================================================
-- 7. FUNCTION: update_member_points
-- Dipanggil saat order status berubah jadi 'completed'
-- Hitung point baru (1 point per Rp 1.000) dan update tier
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_member_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points_earned integer;
  v_new_points    integer;
  v_new_tier      text;
BEGIN
  -- Hanya proses saat status berubah MENJADI 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    -- 1 point per Rp 1.000 dari total_amount
    v_points_earned := FLOOR(NEW.total_amount / 1000);

    -- Ambil total points saat ini dan tambahkan
    SELECT points + v_points_earned INTO v_new_points
    FROM public.profiles
    WHERE id = NEW.member_id;

    -- Hitung tier baru
    v_new_tier := public.calculate_member_tier(v_new_points);

    -- Update profile
    UPDATE public.profiles
    SET
      points = v_new_points,
      tier   = v_new_tier
    WHERE id = NEW.member_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger jika sudah ada sebelumnya agar tidak duplikat
DROP TRIGGER IF EXISTS trg_update_member_points ON public.orders;

-- Buat trigger pada tabel orders
CREATE TRIGGER trg_update_member_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_member_points();

-- ============================================================
-- 8. FUNCTION + TRIGGER: Auto-create profile saat register
-- Ini adalah kunci agar login berfungsi!
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, points, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    0,
    'Bronze'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger lama jika ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Buat trigger baru
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 9. FUNCTION: updated_at auto-update trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 10. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. RLS POLICIES: profiles
-- ============================================================
-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "profiles_select_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON public.profiles;

-- Member: bisa SELECT dan UPDATE profile sendiri
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin: full access semua profiles
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Izinkan insert profile sendiri (diperlukan oleh trigger handle_new_user via SECURITY DEFINER)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 12. RLS POLICIES: products
-- ============================================================
DROP POLICY IF EXISTS "products_select_active"  ON public.products;
DROP POLICY IF EXISTS "products_admin_all"      ON public.products;

-- Semua user (termasuk guest/anon) bisa SELECT produk aktif
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Admin: full access
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 13. RLS POLICIES: orders
-- ============================================================
DROP POLICY IF EXISTS "orders_member_select"  ON public.orders;
DROP POLICY IF EXISTS "orders_member_insert"  ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all"      ON public.orders;

-- Member: SELECT dan INSERT hanya order milik sendiri
CREATE POLICY "orders_member_select"
  ON public.orders FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "orders_member_insert"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- Admin: full access
CREATE POLICY "orders_admin_all"
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 14. RLS POLICIES: order_items
-- ============================================================
DROP POLICY IF EXISTS "order_items_member_select"  ON public.order_items;
DROP POLICY IF EXISTS "order_items_member_insert"  ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_all"      ON public.order_items;

-- Member: SELECT dan INSERT hanya item dari order milik sendiri
CREATE POLICY "order_items_member_select"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.member_id = auth.uid()
    )
  );

CREATE POLICY "order_items_member_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.member_id = auth.uid()
    )
  );

-- Admin: full access
CREATE POLICY "order_items_admin_all"
  ON public.order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 15. BACKFILL: Buat profile untuk user yang sudah ada di auth.users
-- tapi belum punya profile (misal user yang sudah register sebelumnya)
-- ============================================================
INSERT INTO public.profiles (id, full_name, email, role, points, tier)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  u.email,
  COALESCE(u.raw_user_meta_data->>'role', 'member'),
  0,
  'Bronze'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;
