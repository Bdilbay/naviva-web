-- Create banners table for admin dashboard
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_url text,
  link_url text,
  position text NOT NULL CHECK (position IN ('home_hero', 'sidebar', 'footer', 'market_top')),
  width integer,
  height integer,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for position queries
CREATE INDEX IF NOT EXISTS idx_banners_position ON public.banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to SELECT active banners
-- (for public display on website)
CREATE POLICY "banners_select_active" ON public.banners
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR auth.users.raw_user_meta_data->>'role' = 'admin')
  ));

-- Policy 2: Allow admins to INSERT
CREATE POLICY "banners_insert_admin" ON public.banners
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR auth.users.raw_user_meta_data->>'role' = 'admin')
  ));

-- Policy 3: Allow admins to UPDATE
CREATE POLICY "banners_update_admin" ON public.banners
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR auth.users.raw_user_meta_data->>'role' = 'admin')
  ));

-- Policy 4: Allow admins to DELETE
CREATE POLICY "banners_delete_admin" ON public.banners
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR auth.users.raw_user_meta_data->>'role' = 'admin')
  ));

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER banners_update_timestamp
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION update_banners_updated_at();

-- Add grant statements for anon and authenticated users
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO authenticated;
