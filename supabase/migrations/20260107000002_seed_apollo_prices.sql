-- Seed initial prices found manually for immediate display
DO $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM vendors WHERE slug = 'apollo-peptides';

  IF v_id IS NOT NULL THEN
    -- Semaglutide 15mg -> $159.99
    INSERT INTO peptide_prices (vendor_id, peptide_name, peptide_slug, price, quantity_mg, quantity_unit, in_stock, original_product_name, product_url, last_verified_at)
    VALUES (v_id, 'Semaglutide 15mg', 'semaglutide', 159.99, 15, 'mg', true, 'GLP-1 S 15mg', 'https://apollopeptidesciences.com/product/glp-1s-15mg/', now())
    ON CONFLICT (vendor_id, peptide_slug) DO UPDATE SET price = EXCLUDED.price, quantity_mg = EXCLUDED.quantity_mg, last_verified_at = now();

    -- Retatrutide 10mg -> $149.99
    INSERT INTO peptide_prices (vendor_id, peptide_name, peptide_slug, price, quantity_mg, quantity_unit, in_stock, original_product_name, product_url, last_verified_at)
    VALUES (v_id, 'Retatrutide 10mg', 'retatrutide', 149.99, 10, 'mg', true, 'GLP-3 R 10mg', 'https://apollopeptidesciences.com/product/glp-3r-10mg/', now())
    ON CONFLICT (vendor_id, peptide_slug) DO UPDATE SET price = EXCLUDED.price, quantity_mg = EXCLUDED.quantity_mg, last_verified_at = now();
    
    -- Tirzepatide 30mg -> $279.99
    INSERT INTO peptide_prices (vendor_id, peptide_name, peptide_slug, price, quantity_mg, quantity_unit, in_stock, original_product_name, product_url, last_verified_at)
    VALUES (v_id, 'Tirzepatide 30mg', 'tirzepatide', 279.99, 30, 'mg', true, 'GLP-2 T 30mg', 'https://apollopeptidesciences.com/product/glp-2t-30mg/', now())
    ON CONFLICT (vendor_id, peptide_slug) DO UPDATE SET price = EXCLUDED.price, quantity_mg = EXCLUDED.quantity_mg, last_verified_at = now();

  END IF;
END $$;
