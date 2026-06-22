-- ============================================================
-- SUPABASE FINAL SETUP - JALANKAN INI DI SQL EDITOR
-- Sesuai PRD: Admin & Member Management System
-- ============================================================

-- ============================================================
-- STEP 1: DROP semua policy lama (bersih total)
-- ============================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname 
           FROM pg_policies 
           WHERE schemaname = 'public' 
             AND tablename IN ('profiles','products','orders','order_items','point_transactions')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- STEP 2: Buat/pastikan semua tabel ada
-- ============================================================

-- TABLE: profiles
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

-- TABLE: products
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

-- TABLE: orders
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

-- TABLE: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    integer NOT NULL DEFAULT 1,
  unit_price  numeric(12,2) NOT NULL DEFAULT 0,
  total_price numeric(12,2) NOT NULL DEFAULT 0
);

-- TABLE: point_transactions
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id       uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  points_earned  integer NOT NULL DEFAULT 0,
  description    text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- STEP 3: Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_orders_member_id     ON public.orders(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product  ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active   ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_pt_member_id         ON public.point_transactions(member_id);

-- ============================================================
-- STEP 4: Helper function (hindari infinite recursion di RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- STEP 5: Function calculate_member_tier
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_member_tier(p_points integer)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_points >= 7000 THEN RETURN 'Platinum';
  ELSIF p_points >= 3000 THEN RETURN 'Gold';
  ELSIF p_points >= 1000 THEN RETURN 'Silver';
  ELSE RETURN 'Bronze';
  END IF;
END;
$$;

-- ============================================================
-- STEP 6: Trigger auto-create profile saat register
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 7: Trigger updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
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
-- STEP 8: Trigger update point + tier + catat ke point_transactions
-- Dipanggil saat order status berubah jadi 'completed'
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
    -- 1 point per Rp 1.000
    v_points_earned := GREATEST(0, FLOOR(NEW.total_amount / 1000)::integer);

    SELECT COALESCE(points, 0) + v_points_earned INTO v_new_points
    FROM public.profiles WHERE id = NEW.member_id;

    v_new_tier := public.calculate_member_tier(v_new_points);

    -- Update profile: points + tier
    UPDATE public.profiles
    SET points = v_new_points, tier = v_new_tier
    WHERE id = NEW.member_id;

    -- Catat transaksi point
    INSERT INTO public.point_transactions (member_id, order_id, points_earned, description)
    VALUES (
      NEW.member_id,
      NEW.id,
      v_points_earned,
      'Points from order #' || LEFT(NEW.id::text, 8)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_member_points ON public.orders;
CREATE TRIGGER trg_update_member_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_member_points();

-- ============================================================
-- STEP 9: Enable RLS pada semua tabel
-- ============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 10: RLS POLICIES - profiles
-- ============================================================

-- Setiap user bisa SELECT profile sendiri
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Setiap user bisa UPDATE profile sendiri
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger butuh INSERT (via SECURITY DEFINER, tapi tetap butuh policy)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin: akses penuh ke semua profiles
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 11: RLS POLICIES - products
-- ============================================================

-- Semua orang (authenticated) bisa SELECT produk aktif
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Admin: full access (SELECT semua + INSERT/UPDATE/DELETE)
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 12: RLS POLICIES - orders
-- ============================================================

-- Member: SELECT hanya order sendiri
CREATE POLICY "orders_member_select"
  ON public.orders FOR SELECT
  USING (auth.uid() = member_id);

-- Member: INSERT order sendiri
CREATE POLICY "orders_member_insert"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- Admin: full access
CREATE POLICY "orders_admin_all"
  ON public.orders FOR ALL
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 13: RLS POLICIES - order_items
-- ============================================================

-- Member: SELECT item dari order milik sendiri
CREATE POLICY "order_items_member_select"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.member_id = auth.uid()
    )
  );

-- Member: INSERT item ke order milik sendiri
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
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 14: RLS POLICIES - point_transactions
-- ============================================================

-- Member: SELECT transaksi milik sendiri
CREATE POLICY "pt_member_select"
  ON public.point_transactions FOR SELECT
  USING (auth.uid() = member_id);

-- Admin: full access
CREATE POLICY "pt_admin_all"
  ON public.point_transactions FOR ALL
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 15: Backfill - buat profile untuk user yang sudah ada
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

-- ============================================================
-- STEP 16: Verifikasi hasil akhir
-- ============================================================
SELECT 
  u.email,
  p.full_name,
  p.role,
  p.tier,
  p.points,
  CASE WHEN p.id IS NULL THEN '❌ MISSING PROFILE' ELSE '✅ OK' END AS status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
