-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Public insert" ON waitlist;

-- Re-create the policy explicitly for the 'anon' role
CREATE POLICY "Public insert" ON waitlist FOR INSERT TO anon WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Grant usage on sequence just in case (usually not needed for identity but good practice)
GRANT USAGE, SELECT ON SEQUENCE waitlist_id_seq TO anon;
