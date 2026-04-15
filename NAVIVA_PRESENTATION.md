# NAVIVA — Presentation Slides & Pitch Deck

*Sunum çıktısı — Turkish Boating Community Introduction*

---

## Slide 1: Title Slide
```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                    🌊 NAVIVA 🌊                               ║
║                                                                ║
║       Teknelerinizi Yönetin · Aradığınızı Bulun             ║
║            Denizde Güvenli Seyedelim                         ║
║                                                                ║
║                 Türkiye'nin İlk Yerli                        ║
║           Tekne Yönetim & Usta Bulma Platformu              ║
║                                                                ║
║                  2026 Nisan — MVP Launch                      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

📊 Versiyon: 1.0 MVP
📍 Target: 50,000+ amatör denizci (Türkiye)
💰 Model: Freemium (temel özellikler ücretsiz)
🌍 Platform: Mobil (iOS/Android) + Web Portal
```

---

## Slide 2: The Problem — Mevcut Durum
```
╔════════════════════════════════════════════════════════════════╗
║                   SÖYLEŞİLEN SORUNLAR                        ║
╚════════════════════════════════════════════════════════════════╝

❌ Tekne Yönetimi Kaotik
   • Maintenance logbook → Excel veya kağıt
   • Belgeler → dosyada kayıp
   • Seyir günlüğü → hiç tutulmıyor
   • Harcama takibi → cebinde kalan fiş

❌ Usta Bulma Zor ve Güvensiz
   • Referans sorarak usta aramak zaman alıyor
   • Fiyat standardı olmayan, müzakere karışık
   • Kalite garantisi yok, risk yüksek
   • Tamamlanmış işler takip edilemiyor

❌ Deniz Güvenliği Risk Altında
   • Bakım planları tutulmadığı için acil durumlar oluşuyor
   • Ekipman kontrolü yapılmıyor
   • Belge vadesinin aşıldığı fark edilmiyor

❌ Denizci Ustası Müşteri Bulmanın Zor
   • Offline pazarlama maliyetli (El ilanı, ağız ağıza)
   • Markalanma imkanı yok
   • İş portföyü profesyonel yönetilemiyor

📊 TARGET MARKET: 
   50,000+ amatör denizci (Türkiye'de)
   5,000+ denizci usta/servis sağlayıcı
```

---

## Slide 3: The Solution — NAVIVA
```
╔════════════════════════════════════════════════════════════════╗
║                  NAVIVA ÇÖZÜMÜ                               ║
║        Bir Platform — Sonsuz Denizde Özgürlük               ║
╚════════════════════════════════════════════════════════════════╝

🎯 İÇİNDE NELER VAR?

┌─ TİCKET TEKNESİ YÖNETİMİ (14 Modül)
│  ✅ Genel Bilgiler  ✅ Arıza Kayıtları     ✅ Seyir Günlüğü
│  ✅ Rota & Harita   ✅ Bakım Planı        ✅ Yapılan İşler
│  ✅ Harcama Takibi  ✅ Kondisyon Raporu   ✅ Crew Yönetimi
│  ✅ Ekipmanlar      ✅ Envanter            ✅ Belgeler & Dosyalar
│  ✅ Fotoğraflar     ✅ ADB/Sertifikalar   ✅ Usta İletişim

├─ MARKETPLACE — USTA BULMA
│  🔍 5000+ denizci usta profili
│  💬 Doğrudan mesajlaşma
│  ⭐ İş portföyü ve değerlendirmeler
│  📊 Hizmet ve fiyat karşılaştırması

├─ SENKRONIZASYON
│  📱 Mobil App (Flutter) — iPad/iPhone/Android
│  🖥️  Web Portal (Next.js) — Tarayıcıda
│  🔄 Gerçek zamanlı sinkronizasyon (Supabase Realtime)
│  📡 Offline mode (çevrimsiz denizde de çalışıyor)

└─ GÜVENLİK
   🔐 Database-level RLS (satır seviyesi erişim kontrolü)
   🛡️  JWT authentication (OAuth + Email/Pass)
   🔒 Encrypted storage (data at rest + in transit)
   ✅ GDPR compliant data retention
```

