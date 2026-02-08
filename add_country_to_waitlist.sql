-- Add country column to waitlist table
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'unknown';

-- Upravíme check constraint pokud by byl potřeba (zatím není, text je volný)
