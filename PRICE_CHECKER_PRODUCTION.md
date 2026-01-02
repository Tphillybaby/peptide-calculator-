# Peptide Price Checker - Production Guide

## Overview

The Price Checker is a comprehensive price comparison tool that allows users to compare peptide prices across multiple trusted vendors. The system supports both **automated web scraping** and **manual price management**.

---

## ✅ Current Implementation Status

### Completed Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Frontend Component** | ✅ Done | `src/components/PriceChecker.jsx` - Full-featured price comparison UI |
| **Database Schema** | ✅ Done | `vendors`, `peptide_prices`, `price_history`, `scrape_logs` tables |
| **Admin Panel** | ✅ Done | `src/pages/admin/AdminPrices.jsx` - Manage vendors, prices, and logs |
| **Scraping Edge Function** | ✅ Done | `supabase/functions/scrape-prices/index.ts` - Automated scraping |
| **Fallback Data** | ✅ Done | `src/data/vendorData.js` - Static pricing when DB unavailable |
| **RPC Functions** | ✅ Done | `get_peptide_prices()`, `get_available_peptides()` |
| **Price History Tracking** | ✅ Done | Historical price data stored in `price_history` table |
| **Manual Price Editing** | ✅ Done | Edit prices directly from admin panel |

### Pending / Optional Enhancements

