# 📊 Database Migration Guide

**Phase 1 Migrations** — Apply these in order to Supabase

---

## 🚀 Quick Start

### Option 1: Supabase Web Console (Easiest)

1. **Go to:** https://app.supabase.com → Select your project → SQL Editor
2. **Create new query** for each migration
3. **Copy-paste** each SQL file below
4. **Run** each migration in order

### Option 2: Supabase CLI

```bash
# Install if not already done
npm install --save-dev supabase

# Login to Supabase
npx supabase login

# Create migration from files
npx supabase migration new phase1_tables

# Apply migrations
npx supabase migration up
```

---

## 📋 Migration Order

**IMPORTANT:** Apply in this exact order!

### 1️⃣ **001_master_portfolio.sql** ⏱️ ~5 minutes

**Purpose:** Create master work portfolio gallery table

**What it does:**
- Creates `master_work_portfolio` table
- Adds portfolio_count to `master_profiles`
- Sets up RLS policies (anyone can view)
- Creates trigger to auto-update count

**Before running:** ✅ Ensure `master_profiles` table exists

**After running:**
```sql
-- Test it worked
SELECT COUNT(*) FROM public.master_work_portfolio;
-- Should return: 0 rows
```

---

### 2️⃣ **002_enhanced_reviews.sql** ⏱️ ~5 minutes

**Purpose:** Add photo and detailed ratings to reviews

**What it does:**
- Adds 5 new rating columns to `master_reviews`
- Creates `master_review_metrics` view
- Adds helper function `get_master_rating_distribution()`
- Creates indexes for performance

**Before running:** ✅ Ensure `master_reviews` table exists

**After running:**
```sql
-- Test the view
SELECT * FROM public.master_review_metrics LIMIT 5;

-- Test the function
SELECT * FROM public.get_master_rating_distribution('YOUR_MASTER_ID_HERE'::uuid);
```

---

### 3️⃣ **003_verification_badges.sql** ⏱️ ~5 minutes

**Purpose:** Create verification badges system

**What it does:**
- Creates `master_verification_badges` table
- Adds `has_verified_badges` to `master_profiles`
- Sets up RLS policies
- Creates trigger to update master profile

**Before running:** ✅ Ensure `master_profiles` table exists

**After running:**
```sql
-- Test it worked
SELECT COUNT(*) FROM public.master_verification_badges;
-- Should return: 0 rows

-- Test function
SELECT * FROM public.get_master_verification_badges('YOUR_MASTER_ID_HERE'::uuid);
```

---

### 4️⃣ **004_notifications.sql** ⏱️ ~5 minutes

**Purpose:** Create notifications system

**What it does:**
- Creates `user_notifications` table
- Creates `notification_preferences` table
- Sets up RLS policies
- Creates helper functions

**Before running:** ✅ Ensure `auth.users` table exists (automatically in Supabase)

**After running:**
```sql
-- Test it worked
SELECT COUNT(*) FROM public.user_notifications;
-- Should return: 0 rows

-- Check preferences table exists
SELECT COUNT(*) FROM public.notification_preferences;
```

---

## ✅ Verification Checklist

After running all migrations:

```sql
-- 1. Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- Should include: master_work_portfolio, user_notifications, notification_preferences, master_verification_badges

-- 2. Check views exist
SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'public' ORDER BY viewname;
-- Should include: master_review_metrics

-- 3. Check functions exist
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;
-- Should include functions for notifications, badges, etc.

-- 4. Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;
-- Should have many idx_* indexes

-- 5. Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
-- All new tables should have rowsecurity = true
```

---

## 🔧 How to Apply in Supabase Console

1. **Open SQL Editor**
   - Go to Supabase dashboard
   - Click "SQL Editor" tab
   - Click "New Query"

2. **Copy entire SQL file** (001_master_portfolio.sql)

3. **Paste into editor**

4. **Click "Run"** (or Ctrl+Enter)

5. **Check for errors**
   - Green = Success ✅
   - Red = Error ❌
   - Fix and retry

6. **Repeat for 002, 003, 004**

---

## 🔄 Real-time Subscriptions Setup

After migrations, enable real-time for notifications:

```sql
-- In Supabase Console → Replication

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_preferences;
```

Or use Supabase Dashboard:
1. Go to Project Settings → Replication
2. Toggle ON for:
   - user_notifications
   - notification_preferences

---

## 🗑️ Rollback Instructions

