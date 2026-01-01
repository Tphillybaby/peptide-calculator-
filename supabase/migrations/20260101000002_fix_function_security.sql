-- Migration: 20260101000002_fix_function_security.sql
-- Description: Fixes security vulnerabilities in functions (search_path) and ensures storage bucket security. Also fixes a logic bug in generate_schedules_from_template.

-- 1. SECURE FUNCTIONS (Fixes "Security Definer" warnings and Logic Bug)

-- Fix handle_new_user security
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Fix generate_schedules_from_template logic and security
-- Previous version had a RETURNING INTO type mismatch error and didn't return rows correctly.
CREATE OR REPLACE FUNCTION public.generate_schedules_from_template(
  p_template_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS SETOF public.schedules AS $$
DECLARE
  v_template public.schedule_templates;
  v_schedule public.schedules;
  v_current_date DATE;
  v_day_of_week INTEGER;
BEGIN
  -- Get the template
  SELECT * INTO v_template FROM public.schedule_templates WHERE id = p_template_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Generate schedules for each day in the range
  v_current_date := p_start_date;
  WHILE v_current_date <= p_end_date LOOP
    -- Get day of week (0=Sunday, 1=Monday, etc.)
    v_day_of_week := EXTRACT(DOW FROM v_current_date)::INTEGER;
    
    -- Check if this day is in the recurring days
    IF v_day_of_week = ANY(v_template.recurrence_days) THEN
      -- Only insert if no schedule exists for this date/peptide/time
      INSERT INTO public.schedules (
        user_id, peptide_name, dosage, unit, scheduled_date, scheduled_time, 
        completed, notes, is_recurring, parent_schedule_id
      )
      SELECT 
        v_template.user_id, v_template.peptide_name, v_template.dosage, 
        v_template.unit, v_current_date, v_template.time,
        FALSE, v_template.notes, TRUE, p_template_id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.schedules 
        WHERE user_id = v_template.user_id 
        AND peptide_name = v_template.peptide_name 
        AND scheduled_date = v_current_date
        AND scheduled_time = v_template.time
      )
      RETURNING * INTO v_schedule; -- Correctly load into v_schedule (not v_template)
      
      -- Return the created schedule if one was created
      IF FOUND THEN
          RETURN NEXT v_schedule;
      END IF;
    END IF;
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. SETUP STORAGE SECURITY (Fixes potential missing RLS on storage)
-- Ensure 'avatars' bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 
-- (Usually managed by Supabase, touching system tables risks locking, but policies are fine)

-- Policies for Avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING ( bucket_id = 'avatars' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- 3. ADDITIONAL INDEXES (Catch-all)
-- Inventory: Index on batch number?
CREATE INDEX IF NOT EXISTS idx_inventory_batch ON public.inventory(batch_number);

-- Forum: Index on slug
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON public.forum_categories(slug);

-- Success
SELECT 'Function security and storage policies updated' as status;
