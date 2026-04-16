# 🌐 NAVIVA WEB — Complete Portal Documentation

**Last Updated:** April 17, 2026  
**Status:** ✅ Production Ready with Master Carousel

## 📋 Project Overview

**Naviva Web Portal** is a Next.js-based boat management and marketplace platform for Turkish sailors. It features:
- Master technician directory with ratings and reviews
- Boat listings marketplace (sales, rentals, equipment)
- User messaging system
- Admin panel for moderation
- Real-time data from Supabase

## 🏗️ Architecture

### Tech Stack
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Real-time)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (images)
- **UI Components:** Lucide icons, custom components

### Key Technologies
- **React 18** - Component library
- **TypeScript** - Type safety
- **Supabase Client** - Data & auth management
- **Image Optimization** - Next.js Image component
- **i18n** - Multi-language support (Turkish/English)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Home page with carousel
│   ├── layout.tsx               # Root layout
│   ├── admin/
│   │   ├── layout.tsx           # Admin auth wrapper
│   │   ├── page.tsx             # Admin dashboard
│   │   ├── users/               # User management
│   │   ├── messages/            # Message management
│   │   └── ...
│   ├── ustalar/                 # Masters directory
│   │   ├── page.tsx             # Masters list
│   │   ├── [id]/
│   │   │   └── page.tsx         # Master detail page
│   │   └── duzenle/             # Master profile edit
│   ├── market/                  # Listings marketplace
│   │   ├── page.tsx             # Listings grid
│   │   ├── [id]/                # Listing detail
│   │   └── yeni/                # Create listing
│   ├── mesajlar/                # Messaging
│   ├── favorilerim/             # Favorites
│   ├── benim-ilanlarim/         # My listings
│   ├── ayarlar/                 # Settings
│   ├── giris/                   # Login page
│   ├── uye-ol/                  # Registration
│   └── api/                     # API routes
│       ├── auth/                # Auth endpoints
│       ├── masters/             # Master data endpoints
│       ├── listings/            # Listing endpoints
│       └── admin/               # Admin endpoints
├── components/
│   ├── MastersCarousel.tsx      # Master carousel component
│   ├── BannerSlot.tsx           # Dynamic banner display
│   ├── AnnouncementsBanner.tsx  # Announcements carousel
│   ├── layout/
│   │   ├── Navbar.tsx           # Top navigation
│   │   └── Footer.tsx
│   ├── masters/
│   │   ├── ReviewsSection.tsx   # Master reviews
│   │   ├── ReviewForm.tsx       # Submit review modal
│   │   └── ...
│   └── ...
├── lib/
│   ├── supabase.ts              # Supabase client config
│   ├── i18n/
│   │   ├── server.ts            # Server-side translations
│   │   ├── LanguageContext.tsx  # Client-side language context
│   │   └── translations.json    # Translation data
│   └── ...
├── types/
│   └── index.ts                 # TypeScript interfaces
└── styles/
    └── globals.css              # Global styles
