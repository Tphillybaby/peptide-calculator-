-- Migration: Add missing columns to peptides table
-- Description: Adds common_dosage and research_links to support full Encyclopedia data

ALTER TABLE public.peptides 
ADD COLUMN IF NOT EXISTS common_dosage text,
ADD COLUMN IF NOT EXISTS research_links text[];

-- Update the comments/docs if needed
COMMENT ON COLUMN public.peptides.common_dosage IS 'Text description of common dosage range';
COMMENT ON COLUMN public.peptides.research_links IS 'Array of URLs to research papers';
