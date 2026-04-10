# Naviva Admin Dashboard - Complete Documentation

## Overview

The Naviva Admin Dashboard is a comprehensive platform management tool that allows super-admins and moderators to:

- Manage user accounts and permissions
- Monitor and moderate user messaging
- Filter harmful content
- Manage listings and master profiles
- View platform statistics
- Configure system settings

## Architecture

### Admin Dashboard Pages

#### 1. **Messages** (`/admin/messages`)
Manage user-to-user conversations and messages.

**Features:**
- View all conversations between users
- Search conversations by user email
- Select and view messages in detail
- Delete messages with documented reasons (soft-delete)
- Message count tracking
- Last message timestamp

**Data Flow:**
```
/admin/messages
  ↓
fetchConversations() → conversations table
                    → count messages per conversation
                    → Get user info
  ↓
Display conversation list (searchable)
  ↓
User clicks conversation
  ↓
fetchMessages() → messages table
               → Display with sender info
               → Allow delete with reason
```

**Database Queries:**
- `conversations`: List all conversations with message counts
- `messages`: Get all messages for a conversation
- Updates: Soft-delete messages (set is_deleted = true, add reason)

#### 2. **Moderation** (`/admin/moderation`)
Review reported messages and manage content filtering rules.

**Features:**
- View pending message reports with reason
- Review flagged messages
- Take action (resolved/dismissed) with admin notes
- View all blocked words
- Add/remove blocked words with severity levels (low/medium/high)
- Automatic blocking system for high-severity violations

**Tabs:**
- **Reports**: Pending/reviewed/all message reports
- **Blocked Words**: List and manage censored content

**Database Queries:**
- `message_reports`: Fetch pending and reviewed reports
- `blocked_words`: List all blocked words
- Updates: Change report status, add/delete blocked words

**Content Filtering Logic:**
```
User sends message
  ↓
checkContentSeverity() → Compare against blocked_words table
                      → Case-insensitive word boundary matching
                      → Track severity level (low/medium/high)
  ↓
If high severity:
  ├─ Auto-create report in message_reports
  ├─ Replace content with [CENSORED]
  └─ Notify admin
  ↓
If medium/low severity:
  ├─ Replace content with [CENSORED]
  └─ Store filtered message
  ↓
Save filtered message to messages table
```

#### 3. **Users** (`/admin/users`)
Manage platform users and their roles.

**Features:**
- View all registered users
- Change user roles (user/master/moderator/super_admin)
- Suspend/unsuspend user accounts
- Delete users permanently
- Filter by role
- Search by email

**Database Queries:**
- `auth.users`: Fetch all registered users
- Updates: Change role in user metadata, set suspension status

#### 4. **Listings** (`/admin/listings`)
Manage service listings on the platform.

**Features:**
- View all active and inactive listings
- Hide/show listings (toggle visibility)
- Feature/unfeature listings on homepage
- Delete listings
- View listing details (category, location, rating)

**Database Queries:**
- `listings`: Fetch all listings from web platform
- `master_profiles`: Get listing owner info
- Updates: Toggle is_active, is_featured, delete listings

#### 5. **Masters** (`/admin/masters`)
Manage service provider profiles.

**Features:**
- View all master profiles
- Verify/unverify profiles
- Activate/deactivate profiles
- Delete profiles
- View ratings and review counts
- Filter by verification status

**Database Queries:**
- `master_profiles`: Fetch all service providers
- `reviews`: Count reviews per master
- Updates: Set is_verified, is_active, delete profiles

#### 6. **Settings** (`/admin/settings`)
Configure system-wide settings and policies.

**Tabs:**
- **General Settings**: System configuration
- **Content Policies**: Define content rules
- **Database**: Backup and maintenance operations

**Features:**
- Add/remove content policies
- Toggle policy enforcement
- View database statistics
- Database operations (backup, cleanup)

## Core Services

### `content-filter.ts`
Content filtering and moderation service.

**Functions:**
```typescript
checkContentSeverity(content: string)
  → Returns: { hasBannedContent, severity, blockedWords }
  → Uses: Word boundary matching, case-insensitive
  → Caches: blocked_words for 5 minutes

filterContent(content: string)
  → Returns: Filtered content with [CENSORED] replacements
  → Uses: checkContentSeverity internally

logContentViolation(messageId, userId, severity, blockedWords)
  → Logs violation for admin review

clearBlockedWordsCache()
  → Manually clear cache after admin updates blocked_words
```

### `messaging-service.ts`
Complete messaging system with moderation.

**Functions:**
```typescript
getOrCreateConversation(userId1, userId2)
  → Returns: Conversation object
  → Creates if doesn't exist
  → Ensures user_1_id < user_2_id for uniqueness

sendMessage(conversationId, senderId, content)
  → Checks content severity
  → Filters content
  → Auto-creates report if high-severity
  → Updates last_message_at timestamp
  → Returns: {message, flagged, severity}

getMessages(conversationId, limit)
  → Returns: Array of messages

deleteMessage(messageId, reason)
  → Soft-delete: Sets is_deleted=true, adds reason
  → Stores who deleted it and when

reportMessage(messageId, reporterId, reason)
  → Creates entry in message_reports table
  → Sets status to 'pending'

blockUser(blockerId, blockedId, reason)
  → Prevents blocked user from messaging

isUserBlocked(blockerId, blockedId)
  → Checks if user is blocked
```

