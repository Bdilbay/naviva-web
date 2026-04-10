import Link from 'next/link'
import Image from 'next/image'
import { Search, Users, Shield, ChevronRight, Ship, Wrench, Calendar, Compass, MapPin, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Listing, MasterProfile } from '@/types'
import { getTranslations } from '@/lib/i18n/server'
import type { Translations } from '@/lib/i18n'
import { CategorySection } from '@/components/home/CategorySection'

async function getRecentListings(): Promise<Listing[]> {
  const { data } = await supabase
    .from('listings').select('*').eq('status', 'active')
    .order('created_at', { ascending: false }).limit(6)
  return (data as Listing[]) ?? []
}

async function getRecentMasters(): Promise<MasterProfile[]> {
  const { data } = await supabase
    .from('master_profiles').select('*').eq('listed_publicly', true).limit(4)
  return (data as MasterProfile[]) ?? []
}

async function getCategoryCounts() {
  const { count: boatSaleCount } = await supabase
    .from('listings').select('*', { count: 'exact', head: true }).eq('category', 'boat_sale').eq('status', 'active')
  const { count: boatRentCount } = await supabase
    .from('listings').select('*', { count: 'exact', head: true }).in('category', ['boat_rent_daily', 'boat_rent_hourly']).eq('status', 'active')
  const { count: tourCount } = await supabase
    .from('listings').select('*', { count: 'exact', head: true }).in('category', ['boat_tour', 'boat_fishing']).eq('status', 'active')
  const { count: equipmentCount } = await supabase
    .from('listings').select('*', { count: 'exact', head: true }).in('category', ['equipment_sale', 'equipment_rent']).eq('status', 'active')

  return { boatSaleCount: boatSaleCount || 0, boatRentCount: boatRentCount || 0, tourCount: tourCount || 0, equipmentCount: equipmentCount || 0 }
}