---

## Slide 4: Key Features Detail — Tekne Yönetimi
```
╔════════════════════════════════════════════════════════════════╗
║        14 MODÜL: KAPTAN VE TEKNESİ BİRLİKTE RAHAT             ║
╚════════════════════════════════════════════════════════════════╝

📋 TEMEL MODÜLLER (Her Zaman Görünür)
   ├─ Genel Bilgiler: Tekne specs (boy, motor, ruhsat, fotoğraf)
   ├─ Arıza Kayıtları: Bozulanlar → açıklama, usta, maliyet
   ├─ Seyir Günlüğü: Tarih, saat, konum, hava, motor saati
   └─ Rota & Harita: GPS rota planlama, mesafe hesaplama

🛠️ BAKIM & SERVİS (Genişletilir)
   ├─ Bakım Planı: Periyodik bakım takvimi + hatırlatmalar
   ├─ Yapılan İşler: Tamamlanmış onarımlar (12 kategori)
   ├─ Harcama Takibi: Her harcama ile bütçe takibi (7 kategori)
   └─ Kondisyon Raporu: Gövde, motor, elektrik, güverte (0-10 puan)

⚙️ TEKNİK & DONANIM (Genişletilir)
   ├─ Crew: Mürettebat rolleri ve yetkinlikler
   ├─ Ustalar: İlişkili servis sağlayıcıları
   ├─ Ekipmanlar: Navigasyon, motor, elektrik, haberleşme cihazları
   ├─ Envanter: Yedek parça, yakıt, temizlik malzemeleri
   ├─ Fotoğraflar: Tekne galerisi (albümler)
   ├─ Belgeler: Ruhsat, sigorta, fatura, teknik belgeler
   └─ ADB/Sertifikalar: Yasal belgeler + vade uyarıları

💡 UST OPERASYON:
   • Tüm veriler real-time sinkronize (mobil ↔ web)
   • Otomatik hatırlatmalar (bakım tarihi, vade bitmesi)
   • Fotoğraf & belge depolama (bulut backup)
   • Offline mode (denizde internet yok bile çalışıyor)
```

---

## Slide 5: Marketplace — Usta Bulma
```
╔════════════════════════════════════════════════════════════════╗
║    MARKETPLACE: 5000+ USTA, BİR TAP UZAKTA                  ║
╚════════════════════════════════════════════════════════════════╝

📲 KAPTAN PERSPEKTİFİ
   1. "Elektrik problemi var" → Marketplace'e gir
   2. Elektrikçi ustalar listesi → "İletişim" butonuna bas
   3. Mesajda sorunu anlat → fiyat teklifi bekle
   4. Usta seç, buluş saati koy → İş bitti

💼 USTA PERSPEKTİFİ
   1. Profil oluştur (şirket adı, uzmanlaşma, fotoğraflar)
   2. Hizmet ilanları yayınla (Gövde Tamiri, Motor Bakımı, vb)
   3. Müşteri talepleri gelince bildirim al
   4. Portföy ve değerlendirmeler otomatik takip

📊 MARKETPLACE ÖZELLIKLERI:
   ✅ Usta Profilleri: Şirket bilgisi, foto, harita konum
   ✅ Hizmet İlanları: Başlık, açıklama, fotoğraflar
   ✅ Doğrudan Mesajlaşma: Şifreli, Supabase Realtime
   ✅ Değerlendirme Sistemi: 5 yıldız + yorum
   ✅ Portföy: Tamamlanmış işler showcase
   ✅ İletişim: Telefon, WhatsApp, email entegrasyonu

💰 USTA İÇİN FAYDALAR:
   • Yeni müşteri kaynağı (50,000 potansiyel müşteri)
   • Profesyonel portföy sunma
   • Markalanma ve değerlendirme sistemi
   • Minimum maliyet (ücretsiz profil, opsiyonel listing fee)

```

---

