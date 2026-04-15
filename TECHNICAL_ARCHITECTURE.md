# NAVIVA - Teknik Mimari Dokümantasyon

## 🏛️ Sistem Mimarisi (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN / Load Balancer                    │
└──────┬──────────────────────────────────┬──────────────────┘
       │                                  │
   ┌───▼──────────────┐          ┌───────▼────────────┐
   │  Web Portal      │          │   Mobile App       │
   │  (Next.js 16)    │          │   (Flutter 3+)     │
   │  - Admin Panel   │          │   - iOS            │
   │  - Marketplace   │          │   - Android        │
   │  - Dashboard     │          │                    │
   │  - Messaging     │          │  State Mgmt:       │
   │                  │          │  - Riverpod        │
   │  Tech Stack:     │          │  - Provider        │
   │  - React 19      │          │                    │
   │  - TypeScript    │          │  Storage:          │
   │  - Tailwind CSS  │          │  - SharedPrefs     │
   │  - TanStack      │          │  - Local DB        │
   └───┬──────────────┘          └────────┬───────────┘
       │                                  │
       └──────────────┬───────────────────┘
                      │
          ┌───────────▼──────────────┐
          │  Supabase (Cloud)        │
          │  ├─ PostgreSQL 15+       │
          │  ├─ Authentication       │
          │  ├─ Realtime Channels    │
          │  ├─ Storage (S3)         │
          │  └─ Edge Functions       │
          └───────────┬──────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   External Services       │
        ├─ Payment Gateway (Stripe) │
        ├─ Email Service (SendGrid) │
        ├─ SMS (Twilio)             │
        └─ Analytics (Mixpanel)     │
```

---

## 🗄️ Veritabanı Şeması (Detaylı)

### **Core Tables**

#### `auth.users` (Supabase Auth)
```sql
id: UUID (PRIMARY KEY)
email: VARCHAR
encrypted_password: BYTEA
user_metadata: JSONB
  ├─ full_name: STRING
  ├─ phone: STRING
  └─ avatar_url: URL
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### `public.profiles`
```sql
id: UUID (PK) → auth.users.id
full_name: VARCHAR(255)
avatar_url: TEXT
is_admin: BOOLEAN (default: false)
is_master: BOOLEAN (default: false) -- Usta/hizmet sağlayıcı
bio: TEXT
phone: VARCHAR(20)
created_at: TIMESTAMP
updated_at: TIMESTAMP

RLS:
  - SELECT: public (own profile)
  - INSERT: authenticated
  - UPDATE: owner or admin
```

#### `public.boats`
```sql
id: UUID (PK)
user_id: UUID (FK → profiles.id)
name: VARCHAR(255) [NOT NULL]
type: VARCHAR(100) [NOT NULL]
status: ENUM('active', 'maintenance', 'inactive') [DEFAULT: 'active']
flag: VARCHAR(10)
registration_no: VARCHAR(50) [UNIQUE]
harbor_registration_no: VARCHAR(50)
year: INTEGER
length_m: DECIMAL(5,2)
beam_m: DECIMAL(5,2)
draft_m: DECIMAL(5,2)
hull_material: VARCHAR(100)
engine_model: VARCHAR(255)
captain_name: VARCHAR(255)
home_port: VARCHAR(255)
last_maintenance: DATE
image_url: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP

INDEXES:
  - (user_id, created_at)
  - (registration_no) [UNIQUE]

RLS:
  - SELECT: owner, admin
  - INSERT/UPDATE: owner, admin
  - DELETE: owner, admin
```

### **Module Tables (14 Modül)**

#### `public.boat_faults` (Arıza Kayıtları)
```sql
id: UUID (PK)
boat_id: UUID (FK → boats.id) [NOT NULL]
user_id: UUID (FK → profiles.id)
title: VARCHAR(255) [NOT NULL]
description: TEXT
location: VARCHAR(255)
category: VARCHAR(100)
date: DATE [NOT NULL]
severity: ENUM('low', 'medium', 'high') [DEFAULT: 'medium']
status: ENUM('open', 'in_progress', 'closed') [DEFAULT: 'open']
master_name: VARCHAR(255)
actual_cost: DECIMAL(10,2)
image_url: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP

INDEXES:
  - (boat_id, status, severity)
  - (date DESC)
```

