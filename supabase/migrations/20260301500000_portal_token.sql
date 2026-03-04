-- Add portal_token to contacts for client portal access
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS portal_token TEXT DEFAULT gen_random_uuid()::text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_portal_token ON contacts(portal_token);
