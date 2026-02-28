-- Add subtype column to businesses
-- Values: freelance, consulting, coaching, agency, courses, templates, ebooks, memberships
alter table public.businesses add column if not exists subtype text;
