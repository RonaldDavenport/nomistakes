-- Invoicing system: invoices table + auto-incrementing invoice numbers

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  due_date TIMESTAMPTZ,
  notes TEXT,
  terms TEXT,
  access_token TEXT NOT NULL DEFAULT encode(gen_random_uuid()::text::bytea, 'hex'),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_status TEXT,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, invoice_number)
);

-- Auto-increment invoice numbers per business
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access invoices" ON invoices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public can view invoices by token" ON invoices FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_invoices_business ON invoices(business_id);
CREATE INDEX idx_invoices_contact ON invoices(contact_id);
CREATE INDEX idx_invoices_status ON invoices(business_id, status);
CREATE INDEX idx_invoices_access_token ON invoices(access_token);
CREATE INDEX idx_invoices_due_date ON invoices(business_id, due_date);