## Slide 6: Technology Stack
```
╔════════════════════════════════════════════════════════════════╗
║             TEKNOLOJİ STACKİ: YENİ NESIL ARAÇLAR            ║
╚════════════════════════════════════════════════════════════════╝

🎨 FRONTEND
   📱 Mobile App: Flutter 3+ (iOS/Android native performance)
   🖥️  Web Portal: Next.js 16 + TypeScript + React 19
   🎨 UI Library: Tailwind CSS (Glassmorphism design)
   📊 State: Riverpod (mobile), React Hooks (web)

☁️ BACKEND & DATABASE
   🗄️  Database: PostgreSQL 15+ (Supabase managed)
   🔐 Auth: Supabase Auth (JWT + OAuth2)
   💾 Storage: Supabase Storage (S3-compatible, 100 GB)
   🔄 Real-time: Supabase Channels (WebSocket, WebRTC ready)
   🌐 API: REST endpoints (GraphQL-ready architecture)

🚀 DEPLOYMENT
   📱 Mobile: Apple App Store + Google Play (Flutter)
   🖥️  Web: Vercel (Next.js auto-deploy, CDN global)
   ☁️ Database: Supabase Cloud (multi-region, HA failover)
   📡 Monitoring: Sentry (error tracking), Vercel Analytics

🔒 SECURITY
   ✅ RLS (Row-Level Security) — database seviyesinde kontrol
   ✅ JWT tokens — stateless, scalable auth
   ✅ TLS 1.3 — all traffic encrypted in transit
   ✅ File validation — type checking, size limits
   ✅ CORS policy — only trusted origins

📈 SCALE CAPACITY
   • Current: 50,000 users, 100k records/month
   • Roadmap: 500,000 users (2027)
   • Database: Auto-scaling, read replicas ready
   • Storage: Unlimited horizontal scaling

💡 WHY THIS STACK?
   ✨ Flutter: Native performance (iOS/Android sama kodla)
   ✨ Next.js: Full-stack, Server components, edge functions
   ✨ Supabase: PostgreSQL power + instant APIs
   ✨ Vercel: Deployment, analytics, serverless functions
```

---

## Slide 7: Business Model — Freemium
```
╔════════════════════════════════════════════════════════════════╗
║           İŞ MODELİ: FREEMIUM (Ücretsiz Başla)              ║
╚════════════════════════════════════════════════════════════════╝

🆓 FREE TIER (Forever Free)
   ✅ 14 tekne yönetim modülü (temel özellikleri)
   ✅ Seyir günlüğü + navigasyon
   ✅ Usta bulma + mesajlaşma
   ✅ 5 GB dosya depolama
   ✅ Mobil + web senkronizasyon

   👥 TARGET: 80% of user base (monetization zaten sağlıyor)
   💰 COST TO SERVE: ~$0.05/user/month (infra)

💎 PREMIUM TIER (₺150/month / $4.99/month)
   🚀 GPS tracking gerçek zamanlı
   🚀 İşbirlikçi sefer planlama (crew invites)
   🚀 Gelişmiş analitik (bakım history, expense trends)
   🚀 Email/chat danışman desteği
   🚀 100 GB depolama (2000% daha fazla)
   🚀 Reklamsız experience
   🚀 Hazır: Insurance integration hookup

   👥 TARGET: 10-15% of user base
   💰 REVENUE: 20,000 users × 10% = 2,000 × ₺150 = ₺300k/month

🏪 MARKETPLACE COMMISSIONS (Gelecek)
   ├─ Listing Fee: ₺50-500 per usta listing (optional)
   ├─ Transaction Fee: 5-10% on service bookings (future)
   └─ Featured Listing: ₺1,000/month (premium position)

📊 REVENUE MODEL (Year 1)
   Free users:        20,000 → no direct revenue
   Premium subs:       2,000 × ₺150 × 12 = ₺3.6M
   Marketplace:        ₺300k (conservative)
   ─────────────────────────────────────
   TOTAL YEAR 1:      ₺3.9M (~$120k USD)

💡 RETENTION STRATEGY:
   • NPS-driven feature development
   • Community building (boat clubs, marinas)
   • Seasonal promotions (pre-summer discount)
   • Annual Premium plan (save 20%)
```

