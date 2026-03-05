-- Fix tier column DEFAULT after constraint rename (starter→solo/scale)
-- Old default 'starter' violates the updated CHECK constraint, breaking all new business inserts
ALTER TABLE businesses ALTER COLUMN tier SET DEFAULT 'free';