## Data Models

### Conversations
```typescript
interface Conversation {
  id: string
  user_1_id: string    // Lower UUID value
  user_2_id: string    // Higher UUID value
  last_message_at: string
  created_at: string
  message_count?: number
}
```

### Messages
```typescript
interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string        // May be filtered content
  is_deleted: boolean
  deleted_reason?: string
  deleted_by?: string
  created_at: string
  edited_at?: string
}
```

### Blocked Words
```typescript
interface BlockedWord {
  id: string
  word: string
  replacement: string    // Default: '[CENSORED]'
  severity: 'low' | 'medium' | 'high'
  created_by?: string
  created_at: string
}
```

### Message Reports
```typescript
interface MessageReport {
  id: string
  message_id: string
  reporter_id: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewed_by?: string
  reviewed_at?: string
  action_taken?: string
  created_at: string
}
```

## Security Features

### Authentication
- Only `super_admin` and `moderator` roles can access `/admin`
- Protected route in `admin/layout.tsx`
- Redirects unauthenticated users to login

### Row Level Security (RLS)
All tables have RLS enabled:

```sql
-- Conversations: Users see only their conversations
WHERE user_1_id = auth.uid() OR user_2_id = auth.uid()

-- Messages: Users see messages in their conversations
WHERE conversation_id IN (SELECT id FROM conversations WHERE ...)

-- Blocked Words: Public read, admin write
Public read, INSERT/UPDATE/DELETE requires admin role

-- Message Reports: Users can create, admins can view/update
INSERT: reporter_id = auth.uid()
SELECT/UPDATE: Admins only
```

### Content Moderation
- Automatic detection of blocked words
- Case-insensitive matching
- Severity-based auto-reporting
- Admin review workflow
- Soft-delete with audit trail

## Admin Workflow

### Typical Content Moderation Workflow

```
1. User sends message with blocked word
   ↓
2. System auto-filters content → [CENSORED]
   ↓
3. If high-severity → Auto-create report
   ↓
4. Admin sees pending report in /admin/moderation
   ↓
5. Admin reviews message and reason
   ↓
6. Admin takes action:
   a) Resolved - Message was valid, update blocked_words
   b) Dismissed - False positive, remove from reports
   ↓
7. Admin can also manually delete messages
   ↓
8. All actions logged with reason and timestamp
```

### User Management Workflow

```
1. New user signs up
   ↓
2. Admin reviews in /admin/users
   ↓
3. Admin can:
   - Change role (user → master → moderator)
   - Suspend if violating policies
   - Delete if spam/abuse
   ↓
4. Suspended users cannot login or message
   ↓
5. All changes logged with timestamp
```

## Database Relationships

```
auth.users (1) ──→ (∞) conversations
           └────────→ (∞) messages
                      └───→ message_reports
           
master_profiles ──→ reviews
                 └──→ listings

blocked_words ← message_reports (auto-created)
              ← message_reports (manually created)

conversations ──→ messages
            └────→ user_blocks
```

## Performance Optimizations

### Caching
- Blocked words cached for 5 minutes
- Cache cleared when admin adds/removes words
- Prevents repeated database queries

### Indexes
```sql
CREATE INDEX idx_conversations_user_1 ON conversations(user_1_id)
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC)
CREATE INDEX idx_messages_conversation ON messages(conversation_id)
CREATE INDEX idx_messages_created ON messages(created_at DESC)
CREATE INDEX idx_message_reports_status ON message_reports(status)
```

## Configuration

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Blocked Words Best Practices
- Start with obvious violations
- Use moderate severity for first violations
- Set high severity for severe violations
- Document your moderation policy
- Review and adjust regularly

## Common Tasks

### Add a Blocked Word
1. Go to `/admin/moderation`
2. Click "Bloke Edilen Kelimeler" tab
3. Enter word, replacement text, severity
4. Click "Ekle"

### Review a Report
1. Go to `/admin/moderation`
2. See pending reports
3. Click "İşlem Yap"
4. Add admin note explaining decision
5. Click "Çözüldü" or "Reddedildi"

### Delete a Message
1. Go to `/admin/messages`
2. Select conversation
3. Click delete icon on message
4. Enter reason for deletion
5. Click "Sil"

### Manage Users
1. Go to `/admin/users`
2. Search for user
3. Change role or suspend
4. Click "Sil" to remove permanently

## Troubleshooting

### Messages not being filtered
- Check blocked_words table has entries
- Verify word matches exactly (case-insensitive)
- Check console for errors
- Clear cache: `clearBlockedWordsCache()`

### Can't access admin dashboard
- Verify user has `super_admin` or `moderator` role
- Check auth token validity
- Try logging out and back in

### Reports not showing
- Check message_reports table
- Verify message still exists (not deleted)
- Check status filter (pending vs all)

### Conversation not appearing
- Verify both users exist
- Check conversation ID in database
- Ensure users haven't blocked each other

## Future Enhancements

- [ ] Real-time notification system for new reports
- [ ] Analytics dashboard with charts
- [ ] Bulk operations (delete multiple messages)
- [ ] Scheduled content cleanup
- [ ] Machine learning-based content filtering
- [ ] User reputation system
- [ ] Automated ban system for repeat offenders
- [ ] Export reports for legal purposes