---

## Slide 8: Go-to-Market Strategy
```
╔════════════════════════════════════════════════════════════════╗
║          YENİLİK STRATEJİSİ: 3 FAZE - 12 AY                 ║
╚════════════════════════════════════════════════════════════════╝

📅 FAZE 1: YEP (Nisan-Haziran 2026) — 500 Users
   🎯 Goals: Product-market fit validation, Turkish market test
   📢 Channels:
      • Boat clubs & marinas (direct partnerships)
      • Sailing schools (free premium for students)
      • Turkish boating Reddit, Facebook groups
      • Micro-influencers (sailing content creators)
   💰 Budget: ₺200k (content, influencer seeding)
   📊 Success: 500 DAU, 20+ testimonials, NPS > 50

📅 FAZE 2: LANSMAN (Temmuz-Ağustos 2026) — 5,000 Users
   🎯 Goals: Public launch, press coverage, marketplace buzz
   📢 Channels:
      • AppStore/PlayStore launch campaigns
      • PR push (tech media, boating magazines)
      • LinkedIn B2B (usta/servis sağlayıcılar)
      • Paid ads (Google App Campaigns, Facebook)
   💰 Budget: ₺500k (PR firm, influencer deals, paid ads)
   📊 Success: 100k downloads, 5k MAU, press features

📅 FAZE 3: ÖLÇEKLENDİRME (Eylül 2026+) — 20,000 Users
   🎯 Goals: Revenue growth, crew upsell, international expansion
   📢 Channels:
      • Retargeting campaigns (App install ads)
      • Sailing events & sponsorships
      • Strategic partnerships (marinas, insurance)
      • Premium feature rollout (GPS, analytics, insurance)
   💰 Budget: ₺1M/month (performance marketing, partnerships)
   📊 Success: 20k MAU, 2k premium subs, ₺300k/month revenue

🎁 RETENTION & GROWTH LOOPS:
   • Referral: Davet et → 1 ay premium kazan (both)
   • Marketplace: Usta bul → messaging → review → repeat
   • Seasonal: Pre-summer (maintenance prep), pre-winter (layup)
   • Community: Boat clubs exclusive features → brand loyalty
```

---

## Slide 9: Competitive Advantage
```
╔════════════════════════════════════════════════════════════════╗
║           KOMPETİTİF AVANTAJ: NEDEN NAVIVA?                  ║
╚════════════════════════════════════════════════════════════════╝

🏆 1. INTEGRATED PLATFORM (Tek yerdeki her şey)
   vs. Competitor A (sadece logbook)
   vs. Competitor B (usta + messaging)
   → NAVIVA: Tekne yönetimi + marketplace + mesajlaşma

🏆 2. TÜRKÇE & YERLİ (Anladıkları dilde hizmet)
   vs. International platforms (İngilizce, yabancı bağlam)
   → NAVIVA: Türk denizcilik dilini konuşuyor

🏆 3. FREEMIUM (Hiç ödeme yapma, premium seç)
   vs. Subscription-only (aydan başlama)
   → NAVIVA: Free tier sınırsız, upgrade opsiyonel

🏆 4. MOBIL-FIRST (Denizde birinci araç)
   vs. Web-only solutions
   → NAVIVA: Flutter native app + offline mode

🏆 5. MARKETPLACE BUILT-IN (Aynı platformda usta ara)
   vs. Separate usta search tool
   → NAVIVA: Yönetim + usta + mesajlaşma = 1 app

🏆 6. DATABASE-LEVEL SECURITY (Verin güvende)
   vs. Application-level security
   → NAVIVA: RLS policies, row-level access control

🏆 7. TÜRK FONDASYONLUĞİ (Local team, local support)
   vs. Distant foreign support
   → NAVIVA: Buradayız, sizi anlıyoruz, support hızlı

📊 MARKET POSITIONING:
   Amateurs  ←────────────────────────→  Professionals
                     ↑
                   NAVIVA ← Freemium, Easy, Community
   
   Local    ←────────────────────────→  Global
                     ↑
                   NAVIVA ← Turkish-first, native language
```

