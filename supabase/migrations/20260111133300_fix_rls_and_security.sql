-- EMERGENCY FIX: Recreate dropped RLS policies
-- Run this in Supabase SQL Editor NOW

-- PROFILES (critical for auth)
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (id = (select auth.uid()));
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (id = (select auth.uid()));

-- USER_SUBSCRIPTIONS (critical for auth)
DROP POLICY IF EXISTS "user_subscriptions_select" ON public.user_subscriptions;
CREATE POLICY "user_subscriptions_select" ON public.user_subscriptions FOR SELECT USING (user_id = (select auth.uid()));

-- PEPTIDES (public read)
DROP POLICY IF EXISTS "peptides_select" ON public.peptides;
CREATE POLICY "peptides_select" ON public.peptides FOR SELECT USING (true);

-- INJECTIONS
DROP POLICY IF EXISTS "injections_select" ON public.injections;
DROP POLICY IF EXISTS "injections_insert" ON public.injections;
DROP POLICY IF EXISTS "injections_update" ON public.injections;
DROP POLICY IF EXISTS "injections_delete" ON public.injections;
CREATE POLICY "injections_select" ON public.injections FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "injections_insert" ON public.injections FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "injections_update" ON public.injections FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "injections_delete" ON public.injections FOR DELETE USING (user_id = (select auth.uid()));

-- SCHEDULES
DROP POLICY IF EXISTS "schedules_select" ON public.schedules;
DROP POLICY IF EXISTS "schedules_insert" ON public.schedules;
DROP POLICY IF EXISTS "schedules_update" ON public.schedules;
DROP POLICY IF EXISTS "schedules_delete" ON public.schedules;
CREATE POLICY "schedules_select" ON public.schedules FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "schedules_insert" ON public.schedules FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "schedules_update" ON public.schedules FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "schedules_delete" ON public.schedules FOR DELETE USING (user_id = (select auth.uid()));

-- INVENTORY
DROP POLICY IF EXISTS "inventory_select" ON public.inventory;
DROP POLICY IF EXISTS "inventory_insert" ON public.inventory;
DROP POLICY IF EXISTS "inventory_update" ON public.inventory;
DROP POLICY IF EXISTS "inventory_delete" ON public.inventory;
CREATE POLICY "inventory_select" ON public.inventory FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "inventory_insert" ON public.inventory FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "inventory_update" ON public.inventory FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "inventory_delete" ON public.inventory FOR DELETE USING (user_id = (select auth.uid()));

-- REVIEWS (public read)
DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);

-- VENDORS (public read)
DROP POLICY IF EXISTS "vendors_select" ON public.vendors;
CREATE POLICY "vendors_select" ON public.vendors FOR SELECT USING (true);

-- PEPTIDE_PRICES (public read)
DROP POLICY IF EXISTS "peptide_prices_select" ON public.peptide_prices;
CREATE POLICY "peptide_prices_select" ON public.peptide_prices FOR SELECT USING (true);

-- =====================================================
-- FIX SECURITY DEFINER VIEWS 
-- These views bypass RLS which is a security risk
-- =====================================================

-- Drop and recreate admin_reviews_view without SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_reviews_view;
CREATE VIEW public.admin_reviews_view 
WITH (security_invoker = true) AS
SELECT r.*
FROM reviews r;

-- Drop and recreate admin_users_view without SECURITY DEFINER  
DROP VIEW IF EXISTS public.admin_users_view;
CREATE VIEW public.admin_users_view
WITH (security_invoker = true) AS
SELECT p.*
FROM profiles p;

SELECT 'All fixes applied!' as result;
