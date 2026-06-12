-- NUKE ALL LISTINGS POLICIES - they are causing PostgREST schema cache crash
DROP POLICY IF EXISTS "admin_delete" ON listings;
DROP POLICY IF EXISTS "admin_delete_listings" ON listings;
DROP POLICY IF EXISTS "admin_insert" ON listings;
DROP POLICY IF EXISTS "admin_insert_listings" ON listings;
DROP POLICY IF EXISTS "admin_update" ON listings;
DROP POLICY IF EXISTS "admin_update_listings" ON listings;
DROP POLICY IF EXISTS "admin_select_all_listings" ON listings;
DROP POLICY IF EXISTS "select_listings" ON listings;
DROP POLICY IF EXISTS "anon_select_active" ON listings;

-- Recreate CLEAN singleton policies per command
-- SELECT: Anyone can read active listings
CREATE POLICY "listings_select" ON listings FOR SELECT USING (status = 'active');

-- INSERT: Only admin
CREATE POLICY "listings_insert" ON listings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- UPDATE: Only admin  
CREATE POLICY "listings_update" ON listings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- DELETE: Only admin
CREATE POLICY "listings_delete" ON listings FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Add missing total_earnings column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.00;

-- Force PostgREST schema reload
NOTIFY pgrst, 'reload schema';