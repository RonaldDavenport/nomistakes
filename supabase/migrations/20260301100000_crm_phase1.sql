-- CRM Phase 1: Contacts, Activity, Discovery Calls, Proposals, Email Templates, Emails
-- Also adds availability_settings column to businesses

-- ════════════════════════════════════════════════════════════
-- 1. CONTACTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  company TEXT,
  lifecycle_stage TEXT NOT NULL DEFAULT 'subscriber',
  source TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, email)
);

-- ════════════════════════════════════════════════════════════
-- 2. CONTACT ACTIVITY
-- ════════════════════════════════════════════════════════════

CREATE TABLE contact_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 3. DISCOVERY CALLS
-- ════════════════════════════════════════════════════════════

CREATE TABLE discovery_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  call_notes TEXT,
  outcome TEXT,
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 4. PROPOSALS
-- ════════════════════════════════════════════════════════════

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  discovery_call_id UUID REFERENCES discovery_calls(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  access_token TEXT NOT NULL DEFAULT encode(gen_random_uuid()::text::bytea, 'hex'),
  status TEXT NOT NULL DEFAULT 'draft',
  scope JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  valid_until TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  payment_status TEXT,
  payment_amount_cents INTEGER,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 5. EMAIL TEMPLATES
-- ════════════════════════════════════════════════════════════

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  category TEXT,
  variables TEXT[] DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 6. EMAILS
-- ════════════════════════════════════════════════════════════

CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  resend_id TEXT,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  opened_at TIMESTAMPTZ,
  open_count INTEGER DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 7. AVAILABILITY SETTINGS ON BUSINESSES
-- ════════════════════════════════════════════════════════════

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS availability_settings JSONB DEFAULT '{}';

-- ════════════════════════════════════════════════════════════
-- 8. RLS POLICIES
-- ════════════════════════════════════════════════════════════

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can manage own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own contact activity" ON contact_activity FOR ALL USING (
  EXISTS (SELECT 1 FROM contacts WHERE contacts.id = contact_activity.contact_id AND contacts.user_id = auth.uid())
);
CREATE POLICY "Users can manage own discovery calls" ON discovery_calls FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own proposals" ON proposals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own email templates" ON email_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own emails" ON emails FOR ALL USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access contacts" ON contacts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access contact_activity" ON contact_activity FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access discovery_calls" ON discovery_calls FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access proposals" ON proposals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access email_templates" ON email_templates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access emails" ON emails FOR ALL USING (auth.role() = 'service_role');

-- Public access for proposals (via access_token validation in app)
CREATE POLICY "Public can view proposals by token" ON proposals FOR SELECT USING (true);

-- Public access for discovery calls (booking page needs to check availability)
CREATE POLICY "Public can view scheduled calls" ON discovery_calls FOR SELECT USING (true);
CREATE POLICY "Public can insert discovery calls" ON discovery_calls FOR INSERT WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- 9. INDEXES
-- ════════════════════════════════════════════════════════════

CREATE INDEX idx_contacts_business ON contacts(business_id);
CREATE INDEX idx_contacts_email ON contacts(business_id, email);
CREATE INDEX idx_contacts_stage ON contacts(business_id, lifecycle_stage);
CREATE INDEX idx_contact_activity_contact ON contact_activity(contact_id);
CREATE INDEX idx_contact_activity_business ON contact_activity(business_id);
CREATE INDEX idx_discovery_calls_business ON discovery_calls(business_id);
CREATE INDEX idx_discovery_calls_scheduled ON discovery_calls(business_id, scheduled_at);
CREATE INDEX idx_discovery_calls_status ON discovery_calls(business_id, status);
CREATE INDEX idx_proposals_business ON proposals(business_id);
CREATE INDEX idx_proposals_contact ON proposals(contact_id);
CREATE INDEX idx_proposals_access_token ON proposals(access_token);
CREATE INDEX idx_email_templates_business ON email_templates(business_id);
CREATE INDEX idx_emails_business ON emails(business_id);
CREATE INDEX idx_emails_contact ON emails(contact_id);
