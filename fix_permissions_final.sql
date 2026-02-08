-- 1. Zajistíme základní oprávnění pro roli 'anon' (veřejnost)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE waitlist TO anon;
GRANT USAGE, SELECT ON SEQUENCE waitlist_id_seq TO anon;

-- 2. Resetujeme Row Level Security policies
DROP POLICY IF EXISTS "Public insert" ON waitlist;
DROP POLICY IF EXISTS "Admin only read" ON waitlist;
-- Smažeme i případné jiné, pokud existují
DROP POLICY IF EXISTS "Enable insert for all" ON waitlist;

-- 3. Vytvoříme novou, velmi jednoduchou policy pro vkládání
CREATE POLICY "Public insert" 
ON waitlist 
FOR INSERT 
TO anon
WITH CHECK (true);

-- 4. Ujistíme se, že RLS je zapnuté (pro bezpečnost)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
