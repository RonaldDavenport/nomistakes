-- Affiliate click tracking table
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id text NOT NULL,
  business_id uuid REFERENCES public.businesses(id),
  source text NOT NULL DEFAULT 'platform_recommendation',
  created_at timestamptz DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partner ON public.affiliate_clicks (partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_business ON public.affiliate_clicks (business_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON public.affiliate_clicks (created_at);

-- Allow inserting from API (service role)
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Service role can insert (API route uses service role client)
CREATE POLICY "service_insert_affiliate_clicks"
  ON public.affiliate_clicks FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);
