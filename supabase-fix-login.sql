-- ============================================================
-- FIX LOGIN: Jalankan ini di Supabase SQL Editor
-- ============================================================

-- STEP 1: Buat/update trigger auto-create profile saat register
-- (ini yang paling sering jadi root cause login gagal)
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
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 2: Backfill - buat profile untuk user yang sudah ada
-- tapi belum punya row di profiles
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

-- STEP 3: Pastikan RLS aktif
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- STEP 4: Drop semua policy lama di profiles lalu buat ulang yang benar
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON public.profiles;
-- Hapus juga nama-nama policy lain yang mungkin sudah ada sebelumnya
DROP POLICY IF EXISTS "Enable read access for all users"   ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated"    ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"         ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"       ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access"       ON public.profiles;

-- Policy: user bisa SELECT profile sendiri
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: user bisa UPDATE profile sendiri
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: user bisa INSERT profile sendiri (untuk trigger)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: admin bisa akses semua profiles
-- Pakai subquery dengan SECURITY DEFINER function untuk hindari infinite recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');

-- STEP 5: Verifikasi hasil - cek profiles yang ada sekarang
SELECT id, full_name, email, role, points, tier
FROM public.profiles
ORDER BY created_at DESC;

-- ============================================================
-- STEP 6: Pastikan tabel point_transactions ada dan RLS-nya benar
-- ============================================================
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id       uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  points_earned  integer NOT NULL DEFAULT 0,
  description    text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pt_member_select" ON public.point_transactions;
DROP POLICY IF EXISTS "pt_admin_all"     ON public.point_transactions;

CREATE POLICY "pt_member_select"
  ON public.point_transactions FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "pt_admin_all"
  ON public.point_transactions FOR ALL
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 7: Fix RLS products - izinkan SELECT untuk semua (termasuk anon)
-- ============================================================
DROP POLICY IF EXISTS "products_select_active"  ON public.products;
DROP POLICY IF EXISTS "products_admin_all"       ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

-- Semua orang bisa lihat produk aktif
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 8: Fix RLS orders
-- ============================================================
DROP POLICY IF EXISTS "orders_member_select" ON public.orders;
DROP POLICY IF EXISTS "orders_member_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all"     ON public.orders;

CREATE POLICY "orders_member_select"
  ON public.orders FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "orders_member_insert"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "orders_admin_all"
  ON public.orders FOR ALL
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 9: Fix RLS order_items
-- ============================================================
DROP POLICY IF EXISTS "order_items_member_select" ON public.order_items;
DROP POLICY IF EXISTS "order_items_member_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_all"     ON public.order_items;

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

CREATE POLICY "order_items_admin_all"
  ON public.order_items FOR ALL
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 10: Update trigger update_member_points agar juga
-- insert ke point_transactions
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
    v_points_earned := GREATEST(0, FLOOR(NEW.total_amount / 1000)::integer);

    SELECT points + v_points_earned INTO v_new_points
    FROM public.profiles WHERE id = NEW.member_id;

    v_new_tier := public.calculate_member_tier(v_new_points);

    -- Update profile
    UPDATE public.profiles
    SET points = v_new_points, tier = v_new_tier
    WHERE id = NEW.member_id;

    -- Catat ke point_transactions
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
  FOR EACH ROW
  EXECUTE FUNCTION public.update_member_points();
