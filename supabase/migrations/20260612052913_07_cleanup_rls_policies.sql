-- Clean up overlapping RLS policies on listings
-- Keep only what's needed for single-seller model

-- INSERT: Only admin can insert
DROP POLICY IF EXISTS "listings_insert_own" ON listings;
DROP POLICY IF EXISTS "sellers_insert_listings" ON listings;

-- SELECT: Public can see active, admin can see all, seller can see own
DROP POLICY IF EXISTS "listings_select_public" ON listings;
DROP POLICY IF EXISTS "public_select_listings" ON listings;

-- UPDATE: Only admin can update
DROP POLICY IF EXISTS "listings_update_own" ON listings;
DROP POLICY IF EXISTS "listings_update_admin" ON listings;
DROP POLICY IF EXISTS "sellers_update_listings" ON listings;

-- DELETE: Only admin can delete
DROP POLICY IF EXISTS "listings_delete_own" ON listings;
DROP POLICY IF EXISTS "listings_delete_admin" ON listings;
DROP POLICY IF EXISTS "sellers_delete_listings" ON listings;

-- Recreate simplified policies
-- SELECT: Public sees active listings; authenticated users see their own OR active; admin sees all
CREATE POLICY "select_listings" ON listings FOR SELECT
  TO authenticated USING (
    status = 'active'
    OR seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "anon_select_active" ON listings FOR SELECT
  TO anon USING (status = 'active');

-- INSERT: Admin only
CREATE POLICY "admin_insert" ON listings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- UPDATE: Admin only
CREATE POLICY "admin_update" ON listings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DELETE: Admin only
CREATE POLICY "admin_delete" ON listings FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Clean up duplicate auction policies
DROP POLICY IF EXISTS "auctions_insert_seller" ON auctions;
DROP POLICY IF EXISTS "auctions_update_seller" ON auctions;

-- Keep existing admin policies for auctions
