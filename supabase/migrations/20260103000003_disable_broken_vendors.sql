-- Disable vendors that no longer work or have products
-- Amino Asylum redirects to "Coming Soon" page
-- Peptide Sciences and Paradigm have aggressive bot protection (423/403)

-- Disable Amino Asylum (no longer selling peptides directly)
UPDATE vendors 
SET is_active = false
WHERE slug = 'amino-asylum';

-- Keep Peptide Sciences and Paradigm active but note they need proxy
-- The ScrapingAnt proxy should handle them

-- Update Amino Asylum with note
UPDATE vendors
SET scrape_config = jsonb_set(
  COALESCE(scrape_config, '{}'::jsonb),
  '{note}',
  '"Site redirects to Coming Soon page - not selling peptides directly"'::jsonb
)
WHERE slug = 'amino-asylum';
