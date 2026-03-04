-- Digital Products & Memberships

-- ═══════════════════════════════
-- 1. PRODUCTS (ebooks, templates, courses, etc.)
-- ═══════════════════════════════

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'digital',
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'draft',
  file_url TEXT,
  file_name TEXT,
  thumbnail_url TEXT,
  download_limit INTEGER,
  metadata JSONB DEFAULT '{}',
  sales_count INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════
-- 2. PRODUCT PURCHASES
-- ═══════════════════════════════

CREATE TABLE product_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  download_count INTEGER DEFAULT 0,
  access_token TEXT NOT NULL DEFAULT encode(gen_random_uuid()::text::bytea, 'hex'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════
-- 3. MEMBERSHIPS
-- ═══════════════════════════════

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  interval TEXT NOT NULL DEFAULT 'monthly',
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'draft',
  features TEXT[] DEFAULT '{}',
  stripe_price_id TEXT,
  member_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════
-- 4. MEMBERSHIP SUBSCRIBERS
-- ═══════════════════════════════

CREATE TABLE membership_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES memberships(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════
-- 5. PROJECTS / DELIVERABLES
-- ═══════════════════════════════

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════
-- RLS
-- ═══════════════════════════════

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own products" ON products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role products" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public view active products" ON products FOR SELECT USING (status = 'active');

CREATE POLICY "Service role purchases" ON product_purchases FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public can insert purchases" ON product_purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own purchases" ON product_purchases FOR SELECT USING (true);

CREATE POLICY "Users manage own memberships" ON memberships FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role memberships" ON memberships FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public view active memberships" ON memberships FOR SELECT USING (status = 'active');

CREATE POLICY "Service role subscribers" ON membership_subscribers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public can view own subscriptions" ON membership_subscribers FOR SELECT USING (true);
CREATE POLICY "Public can insert subscriptions" ON membership_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role projects" ON projects FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users manage own deliverables" ON deliverables FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = deliverables.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Service role deliverables" ON deliverables FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════
-- INDEXES
-- ═══════════════════════════════

CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_products_status ON products(business_id, status);
CREATE INDEX idx_product_purchases_product ON product_purchases(product_id);
CREATE INDEX idx_product_purchases_business ON product_purchases(business_id);
CREATE INDEX idx_product_purchases_token ON product_purchases(access_token);
CREATE INDEX idx_memberships_business ON memberships(business_id);
CREATE INDEX idx_membership_subs_membership ON membership_subscribers(membership_id);
CREATE INDEX idx_membership_subs_business ON membership_subscribers(business_id);
CREATE INDEX idx_projects_business ON projects(business_id);
CREATE INDEX idx_projects_contact ON projects(contact_id);
CREATE INDEX idx_deliverables_project ON deliverables(project_id);