| Feature | Status | Description |
|---------|--------|-------------|
| **Scheduled Cron Jobs** | ⏳ Optional | Set up pg_cron or external scheduler for automated updates |
| **Affiliate Link Setup** | ⏳ Pending | Replace `YOUR_AFFILIATE_ID` placeholders with real codes |
| **Vendor API Integration** | ⏳ Optional | Direct API access (most vendors don't offer this) |
| **Price Alerts** | ⏳ Future | Notify users when prices drop |
| **Price Charts** | ⏳ Future | Visualize price history over time |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              User Interface                                  │
│                         (PriceChecker.jsx)                                  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Supabase Database                                  │
│  ┌─────────────┐  ┌─────────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │   vendors   │  │ peptide_prices  │  │ price_history │  │ scrape_logs │  │
│  └─────────────┘  └─────────────────┘  └───────────────┘  └─────────────┘  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Supabase Edge Function                                  │
│                    (scrape-prices/index.ts)                                 │
│                                                                              │
│  • Fetches vendor pages with proper User-Agent                              │
│  • Parses HTML with deno-dom                                                 │
│  • Matches products to tracked peptides                                     │
│  • Updates prices and logs results                                          │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Vendor Websites                                     │
│  Peptide Sciences • PureRawz • Swiss Chems • BioTech • Amino Asylum • etc  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### vendors
```sql
CREATE TABLE vendors (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    website_url text NOT NULL,
    affiliate_url text,
    logo_emoji text DEFAULT '🧬',
    rating numeric(2,1) DEFAULT 4.5,
    review_count integer DEFAULT 0,
    shipping_info text,
    shipping_days text,
    payment_methods text[],
    features text[],
    is_active boolean DEFAULT true,
    scrape_config jsonb,          -- CSS selectors for scraping
    last_scraped_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz
);
```

### peptide_prices
```sql
CREATE TABLE peptide_prices (
    id uuid PRIMARY KEY,
    vendor_id uuid REFERENCES vendors(id),
    peptide_name text NOT NULL,
    peptide_slug text NOT NULL,
    price numeric(10,2) NOT NULL,
    unit text DEFAULT 'vial',
    quantity text,                -- e.g., "5mg", "10mg"
    original_price numeric(10,2), -- For showing discounts
    in_stock boolean DEFAULT true,
    product_url text,
    last_verified_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    UNIQUE(vendor_id, peptide_slug)
);
```

### price_history
```sql
CREATE TABLE price_history (
    id uuid PRIMARY KEY,
    peptide_price_id uuid REFERENCES peptide_prices(id),
    price numeric(10,2) NOT NULL,
    recorded_at timestamptz DEFAULT now()
);
```

### scrape_logs
```sql
CREATE TABLE scrape_logs (
    id uuid PRIMARY KEY,
    vendor_id uuid REFERENCES vendors(id),
    status text NOT NULL,           -- 'success', 'partial', 'failed'
    products_found integer DEFAULT 0,
    products_updated integer DEFAULT 0,
    error_message text,
    duration_ms integer,
    created_at timestamptz DEFAULT now()
);
```

---

## RPC Functions

### get_available_peptides()
Returns all tracked peptides with price range and vendor count.

```sql
SELECT * FROM get_available_peptides();
-- Returns: peptide_name, peptide_slug, min_price, max_price, vendor_count
```

### get_peptide_prices(p_peptide_slug text)
Returns all vendor prices for a specific peptide.

```sql
SELECT * FROM get_peptide_prices('semaglutide');
-- Returns: vendor info, price, unit, quantity, in_stock, last_verified
```

---

## Web Scraping Edge Function

**Location:** `supabase/functions/scrape-prices/index.ts`

### Endpoint
```
POST /functions/v1/scrape-prices
Authorization: Bearer <user_access_token>
```

### Request Body (optional)
```json
{
    "vendor_slug": "peptide-sciences"  // Omit to scrape all vendors
}
```

### Response
```json
{
    "success": true,
    "vendorsScraped": 6,
    "totalDurationMs": 12500,
    "results": [
        {
            "vendor": "Peptide Sciences",
            "status": "success",
            "productsFound": 15,
            "productsUpdated": 12,
            "durationMs": 2100
        }
    ]
}
```

### Tracked Peptides
The scraper automatically tracks these peptides:
- **GLP-1:** Semaglutide, Tirzepatide, Retatrutide
- **GH Secretagogues:** Ipamorelin, CJC-1295 (DAC/no DAC), GHRP-2, GHRP-6, Hexarelin, MK-677
- **Healing:** BPC-157, TB-500
- **Cosmetic:** Melanotan II, PT-141, GHK-Cu
- **Other:** AOD-9604, Semax, Selank, Epithalon, MOTS-c

### Vendor Scrape Configuration
Each vendor has a `scrape_config` JSON field with CSS selectors:

```json
{
    "productSelector": ".product-item",
    "priceSelector": ".price",
    "nameSelector": ".product-name",
    "searchUrl": "https://vendor.com/peptides"  // Optional
}
```

---

## Admin Panel

**Location:** `src/pages/admin/AdminPrices.jsx`

### Features
1. **Overview Tab** - Price summary by peptide (min/max/avg)
2. **Vendors Tab** - View and manage vendors, trigger individual scrapes
3. **All Prices Tab** - Edit individual prices manually
4. **Scrape Logs Tab** - View scrape history and errors

### Triggering a Scrape
- **All Vendors:** Click "Scrape All" button
- **Single Vendor:** Go to Vendors tab, click "Scrape Now" on specific vendor

---

## Frontend Component

**Location:** `src/components/PriceChecker.jsx`

### Data Flow
1. On mount, calls `get_available_peptides()` RPC
2. If successful, uses database mode
3. If DB empty/error, falls back to `src/data/vendorData.js`
4. When peptide selected, calls `get_peptide_prices(slug)`
5. Displays sorted vendor list with best deal highlighted

### UI Features
- Peptide category dropdown
- Best Price / Average / Vendors / Savings stats
- Best Deal highlight card
- Expandable vendor cards with details
- Refresh button
- Data source indicator (DB vs estimated)

---

## Setting Up Affiliate Links

Replace placeholder IDs in the database:

```sql
-- Update Peptide Sciences
UPDATE vendors 
SET affiliate_url = 'https://www.peptidesciences.com/?ref=YOUR_REAL_ID'
WHERE slug = 'peptide-sciences';

-- Update all vendors
UPDATE vendors SET affiliate_url = 
    CASE slug
        WHEN 'peptide-sciences' THEN 'https://www.peptidesciences.com/?ref=xxx'
        WHEN 'pure-rawz' THEN 'https://purerawz.co/?aff=xxx'
        WHEN 'swiss-chems' THEN 'https://swisschems.is/?ref=xxx'
        -- ... etc
    END;
```

Also update `src/data/vendorData.js` for fallback mode.

---

## Setting Up Automated Scraping (Cron)

### Option 1: pg_cron (Supabase)
```sql
-- Enable pg_cron extension (if not already)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily scrape at 6 AM UTC
SELECT cron.schedule(
    'daily-price-scrape',
    '0 6 * * *',
    $$
    SELECT net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/scrape-prices',
        headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    )
    $$
);
```

### Option 2: External Scheduler
Use cron-job.org, GitHub Actions, or any scheduler to POST to:
```
POST https://your-project.supabase.co/functions/v1/scrape-prices
Authorization: Bearer <service_role_key>
```

### Option 3: GitHub Actions
```yaml
name: Scrape Prices
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Price Scrape
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            https://your-project.supabase.co/functions/v1/scrape-prices
```

---

## Troubleshooting

### Scraper Returns No Products
1. Check vendor website structure hasn't changed
2. Verify CSS selectors in `scrape_config`
3. Review scrape logs for errors
4. Try scraping vendor individually

### Database Shows Wrong Prices
1. Check `last_verified_at` timestamp
2. Manually edit in Admin Panel
3. Re-run scrape for that vendor

### Fallback Mode Always Active
1. Ensure migration has been applied
2. Check Supabase connection
3. Verify RPC functions exist
4. Check browser console for errors

---

## Deployment Checklist

- [x] Database schema created (migration applied)
- [x] Edge function deployed
- [x] Admin panel accessible
- [x] Frontend component working
- [x] Fallback data configured
- [ ] Affiliate links configured
- [ ] Cron job scheduled (optional)
- [ ] Price alerts set up (optional)

---

## Legal & Ethical Considerations

1. **Terms of Service:** Check each vendor's ToS regarding scraping
2. **Rate Limiting:** Built-in 1-second delay between vendors
3. **User-Agent:** Properly identifies as browser
4. **Caching:** Prices cached in DB to minimize requests
5. **Affiliate Disclosure:** Always displayed in UI

---

## Cost Estimates

| Service | Cost |
|---------|------|
| Supabase (Free tier) | $0/month |
| Edge Function invocations | Free tier: 500K/month |
| Database storage | Free tier: 500MB |
| **Total** | **$0/month** (within free tier limits) |

---

## Future Enhancements

1. **Price Alerts** - Email/push notifications when prices drop
2. **Price Charts** - Visualize historical price trends
3. **Vendor Reviews** - User reviews and ratings
4. **Discount Codes** - Track and display active coupons
5. **Bulk Pricing** - Compare quantity discounts
6. **Stock Alerts** - Notify when out-of-stock items return

---

**Last Updated:** January 1, 2026
