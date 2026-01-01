-- Migration: 20260101000008_fix_admin_access.sql
-- Description: Ensures admin column exists, secures it, and grants dashboard access.

-- 1. Ensure is_admin column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Update is_admin function (Security Definer to bypass RLS recursion, STABLE for performance)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 3. Protect is_admin column from unauthorized changes via API
CREATE OR REPLACE FUNCTION public.protect_admin_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if database owner/superuser (e.g. Dashboard SQL Editor)
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  -- Allow if current user is ALREADY an admin
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Block otherwise
  IF TG_OP = 'INSERT' AND NEW.is_admin IS TRUE THEN
     RAISE EXCEPTION 'Only admins can set admin status.';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
     RAISE EXCEPTION 'Only admins can change admin status.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS protect_admin_column ON profiles;
CREATE TRIGGER protect_admin_column
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_admin_column();

-- 4. Grant Admin Permissions (Needed for Dashboard Stats)

-- Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (public.is_admin());

-- Injections
DROP POLICY IF EXISTS "Admins can view all injections" ON injections;
CREATE POLICY "Admins can view all injections" ON injections FOR SELECT USING (public.is_admin());

-- Schedules
DROP POLICY IF EXISTS "Admins can view all schedules" ON schedules;
CREATE POLICY "Admins can view all schedules" ON schedules FOR SELECT USING (public.is_admin());

-- Inventory
DROP POLICY IF EXISTS "Admins can view all inventory" ON inventory;
CREATE POLICY "Admins can view all inventory" ON inventory FOR SELECT USING (public.is_admin());

-- Reviews (View & Manage)
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (public.is_admin());

-- Support Tickets (View & Update)
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
CREATE POLICY "Admins can view all tickets" ON support_tickets FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all tickets" ON support_tickets;
CREATE POLICY "Admins can update all tickets" ON support_tickets FOR UPDATE USING (public.is_admin());

-- Ticket Messages
DROP POLICY IF EXISTS "Admins can view all messages" ON ticket_messages;
CREATE POLICY "Admins can view all messages" ON ticket_messages FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can add messages to any ticket" ON ticket_messages;
CREATE POLICY "Admins can add messages to any ticket" ON ticket_messages FOR INSERT WITH CHECK (public.is_admin());

-- Audit Logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
CREATE POLICY "Admins can view all audit logs" ON audit_logs FOR SELECT USING (public.is_admin());

-- Peptides (Manage) - Re-applying to ensure it uses the new STABLE function
DROP POLICY IF EXISTS "Admins can manage peptides" ON peptides;
CREATE POLICY "Admins can manage peptides" ON peptides FOR ALL USING (public.is_admin());
