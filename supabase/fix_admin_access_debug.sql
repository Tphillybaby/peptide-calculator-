-- ============================================
-- ADMIN PANEL ACCESS FIX - TROUBLESHOOTING GUIDE
-- ============================================
-- Run these commands in Supabase Dashboard > SQL Editor
-- 
-- ISSUE: Admin panel shows 0 users, empty reviews, etc.
-- CAUSE: Missing RLS policies for SELECT on profiles table
-- ============================================

-- STEP 1: Check current RLS policies on profiles
SELECT 'Current policies on profiles:' as info;
SELECT policyname, cmd, qual::text 
FROM pg_policies 
WHERE tablename = 'profiles';

-- STEP 2: Check if you have admin access
SELECT 'Your admin status:' as info;
SELECT id, email, is_admin 
FROM public.profiles 
WHERE id = auth.uid();

-- STEP 3: If no policies show "Users can view own profile", run the migration:
-- Apply the migration file: 20260101000009_fix_admin_panel_access.sql

-- STEP 4: Set yourself as admin (replace with your email)
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'YOUR_EMAIL@example.com';

-- STEP 5: Verify admin users
SELECT 'All admin users:' as info;
SELECT id, email, is_admin, created_at 
FROM public.profiles 
WHERE is_admin = true;

-- STEP 6: Test data access
SELECT 'Testing profile count:' as info;
SELECT COUNT(*) as total_profiles FROM public.profiles;

SELECT 'Testing review count:' as info;
SELECT COUNT(*) as total_reviews FROM public.reviews;

SELECT 'Testing reviews with profiles join:' as info;
SELECT r.id, r.rating, p.email 
FROM public.reviews r
LEFT JOIN public.profiles p ON r.user_id = p.id
LIMIT 5;

-- ============================================
-- QUICK FIX: Run these if migration not applied
-- ============================================

-- Add missing SELECT policy for profiles
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- Recreate is_admin function
-- CREATE OR REPLACE FUNCTION public.is_admin()
-- RETURNS boolean AS $$
-- BEGIN
--   IF auth.uid() IS NULL THEN RETURN false; END IF;
--   RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true);
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;