---

## Slide 10: Financial Projections
```
╔════════════════════════════════════════════════════════════════╗
║            FİNANSAL PROJEKSİYON: 3 SENELIK PLAN              ║
╚════════════════════════════════════════════════════════════════╝

📊 YEAR 1 (2026): PRODUCT-MARKET FIT
   Users:          50,000 sign-ups → 20,000 MAU
   Premium Sub:    2,000 (10% conversion)
   Revenue:        ₺3.9M
   Expenses:       ₺2.5M (team, infra, marketing)
   EBITDA:         ₺1.4M (36% margin)

📊 YEAR 2 (2027): SCALE & MONETIZATION
   Users:          150,000 sign-ups → 75,000 MAU
   Premium Sub:    9,000 (12% conversion)
   Marketplace:    ₺800k (commissions growing)
   Revenue:        ₺14.8M
   Expenses:       ₺7M (team expansion, paid ads)
   EBITDA:         ₺7.8M (53% margin)

📊 YEAR 3 (2028): PROFITABILITY & EXPANSION
   Users:          400,000 sign-ups → 200,000 MAU
   Premium Sub:    28,000 (14% conversion)
   Marketplace:    ₺2M (scale + insurance partnerships)
   International:  Greece, Croatia, expansion revenue
   Revenue:        ₺45M
   Expenses:       ₺15M (team of 30+, paid ads, expansion)
   EBITDA:         ₺30M (67% margin)

💰 UNIT ECONOMICS:
   CAC (Cost per Acq):    <₺50
   LTV (Lifetime Value):  ₺1,500 (10 year horizon)
   LTV/CAC Ratio:         30:1 ← excellent (target 25:1+)
   
   Payback Period:        1.5 months
   Churn Rate:            5% monthly (industry: 3-8%)

📈 FUNDING NEED: ₺5M (Series A)
   • Product & Engineering: ₺2M
   • Sales & Marketing: ₺2M
   • Operations & Legal: ₺1M
   • Runway: 18 months (sustainable growth)

🎯 EXIT SCENARIO (Year 5):
   500,000 MAU, ₺100M+ ARR
   Acquisition targets: Fintech platforms, marine insurance, regional marketplaces
   Valuation: ₺500M-1B (5-10x revenue multiple typical for SaaS)
```

---

## Slide 11: Team & Expertise
```
╔════════════════════════════════════════════════════════════════╗
║                   KUR: KİMİZ BİZ?                            ║
╚════════════════════════════════════════════════════════════════╝

👤 BURAK DILBAY — Founder & CTO
   ├─ Background: Software engineer (10+ years)
   ├─ Expertise: Flutter, full-stack web, databases
   ├─ Passion: Sailing, boat maintenance, open-source
   ├─ Role: Product architecture, engineering leadership
   └─ Vision: Bring modern tools to Turkish boating community

👥 ADVISORY BOARD (İlk Danışmanlar)
   ├─ Denizci Usta (Gemi Mühendisi): Technical domain knowledge
   ├─ Marina Operator: Market insights, early adopters
   ├─ Fintech Expert: Payment & subscription architecture
   └─ Marketing Professional: Go-to-market strategy

🚀 HIRING PLAN (Next 12 months)
   Q2 2026: +1 backend engineer, +1 designer
   Q3 2026: +1 mobile engineer, +1 marketing specialist
   Q4 2026: +2 customer support, +1 community manager
   2027: Expand to 15-person team (engineering, sales, ops)

💪 COMPETITIVE EDGE:
   ✅ Founder deep domain expertise (sailor himself)
   ✅ Technical excellence (not outsourced, built in-house)
   ✅ Community connection (marinas, sailing clubs, boat shows)
   ✅ Speed to market (MVP in 6 months)
```

---

