-- Migration: 001_master_portfolio
-- Description: Create master work portfolio table for before/after photos and projects
-- Date: 2026-04-18

CREATE TABLE IF NOT EXISTS public.master_work_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES public.master_profiles(id) ON DELETE CASCADE,

  -- Basic info
  title text NOT NULL,
  description text,
  work_date date,
  category text, -- e.g., 'motor', 'hull', 'electrical', 'plumbing', 'other'

  -- Media
  before_photo_url text,
  after_photo_url text,
  additional_photos text[] DEFAULT '{}', -- Array of URLs
  video_url text, -- YouTube or embedded video URL

  -- Metadata
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_master_portfolio_master_id
  ON public.master_work_portfolio(master_id);

CREATE INDEX IF NOT EXISTS idx_master_portfolio_created
  ON public.master_work_portfolio(master_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_master_portfolio_featured
  ON public.master_work_portfolio(master_id, is_featured, created_at DESC)
  WHERE is_featured = true;

-- Add RLS Policy
ALTER TABLE public.master_work_portfolio ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Allow anyone to view portfolio"
  ON public.master_work_portfolio FOR SELECT
  USING (true);

-- Only master can insert their own portfolio
CREATE POLICY "Masters can insert own portfolio"
  ON public.master_work_portfolio FOR INSERT
  WITH CHECK (
    master_id IN (
      SELECT id FROM public.master_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Only master can update their own portfolio
CREATE POLICY "Masters can update own portfolio"
  ON public.master_work_portfolio FOR UPDATE
  USING (
    master_id IN (
      SELECT id FROM public.master_profiles
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    master_id IN (
      SELECT id FROM public.master_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Only master can delete their own portfolio
CREATE POLICY "Masters can delete own portfolio"
  ON public.master_work_portfolio FOR DELETE
  USING (
    master_id IN (
      SELECT id FROM public.master_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Update master_profiles to add portfolio_count
ALTER TABLE public.master_profiles
ADD COLUMN IF NOT EXISTS portfolio_count integer DEFAULT 0;

-- Create trigger to update portfolio count
CREATE OR REPLACE FUNCTION public.update_master_portfolio_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.master_profiles
  SET portfolio_count = (
    SELECT COUNT(*) FROM public.master_work_portfolio
    WHERE master_id = COALESCE(NEW.master_id, OLD.master_id)
  )
  WHERE id = COALESCE(NEW.master_id, OLD.master_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_portfolio_count ON public.master_work_portfolio;
CREATE TRIGGER trigger_update_portfolio_count
AFTER INSERT OR DELETE ON public.master_work_portfolio
FOR EACH ROW EXECUTE FUNCTION public.update_master_portfolio_count();