```

## 🎯 Key Features

### Home Page (`/`)
✅ **Hero Section**
- Large branded header with call-to-action
- Gradient background with subtle effects
- Search and browse buttons

✅ **Masters Carousel**
- Auto-scrolling with pause-on-hover
- Visible left/right navigation arrows (< >)
- Square cards (320px × 320px)
- Master avatar, name, title, location, categories
- Star ratings with review counts
- Real database data from Supabase
- Smooth animation with manual controls

✅ **Category Section**
- Browse by: Boats for Sale, Rentals, Tours, Equipment
- Dynamic counts from database
- Expandable subcategories
- Color-coded sections

✅ **Listings Grid**
- Recent listings carousel/grid
- Filters: category, type
- Favorites functionality
- Mobile responsive

### Masters Directory (`/ustalar`)
✅ **Masters List**
- Grid view with search
- Filter by name, city, specialty
- Ratings and review counts
- Verified badges
- Favorites (heart icon)

✅ **Master Profile (`/ustalar/[id]`)**
- Full master details
- High-resolution photos
- Contact information
- Experience years
- Specialties/categories
- Average rating with star display
- Reviews section (expandable)
- Review submission modal

### Listings Marketplace (`/market`)
✅ **Listings Grid**
- Browse all listings
- Filters: Category, Type, Location
- Favorites system
- Pricing display

✅ **Listing Detail (`/market/[id]`)**
- Full product/boat information
- Photo gallery
- Price, specs, location
- Seller contact info
- Messaging

### Messaging (`/mesajlar`)
✅ **Conversations List**
- Active conversations with unread count
- Real-time message updates
- User avatars and last message preview

✅ **Chat Interface**
- Send/receive messages
- Real-time sync
- Message timestamps
- User presence

### Admin Panel (`/admin`)
✅ **Dashboard**
- System overview
- User statistics
- Recent activity

✅ **User Management**
- View all users
- User roles and plans
- Activity monitoring

✅ **Message Moderation**
- Review conversations
- Flag inappropriate content

### User Account
✅ **Settings (`/ayarlar`)**
- Profile information
- Password change
- Language preference

✅ **Favorites (`/favorilerim`)**
- Saved masters
- Saved listings
- Quick access

✅ **My Listings (`/benim-ilanlarim`)**
- Create new listing
- Edit existing listings
- View analytics

## 🎨 Design System

### Color Palette
```
Primary Orange:    #E67E22 (hover: #D65A0F)
Dark Background:   #0F1117 (slate-900)
Card Background:   #1A202C (slate-800)
Text Primary:      #FFFFFF
Text Secondary:    #CBD5E1 (slate-300)
Text Tertiary:     #94A3B8 (slate-400)
Accent Gold:       #FBBF24 (ratings)
Success Green:     #10B981
Error Red:         #EF4444
```

### Component Styles
- **Cards:** `rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/70 to-slate-800/40`
- **Buttons:** `bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl`
- **Inputs:** `bg-slate-800 border border-slate-700 rounded-lg focus:border-orange-500`
- **Hover Effects:** Border color change, shadow enhancement

### Typography
- **Headings:** Bold, white, 18-32px
- **Body:** Regular, slate-300, 14-16px
- **Labels:** Small, slate-400, 12px

## 🔄 Master Carousel Feature

### Component: `MastersCarousel.tsx`
**Purpose:** Display scrolling carousel of master profiles

**Features:**
- Auto-scroll animation (0.5px per frame)
- Pause on hover
- Manual navigation with left/right arrows
- Square card format (w-80 h-80)
- Shows: avatar, name, title, location, categories, rating

**Data Flow:**
```
page.tsx (getRecentMasters)
  ↓
MastersCarousel (receives masters array)
  ↓
