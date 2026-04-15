# NAVIVA - Proje Özeti

## 📋 Executive Summary

**NAVIVA**, amatör denizciler için tasarlanan, **ücretsiz/freemium** bir tekne yönetim platformudur. Kullanıcılar kişisel teknelerini **mobil ve web portallarda** yönetebilir, **denizci ustalarını** bulabilir ve **usta hizmetleri pazarında** ilan verebilirler.

### Proje Vizyonu
Türk amatör denizcilerin teknelerini verimli bir şekilde yönetmelerini, denizde güvenli seyahat etmelerini ve ihtiyaç duydukları hizmetleri kolayca bulmalarını sağlamak.

---

## 🎯 Ana Özellikler

### 1. **Tekne Yönetim Modülleri (14 Entegre Sistem)**

#### **Temel Modüller** (Her Tekne için)
- **📋 Genel Bilgiler**: Tekne özellikleri, durum, zorunlu ekipmanlar (14 item checkbox)
- **⚠️ Arıza Kayıtları**: Sorun takibi, önem derecesi, usta atama, maliyet
- **📖 Seyir Günlüğü**: Yolculuk notları, navigasyon verileri, hava durumu, motor saatleri
- **🗺️ Rota & Harita**: Seyir rotaları, planlama, mesafe hesaplama

#### **Bakım & Servis** (Kolapsibil Bölüm)
- **🛠️ Bakım Planı**: Periyodik bakım planlama, hatırlatıcılar
- **✅ Yapılan İşler**: Tamamlanan onarımlar, kategorilere göre (12 tür)
- **💰 Harcamalar**: Detaylı maliyet takibi (7 kategori)
- **📊 Kondisyon**: Tekne sağlık raporları (6 kategori puanı: 0-10)

#### **Tekne & Donanım** (Kolapsibil Bölüm)
- **👥 Crew**: Mürettebat yönetimi, roller (6 tip), yetkinlikler
- **🔧 Ustalar**: İlişkili hizmet sağlayıcılar, iletişim
- **⚙️ Ekipmanlar**: Tekne cihazları, garanti izleme, kategorilendirme (8 kategori)
- **📦 Envanter**: Yedek parça yönetimi, stok izleme
- **📸 Fotoğraflar**: Tekne fotoğraf galerisi, albümler
- **📄 Belgeler**: Sertifikalar, sigorta, fatura arşivi (7 tür)
- **🎖️ ADB/Sertifikalar**: Hukuki belgeler, süresi dolma uyarıları (ADB, Patent, VHF, CMAS)

---

## 📱 Teknoloji Stack

### **Frontend**
| Bileşen | Teknoloji | Amaç |
|---------|-----------|------|
| **Web Portal** | Next.js 16 + TypeScript + React 19 | Admin dashboard, tekne yönetimi, marketplace |
| **Mobile App** | Flutter 3+ | iOS/Android tekne yönetimi, on-the-fly veri girişi |
| **State Mgmt (Mobile)** | Riverpod + Provider | Reaktif veri yönetimi, offline sync hazırlığı |
| **UI/Design** | Tailwind CSS (Web) + Flutter Material | Glassmorphism, consistent branding |

### **Backend**
| Bileşen | Teknoloji | Amaç |
|---------|-----------|------|
| **Database** | Supabase (PostgreSQL) | İlişkisel veri, RLS güvenliği |
| **Auth** | Supabase Auth + JWT | OAuth/email authentication |
| **Storage** | Supabase Storage (S3) | Fotoğraf, belge, sertifika depolama |
| **Real-time** | Supabase Realtime | Mesajlaşma, bildirimler |
| **API** | Next.js Route Handlers | GraphQL-ready REST endpoints |

### **Deployment**
- **Web**: Vercel (Next.js optimized)
- **Mobile**: App Store + Google Play (Flutter build)
- **Infrastructure**: Supabase Cloud (PostgreSQL 15+)

---

## 🏗️ Sistem Mimarisi

### **Veritabanı Şeması**

```
┌─────────────────────────────────────┐
│ Authentication (Supabase Auth)      │
│ - Email/Password                    │
│ - OAuth2 (Google, Apple)            │
└────────────┬────────────────────────┘
             │
    ┌────────▼────────┐
    │ Users (auth.users)
    │ ├─ id (UUID)
    │ ├─ email
    │ └─ user_metadata
    └────────┬────────┘
             │
    ┌────────▼─────────────┐
    │ Profiles (Public)    │
    │ ├─ id                │
    │ ├─ full_name         │
    │ ├─ avatar_url        │
    │ ├─ is_admin          │
    │ └─ created_at        │
    └────────┬─────────────┘
             │
    ┌────────▼────────────────────────┐
    │ BOATS (Tekne Yönetimi)          │
    │ ├─ id, user_id                  │
    │ ├─ name, type, status           │
    │ ├─ year, length_m, beam_m       │
    │ ├─ hull_material, engine_model  │
    │ ├─ registration_no, flag        │
    │ ├─ image_url, last_maintenance  │
    │ └─ home_port, captain_name      │
    └────────┬────────────────────────┘
             │
    ┌────────▼─────────────────────────────┐
    │ Module Tables (14 Modül)            │
    ├─ boat_faults                        │
    ├─ boat_logs (seyir günlüğü)         │
    ├─ boat_routes                        │
    ├─ boat_maintenance                   │
    ├─ boat_tasks                         │
    ├─ boat_expenses                      │
    ├─ boat_condition                     │
    ├─ boat_crew                          │
    ├─ boat_masters                       │
    ├─ boat_equipment                     │
    ├─ boat_inventory                     │
    ├─ boat_photos                        │
    ├─ boat_documents                     │
    └─ boat_adb                           │
    └────────┬──────────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ Marketplace (Usta Bul)        │
    ├─ listings (ilan)             │
    ├─ masters (usta profilleri)   │
    ├─ messages (mesajlaşma)       │
    └─ listings_images (görseller) │
    └───────────────────────────────┘

Storage:
├─ boat_images/ (tekne fotoğrafları)
├─ listing_photos/ (ilan görselleri)
└─ user_avatars/ (profil fotoğrafları)
```

