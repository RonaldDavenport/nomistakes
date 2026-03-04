-- Kovra pricing tier columns
-- Tracks business tier, billing period, and transaction fee rates

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'growth', 'scale')),
ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS transaction_fee_pct NUMERIC(4,2) DEFAULT 5.00;

-- Index for tier lookups
CREATE INDEX IF NOT EXISTS idx_businesses_tier ON businesses (tier);

COMMENT ON COLUMN businesses.tier IS 'Pricing tier: free, starter, growth, scale';
COMMENT ON COLUMN businesses.billing_period IS 'Billing period: monthly or annual';
COMMENT ON COLUMN businesses.transaction_fee_pct IS 'Transaction fee percentage for this tier';
