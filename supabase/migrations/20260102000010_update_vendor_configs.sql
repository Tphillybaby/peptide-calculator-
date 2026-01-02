-- Migration: Update vendor scrape configs with better URLs and selectors
-- Run: supabase db push

-- Peptide Sciences (Magento)
UPDATE public.vendors 
SET scrape_config = '{"productSelector": ".product-item-info", "priceSelector": ".price", "nameSelector": ".product-item-link", "searchUrl": "https://www.peptidesciences.com/peptides"}'::jsonb
WHERE slug = 'peptide-sciences';

-- PureRawz (WooCommerce)
UPDATE public.vendors 
SET scrape_config = '{"productSelector": ".product", "priceSelector": ".woocommerce-Price-amount", "nameSelector": ".woocommerce-loop-product__title", "searchUrl": "https://purerawz.co/product-category/peptides/"}'::jsonb
WHERE slug = 'pure-rawz';

-- Swiss Chems (Magento?)
UPDATE public.vendors 
SET scrape_config = '{"productSelector": ".product-item-info", "priceSelector": ".price", "nameSelector": ".product-item-link", "searchUrl": "https://swisschems.is/peptides"}'::jsonb
WHERE slug = 'swiss-chems';

-- BioTech Peptides
UPDATE public.vendors 
SET scrape_config = '{"productSelector": ".product", "priceSelector": ".price", "nameSelector": ".title", "searchUrl": "https://biotechpeptides.com/shop/"}'::jsonb
WHERE slug = 'biotech-peptides';

-- Amino Asylum (Shopify)
UPDATE public.vendors 
SET scrape_config = '{"productSelector": ".product-grid-item", "priceSelector": ".money", "nameSelector": ".product-title", "searchUrl": "https://aminoasylum.shop/collections/peptides"}'::jsonb
WHERE slug = 'amino-asylum';

-- Paradigm Peptides (WooCommerce)
UPDATE public.vendors 
SET scrape_config = '{"productSelector": ".product", "priceSelector": ".price", "nameSelector": ".woocommerce-loop-product__title", "searchUrl": "https://paradigmpeptides.com/product-category/peptides/"}'::jsonb
WHERE slug = 'paradigm-peptides';

-- Add a new one? X Peptides? (Optional, skipping for now to focus on quality of existing)
