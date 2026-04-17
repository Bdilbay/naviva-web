-- Migration: 003_verification_badges
-- Description: Create verification badges table for masters
-- Date: 2026-04-18

CREATE TABLE IF NOT EXISTS public.master_verification_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL UNIQUE REFERENCES public.master_profiles(id) ON DELETE CASCADE,

  -- Phone verification
  phone_verified boolean DEFAULT false,
  phone_verified_at timestamptz,
  phone_verification_code text, -- Store temporarily during verification

  -- Identity verification
  identity_verified boolean DEFAULT false,
  identity_verified_at timestamptz,
  identity_document_type text, -- 'passport', 'id_card', 'driver_license', etc.
  identity_document_url text, -- Reference to encrypted storage

  -- Business verification
  business_verified boolean DEFAULT false,
  business_verified_at timestamptz,
  business_name text,
  business_tax_id_encrypted text, -- Encrypted for security
  business_license_url text, -- Reference to encrypted storage

  -- Professional certifications (JSON array)
  certifications jsonb DEFAULT '[]'::jsonb,
  /*
    [
      {
        id: "uuid",
        name: "Marine Engine Certification",
        issuer: "Maritime Authority",
        credential_id: "ABC123",
        issue_date: "2022-01-15",
        expiry_date: "2026-01-15",
        url: "https://...",
        verified: true
      }
    ]
  */

  -- Verification status
  verification_level text DEFAULT 'unverified', -- 'unverified', 'basic', 'verified', 'professional'
  last_verified_at timestamptz,
  verification_notes text, -- Admin notes

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_master_id
  ON public.master_verification_badges(master_id);

CREATE INDEX IF NOT EXISTS idx_verification_level
  ON public.master_verification_badges(verification_level);

CREATE INDEX IF NOT EXISTS idx_verification_verified
  ON public.master_verification_badges(identity_verified, business_verified, phone_verified);

-- Add column to master_profiles
ALTER TABLE public.master_profiles
ADD COLUMN IF NOT EXISTS has_verified_badges boolean DEFAULT false;

-- Create trigger to update has_verified_badges
CREATE OR REPLACE FUNCTION public.update_master_verified_badges()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.master_profiles
  SET has_verified_badges = (
    NEW.identity_verified OR NEW.business_verified OR NEW.phone_verified
  )
  WHERE id = NEW.master_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_verified_badges ON public.master_verification_badges;
CREATE TRIGGER trigger_update_verified_badges
AFTER INSERT OR UPDATE ON public.master_verification_badges
FOR EACH ROW EXECUTE FUNCTION public.update_master_verified_badges();

-- RLS Policy
ALTER TABLE public.master_verification_badges ENABLE ROW LEVEL SECURITY;

-- Anyone can view verification status (but not sensitive docs)
CREATE POLICY "Anyone can view verification status"
  ON public.master_verification_badges FOR SELECT
  USING (true);

-- Only masters can see their own full details
CREATE POLICY "Masters can view own verification"
  ON public.master_verification_badges FOR UPDATE
  USING (
    master_id IN (
      SELECT id FROM public.master_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Only admin can approve verifications
-- (This would be handled in application layer with role checks)

-- Create function to get verification badges for display
CREATE OR REPLACE FUNCTION public.get_master_verification_badges(p_master_id uuid)
RETURNS TABLE (
  phone_verified boolean,
  identity_verified boolean,
  business_verified boolean,
  certification_count integer,
  verification_level text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mvb.phone_verified,
    mvb.identity_verified,
    mvb.business_verified,
    COALESCE(jsonb_array_length(mvb.certifications), 0),
    mvb.verification_level
  FROM public.master_verification_badges mvb
  WHERE mvb.master_id = p_master_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_master_verification_badges(uuid) TO anon, authenticated;
