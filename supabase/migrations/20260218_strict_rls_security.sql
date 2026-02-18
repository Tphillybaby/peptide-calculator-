-- CRITICAL SECURITY FIX: Reset and enforce strict RLS for all user data tables

-- 1. INJECTIONS TABLE
ALTER TABLE public.injections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injections FORCE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure no "public" policies remain
DROP POLICY IF EXISTS "Users can view own injections." ON public.injections;
DROP POLICY IF EXISTS "Users can insert own injections." ON public.injections;
DROP POLICY IF EXISTS "Users can update own injections." ON public.injections;
DROP POLICY IF EXISTS "Users can delete own injections." ON public.injections;
DROP POLICY IF EXISTS "injections_select" ON public.injections;
DROP POLICY IF EXISTS "injections_insert" ON public.injections;
DROP POLICY IF EXISTS "injections_update" ON public.injections;
DROP POLICY IF EXISTS "injections_delete" ON public.injections;
DROP POLICY IF EXISTS "Public access" ON public.injections; -- Potential catch-all

-- Create strict policies
CREATE POLICY "owner_select_injections" ON public.injections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_injections" ON public.injections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_injections" ON public.injections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_injections" ON public.injections FOR DELETE USING (auth.uid() = user_id);


-- 2. INVENTORY TABLE
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own inventory." ON public.inventory;
DROP POLICY IF EXISTS "Users can manage own inventory." ON public.inventory;
DROP POLICY IF EXISTS "inventory_select" ON public.inventory;
DROP POLICY IF EXISTS "inventory_insert" ON public.inventory;
DROP POLICY IF EXISTS "inventory_update" ON public.inventory;
DROP POLICY IF EXISTS "inventory_delete" ON public.inventory;

CREATE POLICY "owner_select_inventory" ON public.inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_inventory" ON public.inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_inventory" ON public.inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_inventory" ON public.inventory FOR DELETE USING (auth.uid() = user_id);


-- 3. SCHEDULES TABLE
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own schedules." ON public.schedules;
DROP POLICY IF EXISTS "Users can insert own schedules." ON public.schedules;
DROP POLICY IF EXISTS "Users can update own schedules." ON public.schedules;
DROP POLICY IF EXISTS "Users can delete own schedules." ON public.schedules;
DROP POLICY IF EXISTS "schedules_select" ON public.schedules;
DROP POLICY IF EXISTS "schedules_insert" ON public.schedules;
DROP POLICY IF EXISTS "schedules_update" ON public.schedules;
DROP POLICY IF EXISTS "schedules_delete" ON public.schedules;

CREATE POLICY "owner_select_schedules" ON public.schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_schedules" ON public.schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_schedules" ON public.schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_schedules" ON public.schedules FOR DELETE USING (auth.uid() = user_id);


-- 4. USER_CALCULATIONS TABLE
ALTER TABLE public.user_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calculations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own calculations" ON public.user_calculations;
DROP POLICY IF EXISTS "Users can insert their own calculations" ON public.user_calculations;
DROP POLICY IF EXISTS "Users can delete their own calculations" ON public.user_calculations;

CREATE POLICY "owner_select_calculations" ON public.user_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_calculations" ON public.user_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_calculations" ON public.user_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_calculations" ON public.user_calculations FOR DELETE USING (auth.uid() = user_id);


-- 5. AUDIT LOG (If exists)
-- Ensure users can't see the full audit log
-- (Assuming audit_logs table exists based on file list)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Audit logs viewable by everyone" ON public.audit_logs;
CREATE POLICY "owner_select_audit_logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