MasterCardItem (renders individual cards)
```

**Key Props:**
```typescript
interface MastersCarouselProps {
  masters: MasterProfile[]
  t: Translations
}
```

**Navigation Buttons:**
- Left button: `<` (HTML entity) - scroll left
- Right button: `>` (HTML entity) - scroll right
- Always visible with orange background
- Click to manually navigate 1 card width

## 📊 Database Integration

### Master Profiles Table
```typescript
interface MasterProfile {
  id: string
  user_id: string
  name: string              // NOT full_name
  title?: string
  bio?: string
  city?: string             // NOT location_city
  phone?: string
  email?: string
  categories?: string[]
  experience_years?: number
  photo_url?: string
  avg_rating?: number
  review_count?: number
  verified?: boolean
  listed_publicly: boolean
  created_at: string
}
```

### Listings Table
```typescript
interface Listing {
  id: string
  user_id: string
  category: string
  title: string
  description?: string
  price?: number
  location_city?: string
  photos: string[]
  status: string
  created_at: string
  // ... boat/equipment specific fields
}
```

### Master Reviews Table
```
id, master_id, reviewer_id, rating (1-5), comment, work_category, work_date, created_at
```

## 🔐 Authentication & Security

### Auth Flow
1. User registers/logs in via `/giris` or `/uye-ol`
2. Supabase Auth handles credential validation
3. JWT token stored in cookies
4. Protected routes wrapped with auth checks

### Protected Routes
- `/admin/*` - Admin only
- `/mesajlar` - Authenticated users
- `/favorilerim` - Authenticated users
- `/ayarlar` - Authenticated users

### API Security
- All API routes validate session
- Row-Level Security (RLS) enabled on Supabase
- Rate limiting on critical endpoints
- Input validation on all forms

## 🌐 Internationalization (i18n)

### Supported Languages
- **Turkish (tr)** - Default
- **English (en)** - Available

### Usage
```typescript
const { t, lang, setLang } = useLanguage()
// Server-side:
const { t } = await getTranslations()
```

### Translation Files
Located in `src/lib/i18n/translations/`

## 📱 Responsive Design

### Breakpoints
```
Mobile:  < 768px   (md breakpoint)
Tablet:  768-1024px
Desktop: > 1024px
```

### Responsive Components
- Navbar: Hamburger menu on mobile, full nav on desktop
- Grid layouts: 1 col mobile, 2-3 cols tablet, 3-4 cols desktop
- Images: Lazy loading, responsive sizing

## 🚀 Performance Optimizations

- **Image Optimization:** Next.js Image component with unoptimized flag for Supabase URLs
- **Code Splitting:** Automatic with App Router
- **Lazy Loading:** Components and images load on demand
- **Caching:** Browser cache, Supabase query caching
- **Font Loading:** System fonts (no extra font files)

## 🔄 Recent Major Updates (April 2026)

### Master Carousel Fixes
✅ Fixed data type mismatches (name vs full_name, city vs location_city)
✅ Implemented visible navigation arrows (< >)
✅ Made cards square with fixed dimensions
✅ Removed details section below carousel
✅ Simplified card content to show essentials + rating

### Component Updates
✅ Updated Navbar with improved navigation
✅ Fixed TrustedMastersList component
✅ Updated master detail page with correct field mappings

### Code Quality
✅ TypeScript interface alignment across components
✅ Removed unused dependencies
✅ Consolidated data fetching patterns

## 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Type check
npm run type-check

# Linting (if configured)
npm run lint
```

## 📝 Coding Standards

### Component Structure
```typescript
'use client'  // If client component

import { Type } from '@/types'
import { supabase } from '@/lib/supabase'

interface Props {
  prop1: Type
}

export default function MyComponent({ prop1 }: Props) {
  // Logic here
  return <div>JSX here</div>
}
```

### Data Fetching
- Server components: Direct Supabase queries
- Client components: useEffect + useState
- Error handling: Try-catch or error states

### Styling
- Tailwind CSS utilities (no custom CSS files unless needed)
- Responsive classes (e.g., `hidden md:flex`)
- Consistent spacing: gap-4, p-4, mb-6
- Color variables via Tailwind config

## 🐛 Common Issues & Solutions

### Issue: Master names not displaying
**Solution:** Use `master.name` NOT `master.full_name`
**Root Cause:** Database column is `name`, not `full_name`

### Issue: Carousel not scrolling
**Solution:** Check if animation is paused (hover state)
**Root Cause:** Auto-scroll pauses on mouse enter

### Issue: Images not loading from Supabase
**Solution:** Use `unoptimized` prop on Image component
**Reason:** Supabase URLs need direct access

## 📞 Important Files to Know

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home page with carousel |
| `src/components/MastersCarousel.tsx` | Carousel component |
| `src/components/layout/Navbar.tsx` | Top navigation |
| `src/lib/supabase.ts` | Supabase configuration |
| `src/types/index.ts` | TypeScript interfaces |
| `next.config.js` | Next.js configuration |

## 📋 Checklist for New Features

- [ ] Update TypeScript interfaces in `types/index.ts`
- [ ] Create API route in `app/api/` if needed
- [ ] Build component or page
- [ ] Add to Navbar if it's a main feature
- [ ] Test on mobile and desktop
- [ ] Update CLAUDE.md if architecture changes
- [ ] Commit with descriptive message
- [ ] Push to GitHub

## 🎓 For Future Development

1. **Before Starting:** Review this documentation
2. **Type Safety:** Always use TypeScript interfaces
3. **Database:** Check exact column names before querying
4. **Components:** Keep them focused and reusable
5. **Testing:** Test both mobile and desktop views
6. **Git:** Commit frequently with clear messages
7. **Communication:** Update CLAUDE.md for major changes

---

## 📊 Project Stats

- **Total Tables:** 13+
- **API Routes:** 15+
- **Main Components:** 20+
- **Pages:** 15+
- **Languages Supported:** 2
- **Performance Score:** Optimized for mobile-first

---

**Happy coding! Build amazing features for Naviva! 🚀**
