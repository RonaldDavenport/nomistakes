-- Active Business OS: Leads, Satellite Infrastructure, Multi-Channel Inbox

-- ════════════════════════════════════════════════════════════
-- 1. LEADS
-- Cold outbound prospects discovered via Apollo/Ocean.io before any engagement.
-- Separate from contacts (post-response CRM). Leads graduate to contacts on reply.
-- ════════════════════════════════════════════════════════════

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',     -- 'apollo', 'ocean', 'manual'
  name TEXT,
  email TEXT,
  linkedin_url TEXT,
  title TEXT,
  company TEXT,
  status TEXT NOT NULL DEFAULT 'new',        -- 'new', 'reached_out', 'replied', 'converted', 'dead'
  credits_spent INTEGER DEFAULT 0,
  reached_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 2. INFRASTRUCTURE SETTINGS
-- One row per business. Tracks satellite domain, Google Workspace email, DNS/warming state.
-- ════════════════════════════════════════════════════════════

CREATE TABLE infrastructure_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  satellite_domain TEXT,
  cloudflare_zone_id TEXT,
  workspace_email TEXT,
  google_workspace_customer_id TEXT,
  spf_configured BOOLEAN DEFAULT false,
  dkim_configured BOOLEAN DEFAULT false,
  dmarc_configured BOOLEAN DEFAULT false,
  warming_status TEXT DEFAULT 'not_started', -- 'not_started', 'warming', 'ready'
  mailreach_campaign_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 3. INBOX MESSAGES
-- Unified multi-channel thread log (email, LinkedIn, Twitter DMs).
-- lead_id and contact_id are nullable — messages can be attached to either.
-- ════════════════════════════════════════════════════════════

CREATE TABLE inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,                     -- 'email', 'linkedin', 'twitter'
  direction TEXT NOT NULL DEFAULT 'outbound', -- 'inbound', 'outbound'
  subject TEXT,
  content TEXT NOT NULL,
  external_message_id TEXT,                  -- Nylas/Unipile message ID for threading
  thread_id TEXT,                            -- Nylas thread ID
  sent_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 4. RLS POLICIES
-- ════════════════════════════════════════════════════════════

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can manage own leads" ON leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own infrastructure_settings" ON infrastructure_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = infrastructure_settings.business_id AND businesses.user_id = auth.uid())
);
CREATE POLICY "Users can manage own inbox_messages" ON inbox_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = inbox_messages.business_id AND businesses.user_id = auth.uid())
);

-- Service role full access
CREATE POLICY "Service role full access leads" ON leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access infrastructure_settings" ON infrastructure_settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access inbox_messages" ON inbox_messages FOR ALL USING (auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════
-- 5. INDEXES
-- ════════════════════════════════════════════════════════════

CREATE INDEX idx_leads_business ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(business_id, status);
CREATE INDEX idx_leads_source ON leads(business_id, source);
CREATE INDEX idx_infrastructure_settings_business ON infrastructure_settings(business_id);
CREATE INDEX idx_inbox_messages_business ON inbox_messages(business_id);
CREATE INDEX idx_inbox_messages_lead ON inbox_messages(lead_id);
CREATE INDEX idx_inbox_messages_channel ON inbox_messages(business_id, channel);
CREATE INDEX idx_inbox_messages_sent_at ON inbox_messages(business_id, sent_at DESC);
