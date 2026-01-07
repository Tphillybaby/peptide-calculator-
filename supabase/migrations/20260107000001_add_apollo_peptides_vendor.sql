INSERT INTO public.vendors (name, slug, website_url, affiliate_url, is_active, scrape_config)
VALUES (
  'Apollo Peptides',
  'apollo-peptides',
  'https://apollopeptidesciences.com',
  'https://apollopeptidesciences.com/?rfsn=8947483.28752f',
  true,
  '{
    "productSelector": "li.product",
    "nameSelector": ".woocommerce-loop-product__title",
    "priceSelector": ".price",
    "searchUrl": "https://apollopeptidesciences.com/shop/"
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  website_url = EXCLUDED.website_url,
  affiliate_url = EXCLUDED.affiliate_url,
  is_active = true,
  scrape_config = EXCLUDED.scrape_config;
