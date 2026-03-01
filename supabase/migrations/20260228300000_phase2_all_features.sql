-- Phase 2/3/4: Credit system + all feature tables
-- Credit system, blog enhancements, ad campaigns, UGC videos,
-- competitor monitoring, SEO, email sequences, weekly reports,
-- push notifications

-- ════════════════════════════════════════════════════════════
-- 1. CREDIT SYSTEM
-- ════════════════════════════════════════════════════════════

CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  last_refill_at TIMESTAMPTZ,
  next_refill_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, business_id)
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positive = earned, negative = spent
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'subscription_refill', 'pack_purchase', 'action_spend', 'bonus', 'refund'
  action TEXT, -- 'blog_post', 'ad_copy', 'ugc_video', etc.
  metadata JSONB DEFAULT '{}',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE credit_pack_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pack_type TEXT NOT NULL, -- 'small', 'medium', 'large'
  credits INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 2. AD CAMPAIGNS
-- ════════════════════════════════════════════════════════════

CREATE TABLE ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  campaign_name TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  objective TEXT NOT NULL,
  product_or_service TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  targeting JSONB,
  budget JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ad_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  headline TEXT,
  primary_text TEXT,
  description TEXT,
  cta TEXT,
  hashtags TEXT[],
  format TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE NOT NULL,
  variation_id UUID REFERENCES ad_variations(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  image_prompt TEXT,
  dimensions TEXT,
  platform TEXT NOT NULL,
  format TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 3. UGC VIDEOS
-- ════════════════════════════════════════════════════════════

CREATE TABLE ugc_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE SET NULL,
  product_or_service TEXT,
  video_style TEXT NOT NULL,
  platform TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  avatar_id TEXT,
  tone TEXT,
  script JSONB NOT NULL,
  storyboard JSONB,
  video_url TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'generating',
  generation_provider TEXT,
  generation_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 4. COMPETITOR MONITORING
-- ════════════════════════════════════════════════════════════

CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  industry TEXT,
  baseline_data JSONB,
  social_links JSONB,
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE NOT NULL,
  snapshot_type TEXT NOT NULL,
  data JSONB NOT NULL,
  html_storage_path TEXT,
  changes_detected JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE competitor_intel_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  brief JSONB NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 5. SEO
-- ════════════════════════════════════════════════════════════

CREATE TABLE seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  overall_score INTEGER,
  pages_audited INTEGER,
  issues JSONB,
  keyword_opportunities JSONB,
  competitor_comparison JSONB,
  auto_fixes_applied JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  keyword TEXT NOT NULL,
  search_volume_estimate TEXT,
  competition TEXT,
  target_page TEXT,
  current_position INTEGER,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 6. EMAIL SEQUENCES
-- ════════════════════════════════════════════════════════════

CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  sequence_name TEXT NOT NULL,
  sequence_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  emails JSONB NOT NULL,
  esp_integration TEXT,
  esp_campaign_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 7. WEEKLY REPORTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  report JSONB NOT NULL,
  is_read BOOLEAN DEFAULT false,
  delivered_via TEXT[] DEFAULT ARRAY['dashboard'],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 8. PUSH NOTIFICATIONS
-- ════════════════════════════════════════════════════════════

CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  sent_via TEXT[] DEFAULT ARRAY['in_app'],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  sale_alerts BOOLEAN DEFAULT true,
  daily_briefing BOOLEAN DEFAULT true,
  content_ready BOOLEAN DEFAULT true,
  competitor_alerts BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  milestones BOOLEAN DEFAULT true,
  accountability BOOLEAN DEFAULT true,
  low_credits BOOLEAN DEFAULT true,
  tip_of_day BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'America/Chicago',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ════════════════════════════════════════════════════════════
-- 9. ENHANCE EXISTING BLOG_POSTS TABLE
-- ════════════════════════════════════════════════════════════

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS body_markdown TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS estimated_read_time INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_score INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT true;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}';

