-- Migration: Add new vendors + expand peptide coverage
-- Run: supabase db push

-- ============================================================
-- NEW VENDORS
-- ============================================================

INSERT INTO public.vendors (name, slug, website_url, affiliate_url, logo_emoji, rating, review_count, shipping_info, shipping_days, payment_methods, features, is_active, scrape_config)
VALUES
(
    'Core Peptides',
    'core-peptides',
    'https://corepeptides.com',
    'https://corepeptides.com',
    '⚡',
    4.7,
    1102,
    'Free over $150',
    '2-4 days',
    ARRAY['Credit Card', 'Crypto', 'Zelle'],
    ARRAY['USA-based', 'COA Available', 'Fast Shipping', 'HPLC Tested'],
    true,
    '{
        "productSelector": "li.product",
        "nameSelector": ".woocommerce-loop-product__title",
        "priceSelector": ".price",
        "searchUrl": "https://corepeptides.com/shop/"
    }'::jsonb
),
(
    'Limitless Life Nootropics',
    'limitless-life',
    'https://limitlesslifenootropics.com',
    'https://limitlesslifenootropics.com',
    '🧠',
    4.5,
    743,
    'Free over $100',
    '3-5 days',
    ARRAY['Credit Card', 'Crypto'],
    ARRAY['Wide Selection', 'COA Available', 'Nootropics + Peptides'],
    true,
    '{
        "productSelector": "li.product",
        "nameSelector": ".woocommerce-loop-product__title",
        "priceSelector": ".price",
        "searchUrl": "https://limitlesslifenootropics.com/product-category/peptides/"
    }'::jsonb
),
(
    'Peptide Pros',
    'peptide-pros',
    'https://peptidepros.net',
    'https://peptidepros.net',
    '💉',
    4.4,
    612,
    'Free over $175',
    '3-5 days',
    ARRAY['Credit Card', 'Crypto', 'Zelle'],
    ARRAY['USA-based', 'Competitive Pricing', 'Bundle Deals'],
    true,
    '{
        "productSelector": "li.product",
        "nameSelector": ".woocommerce-loop-product__title",
        "priceSelector": ".price",
        "searchUrl": "https://peptidepros.net/shop/"
    }'::jsonb
),
(
    'Blue Sky Peptide',
    'blue-sky-peptide',
    'https://blueskypeptide.com',
    'https://blueskypeptide.com',
    '🌤️',
    4.6,
    891,
    'Free over $200',
    '2-4 days',
    ARRAY['Credit Card', 'Crypto', 'E-check'],
    ARRAY['USA-based', 'Lab Tested', 'Long History'],
    true,
    '{
        "productSelector": ".product-item",
        "nameSelector": ".product-item-name",
        "priceSelector": ".price",
        "searchUrl": "https://blueskypeptide.com/peptides"
    }'::jsonb
),
(
    'Behemoth Labz',
    'behemoth-labz',
    'https://behemothlabz.com',
    'https://behemothlabz.com',
    '🦾',
    4.3,
    534,
    '$9.99 flat rate',
    '3-6 days',
    ARRAY['Credit Card', 'Crypto'],
    ARRAY['Bulk Discounts', 'Wide Selection', 'Reward Points'],
    true,
    '{
        "productSelector": "li.product",
        "nameSelector": ".woocommerce-loop-product__title",
        "priceSelector": ".price",
        "searchUrl": "https://behemothlabz.com/product-category/peptides/"
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    website_url = EXCLUDED.website_url,
    affiliate_url = EXCLUDED.affiliate_url,
    logo_emoji = EXCLUDED.logo_emoji,
    rating = EXCLUDED.rating,
    shipping_info = EXCLUDED.shipping_info,
    shipping_days = EXCLUDED.shipping_days,
    payment_methods = EXCLUDED.payment_methods,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    scrape_config = EXCLUDED.scrape_config,
    updated_at = now();

-- ============================================================
-- RE-ENABLE PREVIOUSLY DELETED/DISABLED VENDORS
-- ============================================================

-- Re-add Amino Asylum if deleted
INSERT INTO public.vendors (name, slug, website_url, affiliate_url, logo_emoji, rating, review_count, shipping_info, shipping_days, payment_methods, features, is_active, scrape_config)
VALUES (
    'Amino Asylum',
    'amino-asylum',
    'https://aminoasylum.shop',
    'https://aminoasylum.shop',
    '💊',
    4.4,
    892,
    '$8.99 flat rate',
    '3-6 days',
    ARRAY['Credit Card', 'Crypto', 'Zelle'],
    ARRAY['Affordable', 'Wide Selection', 'Bundle Deals'],
    true,
    '{
        "productSelector": ".product-grid-item",
        "nameSelector": ".product-title",
        "priceSelector": ".money",
        "searchUrl": "https://aminoasylum.shop/collections/peptides"
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    is_active = true,
    website_url = 'https://aminoasylum.shop',
    scrape_config = EXCLUDED.scrape_config,
    updated_at = now();

-- ============================================================
-- ENSURE PARADIGM PEPTIDES IS ACTIVE WITH CORRECT CONFIG  
-- ============================================================
UPDATE public.vendors SET
    is_active = true,
    scrape_config = '{
        "productSelector": "li.product",
        "nameSelector": ".woocommerce-loop-product__title",
        "priceSelector": ".price",
        "searchUrl": "https://paradigmpeptides.com/product-category/peptides/"
    }'::jsonb,
    updated_at = now()
WHERE slug = 'paradigm-peptides';

-- Ensure PureRawz is active with correct URL
UPDATE public.vendors SET
    is_active = true,
    website_url = 'https://purerawz.co',
    scrape_config = '{
        "productSelector": "li.product",
        "nameSelector": ".woocommerce-loop-product__title",
        "priceSelector": ".price",
        "searchUrl": "https://purerawz.co/product-category/peptides/"
    }'::jsonb,
    updated_at = now()
WHERE slug = 'pure-rawz';

-- Apollo Peptides update
UPDATE public.vendors SET
    is_active = true,
    scrape_config = '{
        "productSelector": "li.product",
        "nameSelector": ".woocommerce-loop-product__title",
        "priceSelector": ".price",
        "searchUrl": "https://apollopeptidesciences.com/shop/"
    }'::jsonb,
    updated_at = now()
WHERE slug = 'apollo-peptides';
