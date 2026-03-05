-- Tier rename: starter→solo, growth→scale, drop pro
-- Plus: application-level trial system (no Stripe trial, no CC required)

-- 1. Rename plan values in profiles
UPDATE profiles SET plan = 'solo' WHERE plan = 'starter';
UPDATE profiles SET plan = 'scale' WHERE plan = 'growth';
UPDATE profiles SET plan = 'scale' WHERE plan = 'pro';

-- 2. Add trial tracking columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_activated_at TIMESTAMPTZ;

-- 3. Add site regen counter + trial outreach cap to businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS site_regen_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trial_outreach_count INTEGER NOT NULL DEFAULT 0;

-- 4. Rename tier values in businesses table
UPDATE businesses SET tier = 'solo' WHERE tier = 'starter';
UPDATE businesses SET tier = 'scale' WHERE tier = 'growth';
UPDATE businesses SET tier = 'scale' WHERE tier = 'pro';

-- 5. Update CHECK constraint on businesses.tier
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_tier_check;
ALTER TABLE businesses ADD CONSTRAINT businesses_tier_check
  CHECK (tier IN ('free', 'solo', 'scale'));
