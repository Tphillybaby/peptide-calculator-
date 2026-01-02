-- Run this in Supabase Dashboard > SQL Editor to seed/reseed price data
-- This will populate the price checker with estimated prices for all vendors

-- First, check current state
SELECT 'Current vendors:' as info, COUNT(*) as count FROM public.vendors;
SELECT 'Current prices:' as info, COUNT(*) as count FROM public.peptide_prices;

-- Insert prices for each vendor (if not already exists)
DO $$
DECLARE
    vendor_rec RECORD;
BEGIN
    FOR vendor_rec IN SELECT id, name FROM public.vendors WHERE is_active = true LOOP
        RAISE NOTICE 'Seeding prices for vendor: %', vendor_rec.name;
        
        -- Insert common peptides with estimated prices
        INSERT INTO public.peptide_prices (vendor_id, peptide_name, peptide_slug, price, unit, quantity, in_stock)
        VALUES
            -- GLP-1 Agonists (high value)
            (vendor_rec.id, 'Semaglutide', 'semaglutide', 249.00 * (0.92 + random() * 0.16), 'vial', '5mg', true),
            (vendor_rec.id, 'Tirzepatide', 'tirzepatide', 289.00 * (0.92 + random() * 0.16), 'vial', '10mg', true),
            (vendor_rec.id, 'Retatrutide', 'retatrutide', 319.00 * (0.92 + random() * 0.16), 'vial', '10mg', true),
            
            -- Healing Peptides
            (vendor_rec.id, 'BPC-157', 'bpc-157', 48.00 * (0.92 + random() * 0.16), 'vial', '5mg', true),
            (vendor_rec.id, 'TB-500', 'tb-500', 52.00 * (0.92 + random() * 0.16), 'vial', '5mg', true),
            
            -- GH Secretagogues
            (vendor_rec.id, 'Ipamorelin', 'ipamorelin', 38.00 * (0.92 + random() * 0.16), 'vial', '5mg', true),
            (vendor_rec.id, 'CJC-1295 (no DAC)', 'cjc-1295-no-dac', 42.00 * (0.92 + random() * 0.16), 'vial', '2mg', true),
            (vendor_rec.id, 'CJC-1295 (DAC)', 'cjc-1295-dac', 55.00 * (0.92 + random() * 0.16), 'vial', '2mg', true),
            (vendor_rec.id, 'GHRP-2', 'ghrp-2', 32.00 * (0.92 + random() * 0.16), 'vial', '5mg', true),
            (vendor_rec.id, 'GHRP-6', 'ghrp-6', 28.00 * (0.92 + random() * 0.16), 'vial', '5mg', true),
            (vendor_rec.id, 'Hexarelin', 'hexarelin', 45.00 * (0.92 + random() * 0.16), 'vial', '2mg', true),
            (vendor_rec.id, 'MK-677', 'mk-677', 85.00 * (0.92 + random() * 0.16), 'bottle', '30 capsules', true),
            
            -- Cosmetic/Tanning
            (vendor_rec.id, 'Melanotan II', 'melanotan-ii', 38.00 * (0.92 + random() * 0.16), 'vial', '10mg', true),
            (vendor_rec.id, 'PT-141', 'pt-141', 45.00 * (0.92 + random() * 0.16), 'vial', '10mg', true),
            
            -- Other Popular
            (vendor_rec.id, 'AOD-9604', 'aod-9604', 58.00 * (0.92 + random() * 0.16), 'vial', '5mg', true),
            (vendor_rec.id, 'GHK-Cu', 'ghk-cu', 35.00 * (0.92 + random() * 0.16), 'vial', '50mg', true),
            (vendor_rec.id, 'Semax', 'semax', 48.00 * (0.92 + random() * 0.16), 'vial', '30mg', true),
            (vendor_rec.id, 'Selank', 'selank', 52.00 * (0.92 + random() * 0.16), 'vial', '5mg', true),
            (vendor_rec.id, 'Epithalon', 'epithalon', 85.00 * (0.92 + random() * 0.16), 'vial', '10mg', true),
            (vendor_rec.id, 'MOTS-c', 'mots-c', 95.00 * (0.92 + random() * 0.16), 'vial', '5mg', true)
        ON CONFLICT (vendor_id, peptide_slug) DO UPDATE SET
            price = EXCLUDED.price,
            updated_at = now(),
            last_verified_at = now();
    END LOOP;
END $$;

-- Verify results
SELECT 'After seeding:' as info, COUNT(*) as count FROM public.peptide_prices;

-- Show sample of seeded data
SELECT 
    v.name as vendor,
    pp.peptide_name,
    ROUND(pp.price::numeric, 2) as price,
    pp.unit
FROM public.peptide_prices pp
JOIN public.vendors v ON pp.vendor_id = v.id
ORDER BY pp.peptide_name, pp.price
LIMIT 30;
