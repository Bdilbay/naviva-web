-- Migration: 002_enhanced_reviews
-- Description: Enhance master_reviews table with photo and detailed ratings
-- Date: 2026-04-18

-- Add new columns to existing master_reviews table
ALTER TABLE public.master_reviews
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS communication_rating integer CHECK (communication_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS quality_rating integer CHECK (quality_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS value_rating integer CHECK (value_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS professionalism_rating integer CHECK (professionalism_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS recommendation_rating integer CHECK (recommendation_rating BETWEEN 1 AND 5);

-- Create index for faster metric calculations
CREATE INDEX IF NOT EXISTS idx_master_reviews_ratings
  ON public.master_reviews(master_id)
  WHERE created_at > NOW() - INTERVAL '1 year';

-- Create view for review metrics
DROP VIEW IF EXISTS public.master_review_metrics CASCADE;
CREATE VIEW public.master_review_metrics AS
SELECT
  master_id,
  ROUND(AVG(rating)::numeric, 2) as avg_overall_rating,
  ROUND(AVG(communication_rating)::numeric, 2) as avg_communication,
  ROUND(AVG(quality_rating)::numeric, 2) as avg_quality,
  ROUND(AVG(value_rating)::numeric, 2) as avg_value,
  ROUND(AVG(professionalism_rating)::numeric, 2) as avg_professionalism,
  ROUND(AVG(recommendation_rating)::numeric, 2) as avg_recommendation,
  COUNT(*) as total_reviews,
  COUNT(CASE WHEN photo_url IS NOT NULL THEN 1 END) as photo_reviews,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
FROM public.master_reviews
WHERE created_at > NOW() - INTERVAL '2 years'
GROUP BY master_id;

-- RLS Policy for new photo column
-- Photos are public (already covered by existing SELECT policy)
-- But need to ensure proper INSERT/UPDATE policies

-- Verify existing master_reviews policies are in place
-- SELECT policy should allow anyone to view
-- INSERT should require auth user
-- UPDATE/DELETE should be restricted

-- Create helper function to get rating distribution
CREATE OR REPLACE FUNCTION public.get_master_rating_distribution(p_master_id uuid)
RETURNS TABLE (
  rating_level integer,
  count bigint,
  percentage numeric
) AS $$
DECLARE
  total_reviews bigint;
BEGIN
  SELECT COUNT(*) INTO total_reviews
  FROM public.master_reviews
  WHERE master_id = p_master_id
  AND created_at > NOW() - INTERVAL '2 years';

  RETURN QUERY
  SELECT
    r.rating,
    COUNT(*)::bigint,
    ROUND((COUNT(*) * 100.0 / NULLIF(total_reviews, 0))::numeric, 2)
  FROM public.master_reviews r
  WHERE r.master_id = p_master_id
  AND r.created_at > NOW() - INTERVAL '2 years'
  GROUP BY r.rating
  ORDER BY r.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions on view and function
GRANT SELECT ON public.master_review_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_master_rating_distribution(uuid) TO anon, authenticated;
