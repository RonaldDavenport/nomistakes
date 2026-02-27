-- Add Stripe Connect and custom domain columns to businesses table
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS custom_domain text,
  ADD COLUMN IF NOT EXISTS deployed_url text;

-- Index for looking up businesses by Stripe account
CREATE INDEX IF NOT EXISTS idx_businesses_stripe_account
  ON public.businesses (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;

-- Index for looking up businesses by custom domain
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_custom_domain
  ON public.businesses (custom_domain)
  WHERE custom_domain IS NOT NULL;
