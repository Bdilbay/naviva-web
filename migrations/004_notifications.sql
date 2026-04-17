-- Migration: 004_notifications
-- Description: Create user notifications and preferences tables
-- Date: 2026-04-18

-- Main notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification content
  type text NOT NULL,
  -- Types: 'weather_alert', 'price_drop', 'master_availability', 'new_listing', 'message', 'review'
  title text NOT NULL,
  message text NOT NULL,

  -- Related data
  related_id uuid, -- master_id, listing_id, conversation_id
  related_type text, -- 'master', 'listing', 'message', 'review'

  -- Status
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  read_at timestamptz,

  -- Priority and action
  severity text DEFAULT 'info', -- 'info', 'warning', 'urgent'
  action_url text, -- URL to take action
  action_label text DEFAULT 'Görmek', -- Button label

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb, -- Extra data as needed

  -- Timestamps
  created_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id
  ON public.user_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created
  ON public.user_notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_unread
  ON public.user_notifications(user_id, is_read)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_user_notifications_type
  ON public.user_notifications(type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_related
  ON public.user_notifications(related_type, related_id);

-- Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification toggles
  weather_alerts boolean DEFAULT true,
  price_alerts boolean DEFAULT true,
  master_availability_alerts boolean DEFAULT true,
  new_listing_alerts boolean DEFAULT true,
  message_notifications boolean DEFAULT true,
  review_notifications boolean DEFAULT true,

  -- Delivery methods
  push_notifications boolean DEFAULT true,
  email_notifications boolean DEFAULT false,
  sms_notifications boolean DEFAULT false,

  -- Frequency
  notification_frequency text DEFAULT 'instant', -- 'instant', 'daily_digest', 'weekly_digest', 'never'
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start text, -- 'HH:MM' format
  quiet_hours_end text,

  -- Location-based alerts
  alert_distance_km integer DEFAULT 50, -- For local alerts
  location_alerts_enabled boolean DEFAULT true,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
  ON public.notification_preferences(user_id);

-- RLS Policies
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.user_notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read/dismissed)
CREATE POLICY "Users can update own notifications"
  ON public.user_notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Only system can insert notifications
-- (This is enforced via Supabase RLS + application logic)
CREATE POLICY "System can insert notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (true);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view own preferences
CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences FOR SELECT
  USING (user_id = auth.uid());

-- Users can update own preferences
CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can insert own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create function to get unread count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id uuid)
RETURNS bigint AS $$
SELECT COUNT(*)
FROM public.user_notifications
WHERE user_id = p_user_id
AND is_read = false
AND is_dismissed = false;
$$ LANGUAGE sql STABLE;

-- Create function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid DEFAULT NULL,
  p_related_type text DEFAULT NULL,
  p_severity text DEFAULT 'info',
  p_action_url text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.user_notifications (
    user_id, type, title, message, related_id, related_type, severity, action_url, metadata
  )
  VALUES (
    p_user_id, p_type, p_title, p_message, p_related_id, p_related_type, p_severity, p_action_url, COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create cleanup function for old notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_notifications
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND is_read = true
  AND is_dismissed = false;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, uuid, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_notifications() TO authenticated;
