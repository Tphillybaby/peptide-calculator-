-- Migration: 20260114000001_sync_last_sign_in.sql
-- Description: Syncs last_sign_in from auth.users to profiles and creates trigger for future updates

-- ============================================
-- 1. Sync existing last_sign_in data from auth.users to profiles
-- ============================================
-- First, ensure the column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_sign_in timestamp with time zone;

-- Sync existing data from auth.users
UPDATE public.profiles p
SET last_sign_in = u.last_sign_in_at
FROM auth.users u
WHERE p.id = u.id
AND (p.last_sign_in IS NULL OR p.last_sign_in < u.last_sign_in_at);

-- ============================================
-- 2. Create or replace the function to update last_sign_in
-- This runs every time a user's auth.users row is updated
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_user_updated()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the last_sign_in in profiles when auth.users changes
    UPDATE public.profiles
    SET last_sign_in = NEW.last_sign_in_at
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Create the trigger on auth.users
-- ============================================
-- Drop the trigger if it exists (to make this idempotent)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create trigger that fires on UPDATE of auth.users
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.handle_user_updated();

-- ============================================
-- 4. Also sync on new user creation
-- Update existing trigger to also copy created_at
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, last_sign_in)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.created_at,
        NEW.last_sign_in_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        last_sign_in = EXCLUDED.last_sign_in;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE
-- ============================================
SELECT 'Last sign-in sync completed successfully!' as status;