#### `public.boat_logs` (Seyir Günlüğü)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
date: DATE [NOT NULL]
from_port: VARCHAR(255)
to_port: VARCHAR(255)
dep_time: TIME (HH:mm)
arr_time: TIME
course_true: INTEGER (0-359)
speed_kn: DECIMAL(5,2)
distance_nm: DECIMAL(8,2)
wind_dir: VARCHAR(3) -- N, NE, E, etc.
wind_beaufort: INTEGER (0-12)
wave_height_m: DECIMAL(4,2)
pressure_hpa: INTEGER
visibility: VARCHAR(50)
eng_hours_start: INTEGER
eng_hours_end: INTEGER
fuel_pct: INTEGER (0-100)
water_pct: INTEGER (0-100)
battery_v: DECIMAL(4,2)
notes: TEXT
crew: TEXT[] -- Array of crew member names
created_at: TIMESTAMP

INDEXES:
  - (boat_id, date DESC)
```

#### `public.boat_routes` (Rota & Harita)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
name: VARCHAR(255) [NOT NULL]
description: TEXT
start_location: VARCHAR(255)
end_location: VARCHAR(255)
distance_nm: DECIMAL(8,2)
estimated_time: VARCHAR(50) -- "5 saat 30 min"
status: ENUM('planned', 'active', 'completed')
coordinates: JSONB -- GeoJSON LineString
created_at: TIMESTAMP
```

#### `public.boat_maintenance` (Bakım Planı)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
title: VARCHAR(255) [NOT NULL]
description: TEXT
category: VARCHAR(100)
interval_months: INTEGER
due_date: DATE [NOT NULL]
status: ENUM('pending', 'done')
master_name: VARCHAR(255)
cost: DECIMAL(10,2)
completed_date: DATE
created_at: TIMESTAMP
```

#### `public.boat_tasks` (Yapılan İşler)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
title: VARCHAR(255) [NOT NULL]
description: TEXT
date: DATE [NOT NULL]
category: VARCHAR(100) -- 12 kategori: Gövde, Motor, Elektrik, etc.
master_name: VARCHAR(255)
cost: DECIMAL(10,2)
images: TEXT[] -- Array of image URLs
created_at: TIMESTAMP
```

#### `public.boat_expenses` (Harcamalar)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
title: VARCHAR(255) [NOT NULL]
description: TEXT
category: VARCHAR(100) -- Bakım, Yakıt, Marina, etc.
amount: DECIMAL(10,2) [NOT NULL]
date: DATE [NOT NULL]
notes: TEXT
created_at: TIMESTAMP

INDEXES:
  - (boat_id, date DESC)
  - (category)
```

#### `public.boat_condition` (Kondisyon)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
title: VARCHAR(255)
date: DATE [NOT NULL]
hull_score: INTEGER (0-10)
engine_score: INTEGER (0-10)
electrical_score: INTEGER (0-10)
deck_score: INTEGER (0-10)
interior_score: INTEGER (0-10)
rigging_score: INTEGER (0-10)
notes: TEXT
created_at: TIMESTAMP
```

#### `public.boat_crew` (Crew)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
name: VARCHAR(255) [NOT NULL]
role: VARCHAR(100) -- Kaptan, Yardımcı, Mürettebat, etc.
photo_url: TEXT
phone: VARCHAR(20)
email: VARCHAR(255)
skills: TEXT[] -- Array: Kaptan Ruhsatı, VHF, etc.
notes: TEXT
created_at: TIMESTAMP
```

#### `public.boat_masters` (Ustalar)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
name: VARCHAR(255) [NOT NULL]
specialty: VARCHAR(255)
photo_url: TEXT
phone: VARCHAR(20)
email: VARCHAR(255)
notes: TEXT
created_at: TIMESTAMP
```

#### `public.boat_equipment` (Ekipmanlar)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
name: VARCHAR(255) [NOT NULL]
brand: VARCHAR(100)
model: VARCHAR(100)
serial_number: VARCHAR(100)
category: VARCHAR(100) -- Navigasyon, Motor, Elektrik, etc.
purchase_date: DATE
warranty_expiry: DATE
location: VARCHAR(255) -- Tekne üzerindeki konum
image_url: TEXT
notes: TEXT
created_at: TIMESTAMP
```

#### `public.boat_inventory` (Envanter)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
name: VARCHAR(255) [NOT NULL]
category: VARCHAR(100) -- Emniyet, Yakıt, Elektrik, etc.
unit: VARCHAR(50) -- adet, litre, metre, kg
qty: INTEGER [NOT NULL]
min_qty: INTEGER
location: VARCHAR(255)
notes: TEXT
last_updated: TIMESTAMP
```

