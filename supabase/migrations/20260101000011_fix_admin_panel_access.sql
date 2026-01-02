-- Migration: 20260101000009_fix_admin_panel_access.sql
-- Description: Fixes admin panel not loading users, reviews, etc.
-- 
-- ROOT CAUSE: The profiles table only had an admin-only SELECT policy.
-- Regular users couldn't view their own profile, and admins couldn't
-- see profile details in joined queries (e.g., reviews with user info).
--
-- This migration adds proper RLS policies to:
-- 1. Allow users to view their own profile
-- 2. Allow public viewing of basic profile info (for reviews, forum posts, etc.)
-- 3. Ensure admins can properly access all data

-- ============================================
-- 1. PROFILES TABLE - Add missing SELECT policies
-- ============================================

-- Users can view their own profile (CRITICAL - this was missing!)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING ((SELECT auth.uid()) = id);

-- Public profiles - allow anyone to see basic profile info for social features
-- This is needed for reviews, forum posts, etc. to show author names
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles 
  FOR SELECT USING (true);

-- Note: The "Admins can view all profiles" policy from previous migration 
-- is now redundant since public profiles are viewable, but we'll keep it
-- for explicit admin capability.

-- ============================================
-- 2. REVIEWS TABLE - Ensure proper access
-- ============================================

-- Ensure anyone can view reviews (public feature)
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews 
  FOR SELECT USING (true);

-- ============================================
-- 3. PEPTIDES TABLE - Ensure proper access
-- ============================================

-- Ensure anyone can view peptides (public feature)
DROP POLICY IF EXISTS "Anyone can view peptides" ON peptides;
CREATE POLICY "Anyone can view peptides" ON peptides 
  FOR SELECT USING (true);

-- ============================================
-- 4. FIX is_admin FUNCTION - Ensure it works with RLS
-- ============================================

-- Recreate the is_admin function with proper security settings
-- SECURITY DEFINER allows it to bypass RLS when checking admin status
-- STABLE indicates the function result is consistent within a single query
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- If not authenticated, not an admin
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has admin flag set
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================
-- 5. VERIFY/UPDATE ADMIN POLICIES
-- ============================================

-- Ensure admin SELECT policies exist for all admin-managed tables
-- These use OR with is_admin() to allow admins to see all records

-- Injections - admins can view all
DROP POLICY IF EXISTS "Admins can view all injections" ON injections;
CREATE POLICY "Admins can view all injections" ON injections 
  FOR SELECT USING (public.is_admin());

-- Schedules - admins can view all
DROP POLICY IF EXISTS "Admins can view all schedules" ON schedules;
CREATE POLICY "Admins can view all schedules" ON schedules 
  FOR SELECT USING (public.is_admin());

-- Inventory - admins can view all
DROP POLICY IF EXISTS "Admins can view all inventory" ON inventory;
CREATE POLICY "Admins can view all inventory" ON inventory 
  FOR SELECT USING (public.is_admin());

-- Reviews - admins can manage all (view, update, delete)
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
CREATE POLICY "Admins can manage all reviews" ON reviews 
  FOR ALL USING (public.is_admin());

-- ============================================
-- 6. GRANT TABLE ACCESS
-- ============================================

-- Ensure authenticated users can access these tables
GRANT SELECT ON public.profiles TO authenticated, anon;
GRANT SELECT ON public.reviews TO authenticated, anon;
GRANT SELECT ON public.peptides TO authenticated, anon;

-- Admins need full access for management
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.peptides TO authenticated;
GRANT ALL ON public.injections TO authenticated;
GRANT ALL ON public.schedules TO authenticated;
GRANT ALL ON public.inventory TO authenticated;

-- ============================================
-- DONE
-- ============================================
