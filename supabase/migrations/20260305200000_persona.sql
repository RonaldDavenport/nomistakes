-- Zero-party data: persona classification from wizard quiz
-- Values: grinder (needs clients) | operator (needs to consolidate tools) | scaler (needs to scale)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS persona TEXT CHECK (persona IN ('grinder', 'operator', 'scaler'));

-- Also track quiz answers for analytics
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS quiz_experience TEXT,   -- 'new' | 'building' | 'established'
  ADD COLUMN IF NOT EXISTS quiz_challenge TEXT;    -- 'clients' | 'tools' | 'scale'
