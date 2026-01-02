-- ==============================================================================
-- MASTER ADMIN PANEL FIX SCRIPT (UPDATED)
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Copy ALL text in this file.
-- 2. Go to Supabase Dashboard > SQL Editor.
-- 3. Paste and click RUN.
-- 4. Refresh your admin web page.
-- ==============================================================================

-- 1. FIX SCHEMA ISSUES (Missing columns)
-- ==============================================================================
DO $$
BEGIN
    -- Add created_at to profiles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.profiles ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now());
        -- Backfill with existing data or now()
        UPDATE public.profiles SET created_at = COALESCE(updated_at, timezone('utc'::text, now())) WHERE created_at IS NULL;
    END IF;
END $$;

-- 2. FIX PERMISSIONS (Row Level Security)
-- ==============================================================================

-- Allow users to view their own profile (Critical for app to work)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING ((SELECT auth.uid()) = id);

-- Allow public to view basic profile info (Required for social features like reviews/forum)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles 
  FOR SELECT USING (true);

-- Ensure reviews are viewable
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews 
  FOR SELECT USING (true);

-- Ensure peptides are viewable
DROP POLICY IF EXISTS "Anyone can view peptides" ON peptides;
CREATE POLICY "Anyone can view peptides" ON peptides 
  FOR SELECT USING (true);

-- Ensure forum access
DROP POLICY IF EXISTS "Anyone can view forum categories" ON forum_categories;
CREATE POLICY "Anyone can view forum categories" ON forum_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view forum topics" ON forum_topics;
CREATE POLICY "Anyone can view forum topics" ON forum_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view forum posts" ON forum_posts;
CREATE POLICY "Anyone can view forum posts" ON forum_posts FOR SELECT USING (true);

-- 3. FIX ADMIN ACCESS FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 4. GRANT ADMIN PERMISSIONS
-- ==============================================================================
-- Allow admins to see ALL data in these tables
DROP POLICY IF EXISTS "Admins can view all injections" ON injections;
CREATE POLICY "Admins can view all injections" ON injections 
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all schedules" ON schedules;
CREATE POLICY "Admins can view all schedules" ON schedules 
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all inventory" ON inventory;
CREATE POLICY "Admins can view all inventory" ON inventory 
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
CREATE POLICY "Admins can manage all reviews" ON reviews 
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
CREATE POLICY "Admins can view all audit logs" ON audit_logs 
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all forum topics" ON forum_topics;
CREATE POLICY "Admins can manage all forum topics" ON forum_topics 
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all forum posts" ON forum_posts;
CREATE POLICY "Admins can manage all forum posts" ON forum_posts 
  FOR ALL USING (public.is_admin());

-- 5. VERIFY
-- ==============================================================================
SELECT 'SUCCESS! Admin panel fix applied (including Forum policies).' as status;
