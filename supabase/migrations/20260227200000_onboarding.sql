-- Add onboarding columns to businesses table
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS layout text DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS calendly_url text,
  ADD COLUMN IF NOT EXISTS business_email text,
  ADD COLUMN IF NOT EXISTS onboarding_step int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
