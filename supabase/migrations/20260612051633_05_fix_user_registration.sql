-- Fix handle_new_user trigger to robustly handle username conflicts
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Get base username from metadata or email prefix
  base_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Sanitize: keep only alphanumeric and underscore, lowercase
  base_username := LOWER(REGEXP_REPLACE(base_username, '[^a-zA-Z0-9_]', '', 'g'));

  -- Ensure minimum length
  IF LENGTH(base_username) < 3 THEN
    base_username := 'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 6);
  END IF;

  -- Truncate to safe max length (leave room for numeric suffix)
  base_username := SUBSTRING(base_username, 1, 15);

  final_username := base_username;

  -- Handle uniqueness conflicts by appending incrementing number
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := SUBSTRING(base_username, 1, 13) || counter::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
      final_username
    ),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log but don't block user creation
    RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure trigger is still attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fix site_settings: enable RLS and allow all authenticated users to read
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate properly
DROP POLICY IF EXISTS "admin_read_settings" ON site_settings;
DROP POLICY IF EXISTS "admin_insert_settings" ON site_settings;
DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
DROP POLICY IF EXISTS "public_read_settings" ON site_settings;

-- Everyone (logged in or not) can read site settings for homepage display
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  USING (true);

-- Only admins can modify settings
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_insert_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );