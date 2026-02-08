-- 1. Zapnutí RLS (zabezpečení)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 2. Odstranění starých policies
DROP POLICY IF EXISTS "Public insert" ON waitlist;
DROP POLICY IF EXISTS "Admin only read" ON waitlist;
DROP POLICY IF EXISTS "Enable insert for all" ON waitlist;

-- 3. Policy pro veřejné vkládání (INSERT only)
-- 'anon' může vkládat, ale nemůže číst (SELECT)
CREATE POLICY "Public insert" 
ON waitlist 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- 4. Ujištění, že SELECT je zakázán (implicitně blokováno RLS, ale pro jistotu žádná policy pro SELECT)
-- (Žádná policy pro SELECT = nikdo kromě service_role nemůže číst)