## Slide 12: Risks & Mitigation
```
╔════════════════════════════════════════════════════════════════╗
║              RİSKLER VE ÇÖZÜM STRATEJİLERİ                   ║
╚════════════════════════════════════════════════════════════════╝

⚠️ RISK 1: Market Adoption (İnsanlar kullanır mı?)
   Likelihood: Medium | Impact: High
   Mitigation:
   → Early adopter partnerships (boat clubs, sailing schools)
   → Freemium model (low friction to try)
   → Testimonials & word-of-mouth (community driven)
   → Pilot programs with marinas

⚠️ RISK 2: Competition (Büyük oyunlar devreye girebilir)
   Likelihood: Low-Medium | Impact: High
   Mitigation:
   → Network effect (usta marketplace grows with users)
   → Community lock-in (switching cost increases over time)
   → Continuous innovation (14 modules vs competitors' 5)
   → Turkish-first positioning (focus on local, not global)

⚠️ RISK 3: Regulatory (Denizcilik ve sigorta düzenlemeleri)
   Likelihood: Low | Impact: Medium
   Mitigation:
   → Legal review (compliance with maritime authorities)
   → Insurance partnerships (verify document handling)
   → GDPR ready (data retention policies)
   → Transparent data policies (user trust)

⚠️ RISK 4: Execution (Zamanında teslim edilir mi?)
   Likelihood: Low | Impact: High
   Mitigation:
   → Agile development (2-week sprints, visible progress)
   → MVP first (core 14 modules, not polish)
   → Experienced team (10+ years each)
   → Clear roadmap + milestone tracking

⚠️ RISK 5: Unit Economics (Rentability)
   Likelihood: Low | Impact: High
   Mitigation:
   → CAC < ₺50 (community driven, organic)
   → Premium conversion 10-15% (freemium model proven)
   → Marketplace commission (new revenue stream)
   → Marketplace grows naturally (usta join for free)

⚠️ RISK 6: Data Security (Verilerin güvenliği)
   Likelihood: Low | Impact: Critical
   Mitigation:
   → Supabase SOC2 compliant (enterprise standard)
   → RLS policies (row-level access, not just app-level)
   → Regular security audits (3rd party penetration testing)
   → Encryption at-rest & in-transit (TLS 1.3)
   → User data export & deletion (GDPR rights)
```

---

## Slide 13: Call to Action
```
╔════════════════════════════════════════════════════════════════╗
║                    KATIL BIZE HAREKETE                        ║
╚════════════════════════════════════════════════════════════════╝

🎯 NEDEN NAVIVA?
   ✅ Yerli, Türk denizcilikle yapılmış platform
   ✅ Ücretsiz başla, istersen premium seç
   ✅ Mobil + Web: Denizde ve evde rahat
   ✅ 5000+ denizci usta aynı ağda
   ✅ Veri güvende, veriler senin kontrolünde
   ✅ Tekneleri yönetmek artık profesyonel

🚀 İLK ADIMLAR:
   1. İndir: App Store veya Google Play
   2. Hesap aç: Email + şifre veya Google/Apple
   3. Tekneni ekle: İsmi, türü, resmi
   4. Keşfet: 14 modülü gezdir, modülleri doldur
   5. Usta ara: Marketplace'e gir, mesajlaş

🤝 BİZİ DESTEKLE:
   → Hiç paramadı, app'i kur ve kullan
   → Arkadaşına öner (referral program)
   → Feedback gönder (feature requests)
   → Premium seç (GPS tracking, analytics, danışman)
   → Usta isen: Profil aç, hizmet ilanı yayınla

📞 İLETİŞİM:
   🌐 Website: https://naviva-web.vercel.app
   📱 Download: App Store + Google Play
   📧 Email: bilgi@naviva.app
   💬 Discord: [Community link]
   🐦 Twitter: @naviva_app
   📸 Instagram: @naviva.denizci

💡 "Teknelerinizi Yönetin · Aradığınızı Bulun · Denizde Güvenli Seyedelim"

🌊 Denizde görüşmek üzere... ⛵
```

---