### **RLS (Row-Level Security) Politikaları**

```
boats:
  - SELECT: users (own), admin (all)
  - INSERT/UPDATE: users (own), admin (all)
  - DELETE: users (own), admin (all)

boat_* (all modules):
  - SELECT: users (own boat), admin
  - INSERT/UPDATE: users (own boat), admin
  - DELETE: users (own boat), admin

listings:
  - SELECT: all users (published only)
  - INSERT: authenticated users
  - UPDATE: owner or admin
  - DELETE: owner or admin

messages:
  - SELECT: sender or receiver
  - INSERT: authenticated
  - DELETE: sender only
```

---

## 🔄 Veri Senkronizasyonu (Mobile ↔ Web)

### **Senkronizasyon Stratejisi**
1. **Mobil App → Web**: Offline-first, sync-on-demand
2. **Web → Mobil**: Real-time Supabase Realtime Channel
3. **Çatışma Çözümü**: Last-write-wins, timestamp-based

### **Tamamlanan Senkronizasyon**
- ✅ 14 modülün tüm fieldları web portalında mobille eşleşti
- ✅ Select seçenekleri (90+ kategori/rol/tip)
- ✅ File upload (boats bucket)
- ✅ ZORUNLU EKİPMANLAR (14 item checkbox, mobille aynı)

---

## 👥 Kullanıcı Rolleri

### **Amatör Denizci**
- Tekne yönetimi (14 modül)
- Seyir günlüğü tutma
- Bakım planlaması
- Usta/hizmet bulma
- Hizmet providerları ile mesajlaşma

### **Usta/Hizmet Sağlayıcı**
- Profil oluşturma (Usta Bul'da görünme)
- İlan oluşturma (hizmetler, ekipman satışı)
- Müşteri talep alma (mesajlar)
- Portföyü yönetme

### **Admin**
- Tüm kullanıcı verilerine erişim
- Sistem görevleri
- Banner/reklam yönetimi
- İçerik moderation

---

## 📊 İş Modeli (Freemium)

### **Ücretsiz Bölüm**
- Tekne yönetimi (temel 14 modül)
- Seyir günlüğü
- Usta bulma
- Mesajlaşma

### **Premium Özellikler** (Gelecek)
- GPS tracking gerçek zamanlı
- İşbirlikçi sefer planlama
- Danışman desteği
- Analitik raporlar
- Yetkisiz kullanım sigortası entegrasyonu

---

## 🚀 Deployment Checklist

- [x] Supabase RLS politikaları
- [x] Storage bucket'ları
- [x] Web portal (Next.js)
- [x] Mobile app (Flutter)
- [x] 14 modül senkronizasyonu
- [x] Marketplace (usta bul)
- [x] Mesajlaşma sistemi
- [x] Admin dashboard
- [ ] Payment integration (Premium)
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Multi-language support

---

## 📈 Proje İstatistikleri

| Metrik | Değer |
|--------|-------|
| **Tekne Modülleri** | 14 |
| **Veritabanı Tabloları** | 20+ |
| **API Endpoint'leri** | 40+ |
| **Frontend Bileşenleri** | 200+ |
| **Depolama Bucketleri** | 3 |
| **RLS Politikaları** | 15+ |
| **Mobil Ekranlar** | 25+ |
| **Web Sayfaları** | 30+ |

---

## 🎓 Kullanılan Tasarım Desenleri

- **MVC Architecture** (Next.js + Flutter)
- **Offline-First Caching** (Riverpod)
- **State Management** (Provider + Riverpod)
- **Real-time Sync** (Supabase Channels)
- **Glassmorphism UI** (Consistent branding)
- **RLS-based Authorization** (Database level)
- **Module-based Organization** (14 bağımsız modül)

---

## 🔐 Güvenlik Özellikleri

✅ **Authentication**: Supabase Auth (JWT + OAuth)
✅ **Authorization**: Database-level RLS
✅ **Encryption**: TLS in-transit, encrypted-at-rest (Supabase)
✅ **Rate Limiting**: API endpoint protekciyonu
✅ **Input Validation**: Frontend + backend
✅ **File Upload Security**: Type/size validation
✅ **GDPR Compliant**: Data retention policies

---

## 📞 İletişim & Destek

- **Web Portal**: https://naviva-web.vercel.app
- **Mobile App**: iOS App Store + Google Play
- **Email**: bilgi@naviva.app (TBD)
- **Support**: In-app messaging system

---

*Son güncelleme: 2026-04-14*
*Versiyon: 1.0 - MVP*
