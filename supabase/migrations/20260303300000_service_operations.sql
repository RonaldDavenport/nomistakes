-- Service Operations: Contracts, Time Tracking, Referrals, Team, Automations, File Attachments
-- Also adds intake forms, calendar fields, recurring billing, and review tracking

-- ════════════════════════════════════════════════════════════
-- 1. CONTRACTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sign_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  signed_at TIMESTAMPTZ,
  signer_name TEXT,
  signer_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 2. TIME ENTRIES
-- ════════════════════════════════════════════════════════════

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  minutes INTEGER,
  hourly_rate NUMERIC(10,2),
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 3. REFERRAL LINKS
-- ════════════════════════════════════════════════════════════

CREATE TABLE referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  label TEXT,
  target_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 4. TEAM MEMBERS
-- ════════════════════════════════════════════════════════════

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invite_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, invited_email)
);

-- ════════════════════════════════════════════════════════════
-- 5. AUTOMATIONS
-- ════════════════════════════════════════════════════════════

CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  action TEXT NOT NULL,
  action_config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 6. FILE ATTACHMENTS
-- ════════════════════════════════════════════════════════════

CREATE TABLE file_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 7. COLUMN ADDITIONS
-- ════════════════════════════════════════════════════════════

-- Intake forms on businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS intake_form_fields JSONB DEFAULT '[]';

-- Intake responses + calendar on discovery_calls
ALTER TABLE discovery_calls
  ADD COLUMN IF NOT EXISTS intake_responses JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS calendar_uid TEXT;

-- Recurring billing + deposits + payment plans on invoices
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_interval TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_schedule JSONB DEFAULT '[]';

-- Review tracking + referral source on contacts
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS review_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- ════════════════════════════════════════════════════════════
-- 8. RLS POLICIES
-- ════════════════════════════════════════════════════════════

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users manage own contracts" ON contracts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own time_entries" ON time_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own referral_links" ON referral_links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own team_members" ON team_members FOR ALL
  USING (auth.uid() = invited_by OR auth.uid() = user_id);
CREATE POLICY "Users manage own automations" ON automations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own file_attachments" ON file_attachments FOR ALL USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access contracts" ON contracts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access time_entries" ON time_entries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access referral_links" ON referral_links FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access team_members" ON team_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access automations" ON automations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access file_attachments" ON file_attachments FOR ALL USING (auth.role() = 'service_role');

-- Public can read contracts by sign_token (validated in app layer)
CREATE POLICY "Public can read contracts" ON contracts FOR SELECT USING (true);

-- Public can read referral_links (click counting)
CREATE POLICY "Public can read referral_links" ON referral_links FOR SELECT USING (true);
CREATE POLICY "Public can update referral_link clicks" ON referral_links FOR UPDATE USING (true);

-- ════════════════════════════════════════════════════════════
-- 9. INDEXES
-- ════════════════════════════════════════════════════════════

CREATE INDEX idx_contracts_business ON contracts(business_id);
CREATE INDEX idx_contracts_sign_token ON contracts(sign_token);
CREATE INDEX idx_time_entries_business ON time_entries(business_id);
CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_referral_links_business ON referral_links(business_id);
CREATE INDEX idx_referral_links_code ON referral_links(code);
CREATE INDEX idx_team_members_business ON team_members(business_id);
CREATE INDEX idx_team_members_invite_token ON team_members(invite_token);
CREATE INDEX idx_automations_business ON automations(business_id);
CREATE INDEX idx_file_attachments_business ON file_attachments(business_id);
CREATE INDEX idx_file_attachments_project ON file_attachments(project_id);
