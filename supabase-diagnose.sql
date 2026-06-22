-- ============================================================
-- DIAGNOSTIC: Jalankan ini dulu untuk cek kondisi saat ini
-- ============================================================

-- 1. Cek apakah trigger on_auth_user_created sudah ada
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Cek semua user di auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. Cek semua profiles yang ada
SELECT id, full_name, email, role, points, tier
FROM public.profiles
ORDER BY created_at DESC;

-- 4. Cek apakah ada user di auth.users tapi TIDAK punya profile
SELECT u.id, u.email, u.created_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- 5. Cek RLS policies pada tabel profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 6. Cek apakah RLS aktif
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('profiles', 'products', 'orders', 'order_items');
