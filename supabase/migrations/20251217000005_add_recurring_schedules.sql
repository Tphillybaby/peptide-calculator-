-- MIGRATION: Add recurring schedules support
-- This adds the ability to set weekly recurring schedules

-- Add new columns to schedules table for recurring support
ALTER TABLE public.schedules
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS parent_schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE DEFAULT NULL;

-- Create an index for faster queries on recurring schedules
CREATE INDEX IF NOT EXISTS idx_schedules_recurring ON public.schedules(is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_schedules_parent ON public.schedules(parent_schedule_id);

-- Add a protocol templates table for common dosing schedules
CREATE TABLE IF NOT EXISTS public.schedule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  peptide_name TEXT NOT NULL,
  dosage NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'mg',
  time TIME NOT NULL DEFAULT '08:00',
  recurrence_days INTEGER[] NOT NULL, -- 0=Sunday, 1=Monday, etc.
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for templates
ALTER TABLE public.schedule_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for templates
CREATE POLICY "Users can view own templates" ON public.schedule_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates" ON public.schedule_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.schedule_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.schedule_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for templates
CREATE INDEX IF NOT EXISTS idx_schedule_templates_user ON public.schedule_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_templates_active ON public.schedule_templates(is_active) WHERE is_active = true;

-- Function to generate schedule entries from a template for a given date range
CREATE OR REPLACE FUNCTION generate_schedules_from_template(
  p_template_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS SETOF public.schedules AS $$
DECLARE
  v_template public.schedule_templates;
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
      RETURNING * INTO STRICT v_template;
      
      -- This is a workaround, we'll return the records differently
    END IF;
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN public.schedule_templates.recurrence_days IS 'Array of day numbers: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
