-- Track whether the user indicated they have an existing website at signup
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS has_existing_website BOOLEAN NOT NULL DEFAULT false;
