'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, SlidersHorizontal, Ship, MapPin, ChevronRight, ChevronDown, ChevronUp, X, Plus, Heart, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Listing, CATEGORY_GROUPS } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const SPECIALTIES = ['Motor Tamircisi', 'Elektrik', 'Yelken & Donanım', 'Ahşap İşleri', 'Temizlik']

const EQUIPMENT_CATEGORIES = [
  'Deniz Elektroniği (GPS, Balık Bulucu, VHF, Radar)',
  'Motor Parçaları (Pervane, Yağ Filtresi, Yakıt)',
  'Yelken Donanımı (Yelken, Halat, Vinç)',
]

const RENTAL_TYPES = [
  'Charter / Tur',
  'Günübirlik Tur',
  'Haftalık Charter',
  'Kabin Kiralama',
  'Yelkenli Kiralama (Bareboat)',
  'Yelkenli Kiralama (Kaptanlı)',
  'Motoryat Kiralama (Günübirlik)',
  'Motoryat Kiralama (Haftalık)',
  'Özel Organizasyon',
]

export default function MarketPage() {
  return <Suspense fallback={<div className="pt-16 min-h-screen bg-slate-900" />}><MarketContent /></Suspense>
}

function MarketContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, lang } = useLanguage()

  const groupKey = searchParams.get('kategori') ?? ''
  const boatType = searchParams.get('tip') ?? ''
  const searchQ = searchParams.get('q') ?? ''

  const [listings, setListings] = useState<Listing[]>([])
  const [showcaseListings, setShowcaseListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchQ)
  const [openSection, setOpenSection] = useState<string | null>('satilik')

  const activeGroup = CATEGORY_GROUPS.find(g => g.key === groupKey)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('listings').select('*').eq('status', 'active')
    if (activeGroup) q = q.in('category', activeGroup.categories)
    if (boatType) q = q.eq('boat_type', boatType)
    if (searchQ) q = q.ilike('title', `%${searchQ}%`)
    const { data } = await q.order('created_at', { ascending: false }).limit(60)
    setListings((data as Listing[]) ?? [])
    setLoading(false)
  }, [activeGroup, boatType, searchQ])

  // Fetch showcase listings (first 6) - synced with mobile
  const fetchShowcase = useCallback(async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6)
    setShowcaseListings((data as Listing[]) ?? [])
  }, [])

  useEffect(() => {
    fetchListings()
    fetchShowcase()
  }, [fetchListings, fetchShowcase])

  function navigate(params: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k))
    router.push(`/market?${p.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ q: searchInput, tip: '' })
  }

  const catLabel: Record<string, string> = {
    boat_sale: t.market.boat_sale,
    boat_rent_daily: t.market.boat_rent_daily,
    boat_rent_hourly: t.market.boat_rent_hourly,
    boat_tour: t.market.boat_tour,
    boat_fishing: t.market.boat_fishing,
    equipment_sale: t.market.equipment_sale,
    equipment_rent: t.market.equipment_rent,
  }

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-white text-2xl font-bold mb-5">
            {activeGroup ? activeGroup.label : t.market.allListings}
          </h1>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t.market.searchPlaceholder}
                className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button type="submit"
              className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              {t.market.search}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Sol sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 space-y-3">

            {/* Section 1: Hızlı Eylemler */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Market Filters
                </p>
              </div>
              <Link href="/market/yeni"
                className="flex items-center gap-2 w-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-orange-500/30 transition-colors mb-2">
                <Plus className="w-3.5 h-3.5" /> İlan Ver
              </Link>
              <button onClick={() => navigate({ kategori: '', tip: '' })}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors rounded-lg ${
                  !groupKey
                    ? 'text-orange-400 bg-orange-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}>
                Tüm İlanlar
              </button>
            </div>

            {/* Section 2: Satılık Tekne */}
            <SidebarSection title="Satılık Tekne" icon={null} open={openSection === 'satilik'} onToggle={() => toggleSection('satilik')}>
              <button onClick={() => navigate({ kategori: 'satilik', tip: '' })}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${groupKey === 'satilik' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>
                Tüm Tekneler
              </button>
              {CATEGORY_GROUPS.find(g => g.key === 'satilik')?.boatTypes.map(type => (
                <button key={type} onClick={() => navigate({ kategori: 'satilik', tip: boatType === type ? '' : type })}
                  className={`w-full text-left pl-8 pr-4 py-2 text-xs transition-colors ${boatType === type && groupKey === 'satilik' ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}>
                  {type}
                </button>
              ))}
            </SidebarSection>

            {/* Section 3: Kiralık Tekne */}
            <SidebarSection title="Kiralık Tekne" icon={null} open={openSection === 'kiralik'} onToggle={() => toggleSection('kiralik')}>
              {RENTAL_TYPES.map(type => (
                <button key={type} onClick={() => navigate({ kategori: 'kiralik', q: type })}
                  className="w-full text-left px-4 py-2 text-xs text-slate-400 hover:text-slate-300">
                  {type}
                </button>
              ))}
            </SidebarSection>

            {/* Section 4: Usta Kategorileri */}
            <SidebarSection title="Usta Öz. Göre" icon={null} open={openSection === 'usta'} onToggle={() => toggleSection('usta')}>
              <Link href="/ustalar" className="block w-full text-left px-4 py-2 text-xs text-orange-400 hover:text-orange-300 font-semibold">
                Tüm Ustalar
              </Link>
              {SPECIALTIES.map(spec => (
                <Link key={spec} href={`/ustalar?uzmanlik=${spec}`}
                  className="block w-full text-left px-4 py-2 text-xs text-slate-400 hover:text-slate-300">
                  {spec}
                </Link>
              ))}
            </SidebarSection>

            {/* Section 5: Ekipman & Aksesuar */}
            <SidebarSection title="Ekipman & Aksesuar" icon={null} open={openSection === 'ekipman'} onToggle={() => toggleSection('ekipman')}>
              {EQUIPMENT_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => navigate({ kategori: 'ekipman', q: cat })}
                  className="w-full text-left px-4 py-2 text-xs text-slate-400 hover:text-slate-300">
                  {cat}
                </button>
              ))}
            </SidebarSection>

          </div>
        </aside>

        {/* İlan listesi */}
        <div className="flex-1 min-w-0">
          {/* Showcase Section - Always visible at top when no filters */}
          {!groupKey && !boatType && !searchQ && showcaseListings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="text-orange-400">✨</span> VİTRİN İLANLARI
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {showcaseListings.map(l => (
                  <Link key={l.id} href={`/market/${l.id}`}
                    className="group relative rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300">
                    {l.photos?.[0] ? (
                      <Image
                        src={l.photos[0]}
                        alt={l.title}
                        width={200}
                        height={160}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-32 bg-slate-700/50 flex items-center justify-center">
                        <Ship className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-between p-2">
                      <div className="bg-orange-500/80 text-white text-xs font-bold px-2 py-1 rounded w-fit">
                        ✨ VİTRİN
                      </div>
                      <div>
                        <p className="text-white font-semibold text-xs line-clamp-2">{l.title}</p>
                        {l.price && (
                          <p className="text-orange-400 text-xs font-bold mt-1">
                            {l.price_unit === 'EUR' ? '€' : l.price_unit === 'USD' ? '$' : '₺'}{l.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-b border-slate-700/50 mt-8" />
            </div>
          )}

          {/* Aktif filtreler */}
          {(groupKey || boatType || searchQ) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {groupKey && (
                <span className="inline-flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs px-3 py-1.5 rounded-full">
                  {activeGroup?.label}
                  <button onClick={() => navigate({ kategori: '', tip: '' })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {boatType && (
                <span className="inline-flex items-center gap-1.5 bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full">
                  {boatType}
                  <button onClick={() => navigate({ tip: '' })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQ && (
                <span className="inline-flex items-center gap-1.5 bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full">
                  &quot;{searchQ}&quot;
                  <button onClick={() => { setSearchInput(''); navigate({ q: '' }) }}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          <p className="text-slate-500 text-sm mb-4">
            {loading
              ? t.market.loading
              : t.market.listingsFound.replace('{count}', String(listings.length))}
          </p>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-slate-800/50 border border-slate-700/50 h-48 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <Ship className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">{t.market.noListings}</p>
              <button onClick={() => { setSearchInput(''); navigate({ kategori: '', tip: '', q: '' }) }}
                className="mt-4 text-orange-400 text-sm hover:underline">
                {t.market.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {listings.map(l => <CompactListingCard key={l.id} listing={l} catLabel={catLabel} lang={lang} priceAsk={t.marketDetail.priceAsk} photoAlt={t.market.photoAlt} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Sidebar Section Component
function SidebarSection({
  title,
  icon,
  children,
  open,
  onToggle,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors"
      >
        <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          {icon} {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <nav className="py-2 border-t border-slate-700/50 space-y-0.5">
          {children}
        </nav>
      )}
    </div>
  )
}

// Toast Notification Component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-lg flex items-center gap-3 ${
      type === 'success' ? 'bg-green-500/90' : 'bg-blue-500/90'
    } text-white text-sm font-medium shadow-lg z-50 animate-in`}>
      {type === 'success' ? (
        <Check className="w-5 h-5 flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-white border-r-transparent animate-spin" />
      )}
      {message}
    </div>
  )
}

// Kompakt Listing Card
function CompactListingCard({ listing, catLabel, lang, priceAsk, photoAlt }: {
  listing: Listing
  catLabel: Record<string, string>
  lang: string
  priceAsk: string
  photoAlt: string
}) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const photo = listing.photos?.[0]
  const price = listing.price
    ? (() => {
        const sym = listing.price_unit === 'EUR' ? '€' : listing.price_unit === 'USD' ? '$' : '₺'
        const amt = listing.price % 1 === 0 ? listing.price.toLocaleString('tr-TR') : listing.price.toFixed(2)
        const periods: Record<string, string> = lang === 'en'
          ? { per_day: '/day', per_hour: '/hr', per_person: '/person' }
          : { per_day: '/gün', per_hour: '/saat', per_person: '/kişi' }
        return `${sym}${amt}${periods[listing.price_period] ?? ''}`
      })()
    : priceAsk

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      window.location.href = '/giris'
      return
    }

    setLoading(true)
    setToast({ message: 'Favorilerinize ekleniyor...', type: 'info' })

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', listing.id)
          .eq('item_type', 'listing')
        setIsFavorited(false)
        setToast({ message: 'Favorilerden çıkarıldı', type: 'success' })
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          item_id: listing.id,
          item_type: 'listing',
        })
        setIsFavorited(true)
        setToast({ message: 'Favorilerinize eklendi ❤️', type: 'success' })
      }
    } catch (error) {
      setToast({ message: 'Bir hata oluştu', type: 'success' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Link href={`/market/${listing.id}`}
        className="group block rounded-xl overflow-hidden border border-slate-700/60 bg-slate-800/50 hover:border-orange-500/50 hover:bg-slate-800 transition-all relative">
        <div className="h-32 bg-slate-700/40 relative overflow-hidden">
          {photo ? (
            <Image src={photo} alt={listing.title || photoAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Ship className="w-6 h-6 text-slate-600" />
            </div>
          )}
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            {catLabel[listing.category] ?? listing.category}
          </span>
          {/* Favorite Heart Button */}
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            )}
          </button>
        </div>
        <div className="p-2.5">
          <h3 className="text-slate-100 font-semibold text-xs line-clamp-1 mb-1.5">{listing.title}</h3>
          <div className="flex items-center justify-between gap-1">
            <span className="text-slate-500 text-[11px] flex items-center gap-0.5 flex-1 min-w-0">
              {listing.location_city && (
                <>
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{listing.location_city}</span>
                </>
              )}
            </span>
            <span className="text-orange-400 font-bold text-xs flex-shrink-0">{price}</span>
          </div>
        </div>
      </Link>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
