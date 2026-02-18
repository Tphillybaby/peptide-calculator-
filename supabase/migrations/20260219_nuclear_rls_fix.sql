-- NUCLEAR OPTION: Dynamically drop ALL existing policies for critical tables
-- This ensures no "hidden" or "forgotten" policies remain to allow data leakage.

-- 1. INJECTIONS
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'injections' AND schemaname = 'public') LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.injections'; 
    END LOOP; 
END $$;

ALTER TABLE public.injections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injections FORCE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_injections_v2" ON public.injections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_injections_v2" ON public.injections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_injections_v2" ON public.injections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_injections_v2" ON public.injections FOR DELETE USING (auth.uid() = user_id);


-- 2. INVENTORY
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'inventory' AND schemaname = 'public') LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.inventory'; 
    END LOOP; 
END $$;

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory FORCE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_inventory_v2" ON public.inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_inventory_v2" ON public.inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_inventory_v2" ON public.inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_inventory_v2" ON public.inventory FOR DELETE USING (auth.uid() = user_id);


-- 3. SCHEDULES
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'schedules' AND schemaname = 'public') LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.schedules'; 
    END LOOP; 
END $$;

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules FORCE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_schedules_v2" ON public.schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_schedules_v2" ON public.schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_schedules_v2" ON public.schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_schedules_v2" ON public.schedules FOR DELETE USING (auth.uid() = user_id);


-- 4. USER_CALCULATIONS
DO $$ 
DECLARE 
    r RECORD; 
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_calculations' AND schemaname = 'public') LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_calculations'; 
    END LOOP; 
END $$;

ALTER TABLE public.user_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calculations FORCE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_calculations_v2" ON public.user_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_calculations_v2" ON public.user_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_calculations_v2" ON public.user_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_calculations_v2" ON public.user_calculations FOR DELETE USING (auth.uid() = user_id);