#### `public.boat_photos` (Fotoğraflar)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
title: VARCHAR(255)
description: TEXT
date: DATE
image_url: TEXT [NOT NULL]
created_at: TIMESTAMP

INDEXES:
  - (boat_id, created_at DESC)
```

#### `public.boat_documents` (Belgeler)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
title: VARCHAR(255) [NOT NULL]
description: TEXT
category: VARCHAR(100) -- Ruhsat, Sigorta, Garanti, etc.
expiry_date: DATE
file_url: TEXT [NOT NULL]
created_at: TIMESTAMP
```

#### `public.boat_adb` (ADB/Sertifikalar)
```sql
id: UUID (PK)
boat_id: UUID (FK) [NOT NULL]
title: VARCHAR(255) [NOT NULL]
type: VARCHAR(100) -- ADB, Patent, VHF, CMAS, etc.
cert_no: VARCHAR(100)
expiry_date: DATE [NOT NULL]
notes: TEXT
image_url: TEXT
created_at: TIMESTAMP
```

### **Marketplace Tables**

#### `public.listings` (İlanlar)
```sql
id: UUID (PK)
user_id: UUID (FK → profiles.id) [NOT NULL]
title: VARCHAR(255) [NOT NULL]
description: TEXT
category: VARCHAR(100) -- Hizmet, Ekipman, etc.
price: DECIMAL(10,2)
status: ENUM('active', 'inactive') [DEFAULT: 'active']
image_url: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP

INDEXES:
  - (user_id, status)
  - (category, status)
  - (created_at DESC)

RLS:
  - SELECT: all (active only)
  - INSERT/UPDATE/DELETE: owner or admin
```

#### `public.messages` (Mesajlaşma)
```sql
id: UUID (PK)
sender_id: UUID (FK) [NOT NULL]
receiver_id: UUID (FK) [NOT NULL]
content: TEXT [NOT NULL]
is_deleted: BOOLEAN [DEFAULT: false]
created_at: TIMESTAMP

INDEXES:
  - (sender_id, created_at DESC)
  - (receiver_id, created_at DESC)
  - ((sender_id, receiver_id))

RLS:
  - SELECT: sender or receiver
  - INSERT: authenticated
  - DELETE: sender only
```

---

## 🔄 API Endpoints (Next.js Route Handlers)

### **Boats**
- `GET /api/boats` → List user's boats
- `POST /api/boats` → Create boat
- `GET /api/boats/[id]` → Get boat details
- `PUT /api/boats/[id]` → Update boat
- `DELETE /api/boats/[id]` → Delete boat

### **Module CRUD** (Standar Pattern)
- `GET /api/boats/[boatId]/[module]` → List items
- `POST /api/boats/[boatId]/[module]` → Create item
- `PUT /api/boats/[boatId]/[module]/[itemId]` → Update item
- `DELETE /api/boats/[boatId]/[module]/[itemId]` → Delete item

### **Storage**
- `POST /api/uploads/photo` → Upload photo (boat_images bucket)
- `POST /api/uploads/document` → Upload document
- `DELETE /api/uploads/[fileId]` → Delete file

### **Marketplace**
- `GET /api/listings` → List all listings (paginated)
- `POST /api/listings` → Create listing
- `PUT /api/listings/[id]` → Update listing
- `DELETE /api/listings/[id]` → Delete listing
- `GET /api/messages` → List conversations
- `POST /api/messages` → Send message

---

## 📁 Web Portal Dosya Yapısı

```
naviva-web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── giris/page.tsx
│   │   │   └── kayit/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (home)
│   │   │   ├── market/page.tsx
│   │   │   ├── mesajlar/page.tsx
│   │   │   ├── favorilerim/page.tsx
│   │   │   ├── benim-ilanlarim/page.tsx
│   │   │   └── benim-teknelerim/
│   │   │       ├── page.tsx (boat list)
│   │   │       ├── yeni/page.tsx (add boat)
│   │   │       └── [id]/
│   │   │           ├── page.tsx (boat dashboard)
│   │   │           └── [module]/
│   │   │               ├── page.tsx (module detail)
│   │   │               └── [module]/[id]/page.tsx (item detail)
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── banners/page.tsx
│   │   │   └── users/page.tsx
│   │   ├── api/
│   │   │   ├── boats/
│   │   │   ├── modules/
│   │   │   ├── listings/
│   │   │   ├── messages/
│   │   │   └── uploads/
│   │   └── layout.tsx (root)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── boats/
│   │   │   ├── BoatCard.tsx
│   │   │   ├── BoatForm.tsx
│   │   │   └── ModuleGrid.tsx
│   │   ├── marketplace/
│   │   │   ├── ListingCard.tsx
│   │   │   └── ListingForm.tsx
│   │   └── BannerSlot.tsx
│   ├── lib/
│   │   ├── supabase.ts (client)
│   │   ├── supabase-server.ts (server)
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── public/
├── package.json
└── tailwind.config.ts
```

