-- Fix banners RLS policies - drop old ones and create new ones
DROP POLICY IF EXISTS "banners_select_active" ON public.banners;
DROP POLICY IF EXISTS "banners_insert_admin" ON public.banners;
DROP POLICY IF EXISTS "banners_update_admin" ON public.banners;
DROP POLICY IF EXISTS "banners_delete_admin" ON public.banners;

-- Policy 1: Allow anyone to SELECT active banners
CREATE POLICY "banners_select_active" ON public.banners
  FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- Policy 2: Allow authenticated users to INSERT (simplified)
CREATE POLICY "banners_insert_authenticated" ON public.banners
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 3: Allow authenticated users to UPDATE
CREATE POLICY "banners_update_authenticated" ON public.banners
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Policy 4: Allow authenticated users to DELETE
CREATE POLICY "banners_delete_authenticated" ON public.banners
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Ensure proper grants
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