-- ════════════════════════════════════════════════════════════
-- 10. RLS POLICIES
-- ════════════════════════════════════════════════════════════

ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_pack_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_intel_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Credit system RLS
CREATE POLICY "Users can view own credit balances" ON credit_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own credit transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own credit pack purchases" ON credit_pack_purchases FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (for API routes using service role key)
CREATE POLICY "Service role full access credit_balances" ON credit_balances FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access credit_transactions" ON credit_transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access credit_pack_purchases" ON credit_pack_purchases FOR ALL USING (auth.role() = 'service_role');

-- Ad campaigns RLS
CREATE POLICY "Users can manage own ad campaigns" ON ad_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ad variations" ON ad_variations FOR ALL USING (
  EXISTS (SELECT 1 FROM ad_campaigns WHERE ad_campaigns.id = ad_variations.campaign_id AND ad_campaigns.user_id = auth.uid())
);
CREATE POLICY "Users can manage own ad creatives" ON ad_creatives FOR ALL USING (
  EXISTS (SELECT 1 FROM ad_campaigns WHERE ad_campaigns.id = ad_creatives.campaign_id AND ad_campaigns.user_id = auth.uid())
);

-- UGC videos RLS
CREATE POLICY "Users can manage own ugc videos" ON ugc_videos FOR ALL USING (auth.uid() = user_id);

-- Competitor monitoring RLS
CREATE POLICY "Users can manage own competitors" ON competitors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own competitor snapshots" ON competitor_snapshots FOR ALL USING (
  EXISTS (SELECT 1 FROM competitors WHERE competitors.id = competitor_snapshots.competitor_id AND competitors.user_id = auth.uid())
);
CREATE POLICY "Users can manage own intel briefs" ON competitor_intel_briefs FOR ALL USING (auth.uid() = user_id);

-- SEO RLS
CREATE POLICY "Users can manage own seo audits" ON seo_audits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own seo keywords" ON seo_keywords FOR ALL USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = seo_keywords.business_id AND businesses.user_id = auth.uid())
);

-- Email sequences RLS
CREATE POLICY "Users can manage own email sequences" ON email_sequences FOR ALL USING (auth.uid() = user_id);

-- Weekly reports RLS
CREATE POLICY "Users can manage own weekly reports" ON weekly_reports FOR ALL USING (auth.uid() = user_id);

-- Push notifications RLS
CREATE POLICY "Users can manage own push tokens" ON push_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- Service role for all feature tables
CREATE POLICY "Service role full access ad_campaigns" ON ad_campaigns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access ad_variations" ON ad_variations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access ad_creatives" ON ad_creatives FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access ugc_videos" ON ugc_videos FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access competitors" ON competitors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access competitor_snapshots" ON competitor_snapshots FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access competitor_intel_briefs" ON competitor_intel_briefs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access seo_audits" ON seo_audits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access seo_keywords" ON seo_keywords FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access email_sequences" ON email_sequences FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access weekly_reports" ON weekly_reports FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access push_tokens" ON push_tokens FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access notification_preferences" ON notification_preferences FOR ALL USING (auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════
-- 11. INDEXES
-- ════════════════════════════════════════════════════════════

CREATE INDEX idx_credit_balances_user ON credit_balances(user_id);
CREATE INDEX idx_credit_transactions_user_biz ON credit_transactions(user_id, business_id);
CREATE INDEX idx_credit_transactions_created ON credit_transactions(created_at DESC);
CREATE INDEX idx_ad_campaigns_business ON ad_campaigns(business_id);
CREATE INDEX idx_ad_variations_campaign ON ad_variations(campaign_id);
CREATE INDEX idx_ugc_videos_business ON ugc_videos(business_id);
CREATE INDEX idx_competitors_business ON competitors(business_id);
CREATE INDEX idx_competitor_snapshots_competitor ON competitor_snapshots(competitor_id);
CREATE INDEX idx_seo_audits_business ON seo_audits(business_id);
CREATE INDEX idx_seo_keywords_business ON seo_keywords(business_id);
CREATE INDEX idx_email_sequences_business ON email_sequences(business_id);
CREATE INDEX idx_weekly_reports_business ON weekly_reports(business_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