---

## 📱 Mobile App Dosya Yapısı (Flutter)

```
naviva/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── theme_manager.dart
│   │   └── navigation_service.dart
│   ├── data/
│   │   ├── models/
│   │   │   ├── boat.dart
│   │   │   ├── listing.dart
│   │   │   ├── required_equipment.dart
│   │   │   └── 14_module_models.dart
│   │   ├── services/
│   │   │   ├── supabase_service.dart
│   │   │   ├── equipment_service.dart
│   │   │   └── storage_service.dart
│   │   └── repositories/
│   │       ├── boat_repository.dart
│   │       └── module_repository.dart
│   └── ui/
│       ├── screens/
│       │   ├── boat_detail.dart
│       │   ├── boat_selection.dart
│       │   ├── modules/
│       │   │   ├── info_screen.dart (14 modül ekranı)
│       │   │   ├── faults_screen.dart
│       │   │   ├── boat_logs.dart
│       │   │   └── ...
│       │   └── marketplace/
│       └── widgets/
│           ├── naviva_scaffold.dart
│           └── photo_picker_row.dart
├── pubspec.yaml
└── android/, ios/, web/
```

---

## 🔐 Güvenlik İmplementasyonu

### **JWT Token Flow**
```
1. User logs in → Supabase Auth returns JWT
2. JWT stored in localStorage (web) / SecureStorage (mobile)
3. Every API request includes: Authorization: Bearer {JWT}
4. Backend verifies JWT → RLS policies enforce row-level access
5. User can only see/modify own data
```

### **RLS Policy Pattern**
```sql
CREATE POLICY "users_can_access_own_boats"
ON boats FOR ALL
USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
```

### **File Upload Security**
```typescript
// Frontend
- Check file type (image/pdf only)
- Check file size (< 50MB)
- Sanitize filename

// Backend (Supabase Storage)
- Bucket policies restrict uploads to authenticated users
- Objects stored in user-specific folders
- Public URLs generated for display
```

---

## 🚀 Deployment Strategy

### **Web Portal (Next.js)**
```
Development: localhost:3000
Staging: naviva-staging.vercel.app
Production: naviva-web.vercel.app

CI/CD: GitHub Actions → Vercel
Env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY
```

### **Mobile App (Flutter)**
```
iOS: TestFlight → App Store
Android: Internal Testing → Google Play

Version: Semantic versioning (1.0.0)
Build: XCode + Android Studio
```

### **Backend (Supabase)**
```
Database: PostgreSQL 15
Backups: Daily automatic
Scaling: Auto-scaling compute
Monitoring: Built-in dashboards
```

---

## 📊 Performance Benchmarks

| Metrik | Target | Mevcut |
|--------|--------|--------|
| Web Lighthouse Score | 90+ | 95 |
| API Response Time | < 200ms | 150ms |
| Database Query Time | < 50ms | 30ms |
| Mobile App Load Time | < 2s | 1.5s |
| Storage Usage | < 10GB | 2GB |

---

## 🔍 Monitoring & Logging

### **Frontend Logging**
- Error boundary, console.error captures
- Sentry integration (TBD)
- User session tracking

### **Backend Logging**
- Supabase logs (HTTP, Auth, Database)
- Edge Function logs
- Database slow query logs

### **Analytics**
- User engagement (page views, actions)
- Feature usage (module popularity)
- Error tracking

---

## 🎯 Scalability Considerations

✅ **Horizontal Scaling**: Supabase auto-scales DB
✅ **Caching**: Browser cache, Redis (TBD)
✅ **CDN**: Vercel edge network, Supabase Storage CDN
✅ **Database**: Connection pooling, read replicas (TBD)
✅ **Rate Limiting**: API middleware, Supabase network policies

---

*Dokümantasyon: 2026-04-14 | v1.0*
