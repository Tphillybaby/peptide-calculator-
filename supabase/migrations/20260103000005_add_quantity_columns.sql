-- Add quantity and price_per_mg columns to peptide_prices table
-- This allows for proper price comparison between different vial sizes

-- Add columns to peptide_prices
ALTER TABLE peptide_prices 
ADD COLUMN IF NOT EXISTS quantity_mg DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(10),
ADD COLUMN IF NOT EXISTS price_per_mg DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS original_product_name TEXT;

-- Add quantity_mg to price_history for tracking
ALTER TABLE price_history
ADD COLUMN IF NOT EXISTS quantity_mg DECIMAL(10, 4);

-- Add comment for clarity
COMMENT ON COLUMN peptide_prices.quantity_mg IS 'Amount in milligrams (mcg converted to mg)';
COMMENT ON COLUMN peptide_prices.price_per_mg IS 'Calculated price per milligram for comparison';
COMMENT ON COLUMN peptide_prices.original_product_name IS 'Original product name as scraped from vendor site';
