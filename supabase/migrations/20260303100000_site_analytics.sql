-- Site Analytics: tracks visitor pageviews and custom events on deployed business sites
-- All access is server-side (service role). No client-facing RLS policies needed.

CREATE TABLE site_analytics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  session_id   TEXT NOT NULL,          -- client-generated stable ID (localStorage)
  page_path    TEXT NOT NULL DEFAULT '/',
  referrer     TEXT,
  country      TEXT,                   -- from Vercel/CF headers when available
  event_name   TEXT,                   -- NULL = pageview; string = custom event
  event_props  JSONB,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (all access goes through server-side API routes)
CREATE POLICY "Service role full access" ON site_analytics
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX site_analytics_business_idx ON site_analytics(business_id);
CREATE INDEX site_analytics_created_idx  ON site_analytics(business_id, created_at DESC);