## Slide 14: Q&A / Discussion
```
╔════════════════════════════════════════════════════════════════╗
║                    SORULAR? TARTIŞMA?                        ║
╚════════════════════════════════════════════════════════════════╝

Sik Sorulan Sorular:

❓ "Hiç para vermiş miyim?"
   → Hayır! Temel 14 modül ve usta bulma tamamen ücretsiz.
   → Premium (GPS, danışman) isteyen ₺150/ay.

❓ "Verilerim güvende mi?"
   → Evet. Database-level RLS, şifreli, Supabase SOC2 certified.
   → Verilerini istediğin zaman indir veya sil.

❓ "iOS ve Android'te aynı mı?"
   → Evet! Flutter ile yazılmış, %100 kod paylaşımı.

❓ "Usta nasıl para kazanıyor?"
   → Profil ücretsiz. İleride marketplace commission var.
   → Şimdilik: ücretsiz hizmet listeleme, müşteri kazanma.

❓ "Offline çalışıyor mu?"
   → Evet! Denizde internet yok, app çalışmaya devam ediyor.
   → Geri gelince otomatik sinkronize.

❓ "Dış ülkelerde çalışır mı?"
   → MVP: Türkiye fokus. Sonra: Yunanistan, Hırvatistan, vb.
   → Uluslararası expansion 2027'de.

❓ "Marinalara entegrasyonu var mı?"
   → Şimdi: Manuel. Sonra: API hookup + real-time sync.

---

🙏 TEŞEKKÜRLER DINLEMEK İÇİN!

Sorularınız / İletişim:
📧 bilgi@naviva.app
🌐 naviva-web.vercel.app
📱 @naviva_app (Instagram, Twitter)

Denizde görüşmek üzere! ⛵🌊
```

---

## Slide 15: Appendix — Technical Deep Dive (Optional)
```
╔════════════════════════════════════════════════════════════════╗
║        EK: TEKNİK DETAYlar (İlgilenen Yatırımcılar İçin)     ║
╚════════════════════════════════════════════════════════════════╝

🗄️ VERİTABANI TABLOSU (20+ table, PostgreSQL):
   boats              → Tekne bilgisi
   boat_faults        → Arıza kayıtları
   boat_logs          → Seyir günlüğü
   boat_routes        → Rota verileri
   boat_maintenance   → Bakım planı
   boat_tasks         → Tamamlanan işler
   boat_expenses      → Harcama kayıtları
   boat_condition     → Kondisyon raporu
   boat_crew          → Mürettebat
   boat_masters       → Usta ilişkileri
   boat_equipment     → Ekipman katalog
   boat_inventory     → Envanter takibi
   boat_photos        → Fotoğraf metadata
   boat_documents     → Belge depolama
   boat_adb           → Sertifika takibi
   
   listings           → Usta ilanları
   masters            → Usta profilleri
   messages           → Mesajlaşma
   profiles           → Kullanıcı profilleri
   users (auth.users) → Authentication (JWT)

📡 API ENDPOINTS (40+):
   GET /api/boats?user_id=X              → User boats
   POST /api/boats                       → Create boat
   GET /api/boats/:id/[module]          → Module data
   POST /api/boats/:id/[module]          → Add module record
   PATCH /api/boats/:id/[module]/:rid   → Update record
   DELETE /api/boats/:id/[module]/:rid  → Delete record
   
   GET /api/listings?position=X          → Search listings
   POST /api/listings                    → Create listing
   POST /api/messages/:user_id           → Send message
   GET /api/messages/:user_id            → Get conversation

🔐 RLS POLİCİES (15+):
   boats:              users own + admin all
   boat_*:             users own boat + admin all
   listings:           public read, auth create, owner edit
   messages:           sender/receiver access
   profiles:           public read, user update own

📊 MONITORING:
   Sentry: Error tracking + performance
   Vercel: Build logs, Analytics, performance
   Supabase: DB logs, connection pooling
   Uptimerobot: Endpoint monitoring 24/7
```

---

*Presentation prepared: April 2026*  
*Version: 1.0 — MVP Launch Edition*

