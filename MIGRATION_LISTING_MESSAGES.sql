-- Migration: Add listing-based messaging support
-- This adds listing_id and listing_title columns to conversations table
-- Run this in your Supabase SQL editor

ALTER TABLE conversations
ADD COLUMN listing_id UUID REFERENCES listings(id) ON DELETE SET NULL;

ALTER TABLE conversations
ADD COLUMN listing_title TEXT;

-- Create index for faster lookups
CREATE INDEX idx_conversations_listing ON conversations(listing_id);
CREATE INDEX idx_conversations_user_listing ON conversations(user_1_id, user_2_id, listing_id);

-- Update the conversations view to include listing info
-- This helps fetch conversations with listing context
CREATE OR REPLACE VIEW conversations_with_listing AS
SELECT
  c.id,
  c.user_1_id,
  c.user_2_id,
  c.listing_id,
  c.listing_title,
  c.last_message_at,
  c.created_at,
  COALESCE(l.title, c.listing_title) as current_listing_title,
  l.price,
  l.category
FROM conversations c
LEFT JOIN listings l ON c.listing_id = l.id;