If something goes wrong:

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS public.user_notifications CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.master_verification_badges CASCADE;
-- (master_reviews already exists, just removes new columns)
ALTER TABLE public.master_reviews DROP COLUMN IF EXISTS photo_url CASCADE;
ALTER TABLE public.master_reviews DROP COLUMN IF EXISTS communication_rating CASCADE;
-- ... repeat for other columns

DROP TABLE IF EXISTS public.master_work_portfolio CASCADE;
ALTER TABLE public.master_profiles DROP COLUMN IF EXISTS portfolio_count CASCADE;
ALTER TABLE public.master_profiles DROP COLUMN IF EXISTS has_verified_badges CASCADE;
```

---

## 📱 Mobile App Schema Sync

The Flutter app will automatically sync once you've applied migrations:

```dart
// In master_repository.dart - add these methods:

Future<List<PortfolioItem>> fetchMasterPortfolio(String masterId) async {
  final response = await Supabase.instance.client
    .from('master_work_portfolio')
    .select()
    .eq('master_id', masterId)
    .order('created_at', ascending: false);
  
  return (response as List).map((e) => PortfolioItem.fromMap(e)).toList();
}

Future<ReviewMetrics> fetchReviewMetrics(String masterId) async {
  final response = await Supabase.instance.client
    .from('master_review_metrics')
    .select()
    .eq('master_id', masterId)
    .single();
  
  return ReviewMetrics.fromMap(response);
}
```

---

## ⚠️ Important Notes

1. **Backup First**
   - Before running migrations, take Supabase backup
   - Settings → Backups → Create backup

2. **Test in Staging**
   - Create staging Supabase project
   - Run migrations there first
   - Test with test data
   - Then apply to production

3. **Schema Migration Order**
   - MUST be run in order (001, 002, 003, 004)
   - Each depends on previous tables

4. **Encryption**
   - Sensitive data (tax IDs, docs) should be encrypted
   - Implement in application layer
   - Don't store plain-text PII in database

5. **Performance**
   - All indexes created automatically
   - Monitor query performance if using production data
   - Add more indexes if needed based on query patterns

---

## 🚀 Next Steps After Migrations

Once migrations are applied:

1. **Check Supabase Dashboard**
   - Verify tables in "Table Editor"
   - Check row counts (should be 0)
   - Verify RLS policies are visible

2. **Start API Development**
   - Create Next.js API routes in `src/app/api/`
   - Begin with `/api/masters/[id]/portfolio/*`
   - Move to reviews, badges, notifications

3. **Update TypeScript Types**
   - Create types matching new tables
   - Export from `src/types/index.ts`
   - Use in API responses

4. **Begin Frontend Components**
   - Build portfolio gallery component
   - Create notification center
   - Implement verification badges

---

## 💬 Troubleshooting

### Error: "relation already exists"
```
Solution: Check if table already exists. 
The migrations use "CREATE TABLE IF NOT EXISTS"
This error means table already exists - safe to ignore
```

### Error: "column already exists"
```
Solution: Same as above - the column already exists.
Safe to ignore.
```

### Error: "permission denied"
```
Solution: Check Supabase user role permissions.
Ensure your user has superuser or create/alter privileges.
```

### Functions not working
```
Solution: Check if function was created:
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'your_function_name';

If not there, run the migration again.
```

---

## 📊 After Migration - Data Structure

```
master_profiles (existing)
├─ portfolio_count (new)
├─ has_verified_badges (new)
└─ notification_preferences (new jsonb)

master_work_portfolio (new)
├─ id
├─ master_id (FK)
├─ title, description, category
├─ before_photo_url, after_photo_url, video_url
├─ is_featured, view_count
└─ created_at, updated_at

master_reviews (enhanced)
├─ Existing columns...
├─ photo_url (new)
├─ communication_rating (new)
├─ quality_rating (new)
├─ value_rating (new)
├─ professionalism_rating (new)
└─ recommendation_rating (new)

master_verification_badges (new)
├─ id, master_id
├─ phone_verified, identity_verified, business_verified
├─ certifications (jsonb array)
├─ verification_level
└─ created_at, updated_at

user_notifications (new)
├─ id, user_id
├─ type, title, message
├─ related_id, related_type
├─ is_read, is_dismissed
├─ severity, action_url
└─ created_at

notification_preferences (new)
├─ id, user_id
├─ weather_alerts, price_alerts, etc. (boolean flags)
├─ notification_frequency
├─ quiet_hours_enabled, quiet_hours_start/end
└─ created_at, updated_at
```

---

**Ready to apply? Start with 001_master_portfolio.sql! ✨**
