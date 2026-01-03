-- Update Amino Asylum with new URL and re-enable
-- Their new site is aminoasylumllc.com (WooCommerce)

UPDATE vendors
SET 
  is_active = true,
  website_url = 'https://aminoasylumllc.com',
  scrape_config = '{
    "productSelector": "li.product",
    "priceSelector": ".price .woocommerce-Price-amount bdi, .price bdi",
    "nameSelector": "h2.woocommerce-loop-product__title, .woocommerce-loop-product__title",
    "searchUrl": "https://aminoasylumllc.com/product-category/peptides/"
  }'::jsonb
WHERE slug = 'amino-asylum';

-- Also update the affiliate URL (user can customize later)
UPDATE vendors
SET affiliate_url = 'https://aminoasylumllc.com/?ref=YOUR_AFFILIATE_ID'
WHERE slug = 'amino-asylum';
