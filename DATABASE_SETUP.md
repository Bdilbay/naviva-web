# Database Setup Guide for Naviva Admin Dashboard

This guide will help you set up all the necessary database tables and configurations for the admin dashboard to work properly.

## Prerequisites

- Supabase project created
- Access to Supabase dashboard
- Administrative privileges

## Table Setup

### 1. Run the Messaging System Migration

Copy and paste the SQL from `supabase/migrations/001_messaging_system.sql` into Supabase SQL Editor:

1. Go to your Supabase project
2. Click on "SQL Editor"
3. Click "+ New Query"
4. Paste the contents of `supabase/migrations/001_messaging_system.sql`
5. Click "Run"

This will create the following tables:
- `conversations` - User conversations
- `messages` - Messages with soft-delete capability
- `blocked_words` - Censorship/content filtering
- `message_reports` - Moderation reports
- `user_blocks` - User blocking system

### 2. Run the Banner System Migration

Copy and paste the SQL from `supabase/migrations/002_banner_system.sql` into Supabase SQL Editor:

1. Go to your Supabase project
2. Click on "SQL Editor"
3. Click "+ New Query"
4. Paste the contents of `supabase/migrations/002_banner_system.sql`
5. Click "Run"

This will create:
- `banners` - Ad banner management table with RLS policies
- Indexes for efficient queries
- Proper RLS policies for admin-only write access
- Automatic updated_at timestamp updates

### 2. Verify Existing Tables

The following tables should already exist from the mobile app setup:
- `auth.users` - Supabase authentication users
- `boats` - Boat profiles
- `boat_logs` - Boat activity logs
- `alerts` - Boat alerts
- `trips` - Boat trips
- `listings` - Web platform listings
- `master_profiles` - Master/service provider profiles
- `categories` - Service categories
- `reviews` - User reviews

If any are missing, create them according to your application needs.

## Admin Users Setup

### Add Users to Admin Roles

To grant admin/moderator access to users, you need to update their role in the auth metadata:

#### Via Supabase Dashboard:

1. Go to Authentication → Users
2. Click on the user you want to make admin
3. Click "Update User"
4. In "Raw User Meta Data", add:
```json
{
  "role": "super_admin"
}
```

Valid roles:
- `super_admin` - Full access
- `moderator` - Limited moderation access
- `user` - Regular user (default)
- `master` - Service provider

#### Via SQL:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"super_admin"'::jsonb
)
WHERE email = 'admin@example.com';
```

## Content Filtering Setup

### Add Blocked Words

To add words/phrases that should be censored:

```sql
INSERT INTO blocked_words (word, replacement, severity, created_by) VALUES
('badword1', '[CENSORED]', 'high', NULL),
('badword2', '[REDACTED]', 'medium', NULL),
('spamphrase', '[REMOVED]', 'low', NULL);
```

## Testing the Setup

### 1. Test Authentication

Visit `/admin` - you should be redirected to login if not authenticated

### 2. Test Messaging

Send a message through the app with content that contains a blocked word - it should be filtered

### 3. Test Moderation

Go to `/admin/moderation` and check:
- Blocked words list is displayed
- You can add new blocked words
- You can delete blocked words

### 4. Test Messages Admin

Go to `/admin/messages` and check:
- Conversations list is displayed
- You can select conversations
- You can view messages
- You can delete messages with reasons

## Database Schema Overview

### conversations
```
id (UUID) - Primary key
user_1_id (UUID) - First user
user_2_id (UUID) - Second user
created_at (TIMESTAMP)
last_message_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### messages
```
id (UUID) - Primary key
conversation_id (UUID) - Foreign key to conversations
sender_id (UUID) - Message sender
content (TEXT) - Message content
is_deleted (BOOLEAN) - Soft delete flag
deleted_reason (TEXT) - Why it was deleted
deleted_by (UUID) - Who deleted it
created_at (TIMESTAMP)
edited_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### blocked_words
```
id (UUID) - Primary key
word (TEXT) - Word/phrase to block (UNIQUE)
replacement (TEXT) - What to replace with
severity (TEXT) - 'low', 'medium', 'high'
created_by (UUID) - Admin who added it
created_at (TIMESTAMP)
```

### message_reports
```
id (UUID) - Primary key
message_id (UUID) - Reported message
reporter_id (UUID) - User who reported
reason (TEXT) - Why it was reported
status (TEXT) - 'pending', 'reviewed', 'resolved', 'dismissed'
reviewed_by (UUID) - Admin who reviewed
reviewed_at (TIMESTAMP)
action_taken (TEXT) - What action was taken
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### user_blocks
```
id (UUID) - Primary key
blocker_id (UUID) - User doing the blocking
blocked_id (UUID) - User being blocked
reason (TEXT) - Optional reason
created_at (TIMESTAMP)
```

## Security & RLS Policies

All tables have Row Level Security (RLS) enabled:

- **conversations**: Users can only see conversations they're part of
- **messages**: Users can only see messages in their conversations
- **blocked_words**: Anyone can view, admins can manage
- **message_reports**: Users can report, admins can review
- **user_blocks**: Users can manage their own blocks

## Troubleshooting

### "Admin not authorized" error
Make sure the user has `super_admin` or `moderator` role set in auth.users metadata

### "Table not found" error
Run the migration SQL to create missing tables

### Messages not appearing
Check that:
1. Conversations table has data
2. Messages table has data
3. RLS policies aren't blocking access
4. User IDs match between conversations and messages

### Blocked words not filtering
1. Check blocked_words table has entries
2. Make sure severity is set correctly
3. Test with exact word match (case-insensitive)
4. Check browser console for errors

## Dashboard URLs

- **Admin Home**: `/admin`
- **Messages**: `/admin/messages`
- **Moderation**: `/admin/moderation`
- **Users**: `/admin/users`
- **Listings**: `/admin/listings`
- **Masters**: `/admin/masters`
- **Settings**: `/admin/settings`
- **Mobile Data**: `/admin/mobile-data`
- **Web Data**: `/admin/web-data`
- **Statistics**: `/admin/stats`

## Next Steps

1. Complete the database setup using this guide
2. Test all admin pages
3. Configure blocked words for your community guidelines
4. Set up additional admin/moderator users as needed
5. Test the messaging system end-to-end
