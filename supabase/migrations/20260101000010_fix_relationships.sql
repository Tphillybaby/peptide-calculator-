-- Migration: 20260101000010_fix_relationships.sql
-- Description: Adds foreign key relationships needed for admin panel joins
-- Also adds created_at to profiles table

-- ============================================
-- 1. Add created_at to profiles table
-- ============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Backfill created_at from updated_at for existing records
UPDATE public.profiles 
SET created_at = COALESCE(updated_at, timezone('utc'::text, now()))
WHERE created_at IS NULL;

-- ============================================
-- 2. Add peptide_id column to reviews if it doesn't exist
-- This allows proper foreign key relationship
-- ============================================
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS peptide_id uuid REFERENCES public.peptides(id);

-- Try to link existing reviews to peptides by name
UPDATE public.reviews r
SET peptide_id = p.id
FROM public.peptides p
WHERE r.peptide_name = p.name AND r.peptide_id IS NULL;

-- ============================================
-- 3. Create explicit foreign key for user_id -> profiles
-- The user_id already references auth.users, we need a view or explicit hint
-- ============================================

-- Since reviews.user_id references auth.users (not profiles directly),
-- and profiles.id also references auth.users, they're related but PostgREST
-- doesn't automatically see this. 

-- Solution: Create a view that explicitly joins them
DROP VIEW IF EXISTS admin_reviews_view;
CREATE VIEW admin_reviews_view AS
SELECT 
    r.id,
    r.user_id,
    r.peptide_name,
    r.peptide_id,
    r.rating,
    r.comment,
    r.created_at,
    p.email as user_email,
    p.full_name as user_full_name,
    pep.name as peptide_display_name
FROM public.reviews r
LEFT JOIN public.profiles p ON r.user_id = p.id
LEFT JOIN public.peptides pep ON r.peptide_id = pep.id OR r.peptide_name = pep.name;

-- Grant access to the view
GRANT SELECT ON admin_reviews_view TO authenticated;
GRANT SELECT ON admin_reviews_view TO anon;

-- Enable RLS on the view isn't directly possible, but the underlying tables have RLS

-- ============================================
-- 4. Create view for admin users with all needed data
-- ============================================
DROP VIEW IF EXISTS admin_users_view;
CREATE VIEW admin_users_view AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.is_admin,
    p.created_at,
    p.updated_at,
    p.last_sign_in,
    p.weight_lbs,
    (SELECT COUNT(*) FROM public.injections i WHERE i.user_id = p.id) as injection_count,
    (SELECT COUNT(*) FROM public.schedules s WHERE s.user_id = p.id) as schedule_count,
    (SELECT COUNT(*) FROM public.reviews r WHERE r.user_id = p.id) as review_count
FROM public.profiles p;

GRANT SELECT ON admin_users_view TO authenticated;

-- ============================================
-- 5. Ensure last_sign_in column exists in profiles
-- ============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_sign_in timestamp with time zone;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weight_lbs numeric;

-- ============================================
-- DONE
-- ============================================
SELECT 'Relationships and views created successfully!' as status;
