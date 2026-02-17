-- Fix RLS policies on injections table
-- First verify RLS is enabled
ALTER TABLE public.injections ENABLE ROW LEVEL SECURITY;

-- Force RLS for all users, not just through API
ALTER TABLE public.injections FORCE ROW LEVEL SECURITY;

-- Drop and recreate policies with optimized auth.uid() check
DROP POLICY IF EXISTS "Users can view own injections." ON public.injections;
DROP POLICY IF EXISTS "Users can insert own injections." ON public.injections;
DROP POLICY IF EXISTS "Users can update own injections." ON public.injections;
DROP POLICY IF EXISTS "Users can delete own injections." ON public.injections;

-- Recreate policies with (select auth.uid()) for better performance
CREATE POLICY "Users can view own injections."
    ON public.injections FOR SELECT
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own injections."
    ON public.injections FOR INSERT
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own injections."
    ON public.injections FOR UPDATE
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own injections."
    ON public.injections FOR DELETE
    USING (user_id = (SELECT auth.uid()));

-- Also fix inventory table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own inventory." ON public.inventory;
DROP POLICY IF EXISTS "Users can manage own inventory." ON public.inventory;

CREATE POLICY "Users can view own inventory."
    ON public.inventory FOR SELECT
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can manage own inventory."
    ON public.inventory FOR ALL
    USING (user_id = (SELECT auth.uid()));

-- Fix schedules table
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own schedules." ON public.schedules;
DROP POLICY IF EXISTS "Users can insert own schedules." ON public.schedules;
DROP POLICY IF EXISTS "Users can update own schedules." ON public.schedules;
DROP POLICY IF EXISTS "Users can delete own schedules." ON public.schedules;

CREATE POLICY "Users can view own schedules."
    ON public.schedules FOR SELECT
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own schedules."
    ON public.schedules FOR INSERT
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own schedules."
    ON public.schedules FOR UPDATE
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own schedules."
    ON public.schedules FOR DELETE
    USING (user_id = (SELECT auth.uid()));
