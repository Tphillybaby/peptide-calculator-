-- Add product_url column to peptide_prices table
-- This allows storing the direct link to the specific product page

ALTER TABLE peptide_prices 
ADD COLUMN IF NOT EXISTS product_url TEXT;

-- Add comment
COMMENT ON COLUMN peptide_prices.product_url IS 'Direct URL to the specific product page';
