-- Fix Swiss Chems scraper configuration
-- The URL structure is different and uses WooCommerce with pagination /page/N/

UPDATE vendors
SET scrape_config = '{
  "productSelector": "li.product",
  "priceSelector": ".price .woocommerce-Price-amount bdi, .price bdi",
  "nameSelector": "h2.woocommerce-loop-product__title",
  "searchUrl": "https://swisschems.is/product-category/peptides/"
}'::jsonb
WHERE slug = 'swiss-chems';