export default async function HomePage() {
  const [{ t }, listings, masters, counts] = await Promise.all([
    getTranslations(),
    getRecentListings(),
    getRecentMasters(),
    getCategoryCounts(),
  ])

  const categories = [
    { key: 'satilik', label: t.home.cat_satilik, sub: t.home.cat_satilik_sub, icon: Ship, bg: 'bg-orange-500/10 border-orange-500/25 hover:border-orange-500/50' },
    { key: 'kiralik', label: t.home.cat_kiralik, sub: t.home.cat_kiralik_sub, icon: Calendar, bg: 'bg-sky-500/10 border-sky-500/25 hover:border-sky-500/50' },
    { key: 'tur', label: t.home.cat_tur, sub: t.home.cat_tur_sub, icon: Compass, bg: 'bg-emerald-500/10 border-emerald-500/25 hover:border-emerald-500/50' },
    { key: 'ekipman', label: t.home.cat_ekipman, sub: t.home.cat_ekipman_sub, icon: Wrench, bg: 'bg-violet-500/10 border-violet-500/25 hover:border-violet-500/50' },
  ]

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[580px] flex items-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 10% 50%, rgba(249,115,22,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(14,165,233,0.10) 0%, transparent 50%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Logo Section */}
            <div className="hidden lg:flex justify-center">
              <Image
                src="/naviva-logo.png"
                alt="Naviva Logo"
                width={400}
                height={250}
                className="w-full max-w-md drop-shadow-2xl"
                priority
              />
            </div>

            {/* Text Section */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-orange-400 text-xs font-semibold tracking-wider uppercase">{t.home.badge}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {t.home.heroTitle1}<br />
                <span className="text-orange-400">{t.home.heroTitle2}</span>
              </h1>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                {t.home.heroSub}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/market"
                  className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  <Search className="w-4 h-4" /> {t.home.browseListings}
                </Link>
                <Link href="/ustalar"
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold px-7 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  <Users className="w-4 h-4" /> {t.home.findMaster}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kategoriler + Son İlanlar */}
      <section className="bg-slate-900/50 border-y border-slate-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sol Sidebar - Kategoriler */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 text-orange-400">Tüm Kategoriler</h3>

                <div className="space-y-0.5">
                  {/* Satılık Tekne */}
                  <CategorySection
                    title="Satılık Tekne"
                    count={counts.boatSaleCount}
                    subcategories={[
                      { name: 'Motoryat', count: Math.floor(counts.boatSaleCount * 0.4) },
                      { name: 'Yelkenli', count: Math.floor(counts.boatSaleCount * 0.3) },
                      { name: 'Katamaran', count: Math.floor(counts.boatSaleCount * 0.15) },
                      { name: 'Gulet', count: Math.floor(counts.boatSaleCount * 0.15) },
                    ]}
                  />

                  {/* Kiralık Tekne */}
                  <CategorySection
                    title="Kiralık Tekne"
                    count={counts.boatRentCount}
                    subcategories={[
                      { name: 'Günlük Kiralık', count: Math.floor(counts.boatRentCount * 0.6) },
                      { name: 'Saatlik Kiralık', count: Math.floor(counts.boatRentCount * 0.4) },
                    ]}
                  />

                  {/* Tur / Charter */}
                  <CategorySection
                    title="Tur / Charter"
                    count={counts.tourCount}
                    subcategories={[
                      { name: 'Günübirlik Tur', count: Math.floor(counts.tourCount * 0.6) },
                      { name: 'Balık Turu', count: Math.floor(counts.tourCount * 0.4) },
                    ]}
                  />

                  {/* Ekipman */}
                  <CategorySection
                    title="Deniz Aracı Ekipmanları"
                    count={counts.equipmentCount}
                    subcategories={[
                      { name: 'Deniz Motorları', count: Math.floor(counts.equipmentCount * 0.3) },
                      { name: 'Elektrik', count: Math.floor(counts.equipmentCount * 0.2) },
                      { name: 'Motor Aksamı', count: Math.floor(counts.equipmentCount * 0.2) },
                      { name: 'Navigasyon', count: Math.floor(counts.equipmentCount * 0.1) },
                      { name: 'Güverte', count: Math.floor(counts.equipmentCount * 0.1) },
                      { name: 'Diğer', count: Math.floor(counts.equipmentCount * 0.1) },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Sağ - Son İlanlar */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-lg font-bold">{t.home.recentListings}</h2>
                <Link href="/market" className="text-orange-400 text-sm hover:text-orange-300 flex items-center gap-1">
                  {t.home.all} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {listings.length === 0 ? (
                <div className="text-center py-16 text-slate-500">{t.home.noListings}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {listings.map(l => <ListingCard key={l.id} listing={l} t={t} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ustalar */}
      {masters.length > 0 && (
        <section className="bg-slate-800/40 border-y border-slate-700/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-white text-xl font-bold">{t.home.trustedMasters}</h2>
                <p className="text-slate-500 text-sm mt-1">{t.home.certifiedTechs}</p>
              </div>
              <Link href="/ustalar" className="text-orange-400 text-sm hover:text-orange-300 flex items-center gap-1">
                {t.home.all} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {masters.map(m => <MasterCard key={m.id} master={m} t={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-orange-500/15 to-orange-600/5 border border-orange-500/25 p-10 sm:p-14 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 mb-6">
            <Shield className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-3">{t.home.areyouMaster}</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            {t.home.masterCta}
          </p>
          <Link href="/uye-ol?usta=1"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm">
            <Users className="w-4 h-4" /> {t.home.registerAsMaster}
          </Link>
        </div>
      </section>

      {/* Web Yenilikleri - Yeni İlanlar Carousel */}
      {listings.length > 0 && (
        <div className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4 text-orange-400">✨ Naviva Web'de Yeni İlanlar</h3>
            <div className="overflow-hidden">
              <div className="flex gap-4 animate-scroll" style={{ width: 'fit-content' }}>
                {/* First set of listings */}
                {listings.map(l => <CarouselListingCard key={`first-${l.id}`} listing={l} t={t} />)}
                {/* Duplicate for infinite scroll effect */}
                {listings.map(l => <CarouselListingCard key={`second-${l.id}`} listing={l} t={t} />)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({ listing, t }: { listing: Listing; t: Translations }) {
  const photo = listing.photos?.[0]
  const catLabel: Record<string, string> = {
    boat_sale: t.market.boat_sale,
    boat_rent_daily: t.market.boat_rent_daily,
    boat_rent_hourly: t.market.boat_rent_hourly,
    boat_tour: t.market.boat_tour,
    boat_fishing: t.market.boat_fishing,
    equipment_sale: t.market.equipment_sale,
    equipment_rent: t.market.equipment_rent,
  }
  const price = listing.price
    ? (() => {
        const sym = listing.price_unit === 'EUR' ? '€' : listing.price_unit === 'USD' ? '$' : '₺'
        const amt = listing.price % 1 === 0 ? listing.price.toLocaleString('tr-TR') : listing.price.toFixed(2)
        const periods: Record<string, string> = {
          per_day: t === t ? (t.nav.listings === 'Listings' ? '/day' : '/gün') : '/gün',
          per_hour: t.nav.listings === 'Listings' ? '/hr' : '/saat',
          per_person: t.nav.listings === 'Listings' ? '/person' : '/kişi',
        }
        return `${sym}${amt}${periods[listing.price_period] ?? ''}`
      })()
    : t.marketDetail.priceAsk

  return (
    <Link href={`/market/${listing.id}`}
      className="group block rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-800/50 hover:border-orange-500/50 hover:bg-slate-800 transition-all">
      <div className="h-44 bg-slate-700/40 relative overflow-hidden">
        {photo ? (
          <Image src={photo} alt={listing.title || t.home.photoAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ship className="w-10 h-10 text-slate-600" />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          {catLabel[listing.category] ?? listing.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-slate-100 font-semibold text-sm leading-snug line-clamp-2 mb-3">{listing.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-xs flex items-center gap-1">
            {listing.location_city && <><MapPin className="w-3 h-3" />{listing.location_city}</>}
          </span>
          <span className="text-orange-400 font-bold text-sm">{price}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Master Card ──────────────────────────────────────────────────────────────
function MasterCard({ master, t }: { master: MasterProfile; t: Translations }) {
  return (
    <Link href={`/ustalar/${master.id}`}
      className="group block rounded-2xl border border-slate-700/60 bg-slate-800/50 hover:border-orange-500/40 hover:bg-slate-800 transition-all p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-orange-500/15 border border-orange-500/30 overflow-hidden flex items-center justify-center flex-shrink-0">
          {master.photo_url ? (
            <Image src={master.photo_url} alt={master.full_name || t.home.masterPhotoAlt} width={44} height={44} className="object-cover w-full h-full" unoptimized />
          ) : (
            <Users className="w-4 h-4 text-orange-400" />
          )}
        </div>
        <div>
          <p className="text-slate-100 font-semibold text-sm">{master.full_name}</p>
          <p className="text-slate-500 text-xs">{master.title ?? t.home.defaultTitle}</p>
        </div>
      </div>
      {master.location_city && (
        <p className="text-slate-500 text-xs flex items-center gap-1">
          <MapPin className="w-3 h-3" />{master.location_city}
        </p>
      )}
      {master.experience_years && (
        <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 text-orange-400" />{master.experience_years} {t.home.yearsExp}
        </p>
      )}
    </Link>
  )
}

// ─── Carousel Listing Card ────────────────────────────────────────────────────
function CarouselListingCard({ listing, t }: { listing: Listing; t: Translations }) {
  const photo = listing.photos?.[0]
  const catLabel: Record<string, string> = {
    boat_sale: t.market.boat_sale,
    boat_rent_daily: t.market.boat_rent_daily,
    boat_rent_hourly: t.market.boat_rent_hourly,
    boat_tour: t.market.boat_tour,
    boat_fishing: t.market.boat_fishing,
    equipment_sale: t.market.equipment_sale,
    equipment_rent: t.market.equipment_rent,
  }
  const price = listing.price
    ? (() => {
        const sym = listing.price_unit === 'EUR' ? '€' : listing.price_unit === 'USD' ? '$' : '₺'
        const amt = listing.price % 1 === 0 ? listing.price.toLocaleString('tr-TR') : listing.price.toFixed(2)
        return `${sym}${amt}`
      })()
    : t.marketDetail.priceAsk

  return (
    <Link href={`/market/${listing.id}`}
      className="group flex-shrink-0 w-64 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-800/50 hover:border-orange-500/50 hover:bg-slate-800 transition-all">
      <div className="h-36 bg-slate-700/40 relative overflow-hidden">
        {photo ? (
          <Image src={photo} alt={listing.title || t.home.photoAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ship className="w-8 h-8 text-slate-600" />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
          {catLabel[listing.category] ?? listing.category}
        </span>
      </div>
      <div className="p-3">
        <h4 className="text-slate-100 font-semibold text-xs leading-snug line-clamp-2 mb-2">{listing.title}</h4>
        <div className="flex items-center justify-between">
          {listing.location_city && (
            <span className="text-slate-500 text-xs flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />{listing.location_city}
            </span>
          )}
          <span className="text-orange-400 font-bold text-xs">{price}</span>
        </div>
      </div>
    </Link>
  )
}