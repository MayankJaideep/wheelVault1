-- Site settings table for admin-controlled content
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_banner_url TEXT,
  hero_title TEXT DEFAULT 'Collect, Trade & Sell Hot Wheels',
  hero_subtitle TEXT DEFAULT 'Join thousands of collectors buying, selling, and auctioning rare Hot Wheels and die-cast treasures.',
  feature_banner_url TEXT,
  feature_title TEXT,
  feature_subtitle TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default settings
INSERT INTO site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- Admin policies for site_settings
CREATE POLICY "admin_read_settings" ON site_settings FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_insert_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow public read for displaying on frontend
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon USING (id = 'default');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_id ON site_settings(id);