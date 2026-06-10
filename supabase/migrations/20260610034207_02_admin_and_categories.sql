/*
# WheelVault Admin and Category Management Updates

## Changes
1. Add `role` column to profiles table for admin/user distinction
2. Add `image_url` column to categories table for admin-managed images
3. Update profiles to support admin role
4. Add RLS policies for admin access to all tables
*/

-- Add role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Add image_url to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Insert default categories with placeholder images
INSERT INTO categories (name, slug, image_url) VALUES
  ('Treasure Hunts', 'treasure-hunts', 'https://images.pexels.com/photos/1103826/pexels-photo-1103826.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Vintage Redlines', 'vintage-redlines', 'https://images.pexels.com/photos/16224989/pexels-photo-16224989.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('JDM Classics', 'jdm-classics', 'https://images.pexels.com/photos/16196935/pexels-photo-16196935.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Customs', 'customs', 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Limited Editions', 'limited-editions', 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Movie Cars', 'movie-cars', 'https://images.pexels.com/photos/1103826/pexels-photo-1103826.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT (slug) DO NOTHING;

-- Admin policies for categories
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin can manage all listings
DROP POLICY IF EXISTS "listings_update_admin" ON listings;
CREATE POLICY "listings_update_admin" ON listings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "listings_delete_admin" ON listings;
CREATE POLICY "listings_delete_admin" ON listings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR auth.uid() = seller_id);

-- Admin can manage auctions
DROP POLICY IF EXISTS "auctions_update_admin" ON auctions;
CREATE POLICY "auctions_update_admin" ON auctions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
         EXISTS (SELECT 1 FROM listings WHERE listings.id = auctions.listing_id AND listings.seller_id = auth.uid()));

-- Admin can manage orders
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
CREATE POLICY "orders_select_admin" ON orders FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin can manage users' profiles (limited)
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Admin can manage reports
DROP POLICY IF EXISTS "reports_select_admin" ON reports;
CREATE POLICY "reports_select_admin" ON reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "reports_update_admin" ON reports;
CREATE POLICY "reports_update_admin" ON reports FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin can manage verification requests
DROP POLICY IF EXISTS "verification_requests_select_admin" ON verification_requests;
CREATE POLICY "verification_requests_select_admin" ON verification_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "verification_requests_update_admin" ON verification_requests;
CREATE POLICY "verification_requests_update_admin" ON verification_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
