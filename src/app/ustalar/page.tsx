'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Users, MapPin, Star, Wrench, X, Heart, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MasterProfile } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const SPECIALTIES = [
  'Motor Bakım', 'Tekne Boyama', 'Elektrik', 'Deniz Elektroniği',
  'Yelken Tamiri', 'Fiber Tamir', 'Şaft & Pervane', 'Ağaç İşleri',
  'Hidrolik Sistemler', 'Klima Sistemleri',
]

const CITIES = [
  'İstanbul', 'İzmir', 'Muğla', 'Antalya', 'Çanakkale',
  'Balıkesir', 'Mersin', 'Bursa', 'Bodrum', 'Marmaris',
]

export default function UstalarPage() {
  return <Suspense fallback={<div className="pt-16 min-h-screen bg-slate-900" />}><UstalarContent /></Suspense>
}

function UstalarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()

  const searchQ = searchParams.get('q') ?? ''
  const specialty = searchParams.get('uzmanlik') ?? ''
  const city = searchParams.get('sehir') ?? ''

  const [masters, setMasters] = useState<MasterProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchQ)

  const fetchMasters = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQ) params.append('search', searchQ)
      if (specialty) params.append('specialty', specialty)
      if (city) params.append('city', city)

      const res = await fetch(`/api/masters/list?${params.toString()}`)
      const result = await res.json()
      if (result.success) {
        setMasters(result.data as MasterProfile[])
      }
    } catch (error) {
      console.error('Failed to fetch masters:', error)
      setMasters([])
    } finally {
      setLoading(false)
    }
  }, [searchQ, specialty, city])

  useEffect(() => { fetchMasters() }, [fetchMasters])

  function navigate(params: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k))
    router.push(`/ustalar?${p.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ q: searchInput })
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-white text-2xl font-bold">{t.masters.title}</h1>
              <p className="text-slate-500 text-sm mt-1">{t.masters.subtitle}</p>
            </div>
            <Link href="/uye-ol?usta=1"
              className="hidden sm:inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              <Users className="w-4 h-4" /> {t.masters.registerAsMaster}
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t.masters.searchPlaceholder}
                className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button type="submit"
              className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              {t.masters.search}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Sol sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          {/* Uzmanlık */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden sticky top-20 mb-4">
            <div className="px-4 py-3 border-b border-slate-700/50">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5" /> {t.masters.specialty}
              </p>
            </div>
            <nav className="py-2">
              <button onClick={() => navigate({ uzmanlik: '' })}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!specialty ? 'text-orange-400 bg-orange-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>
                {t.masters.all}
              </button>
              {SPECIALTIES.map(s => (
                <button key={s} onClick={() => navigate({ uzmanlik: specialty === s ? '' : s })}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${specialty === s ? 'text-orange-400 bg-orange-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>
                  {s}
                </button>
              ))}
            </nav>
          </div>

          {/* Şehir */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> {t.masters.city}
              </p>
            </div>
            <nav className="py-2">
              <button onClick={() => navigate({ sehir: '' })}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!city ? 'text-orange-400 bg-orange-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>
                {t.masters.all}
              </button>
              {CITIES.map(c => (
                <button key={c} onClick={() => navigate({ sehir: city === c ? '' : c })}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${city === c ? 'text-orange-400 bg-orange-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>
                  {c}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Usta listesi */}
        <div className="flex-1 min-w-0">
          {/* Aktif filtreler */}
          {(specialty || city || searchQ) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {specialty && (
                <span className="inline-flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs px-3 py-1.5 rounded-full">
                  {specialty}
                  <button onClick={() => navigate({ uzmanlik: '' })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {city && (
                <span className="inline-flex items-center gap-1.5 bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full">
                  {city}
                  <button onClick={() => navigate({ sehir: '' })}><X className="w-3 h-3" /></button>
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
              ? t.masters.loading
              : t.masters.mastersFound.replace('{count}', String(masters.length))}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 h-40 animate-pulse" />
              ))}
            </div>
          ) : masters.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">{t.masters.noMasters}</p>
              <button onClick={() => { setSearchInput(''); navigate({ uzmanlik: '', sehir: '', q: '' }) }}
                className="mt-4 text-orange-400 text-sm hover:underline">
                {t.masters.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {masters.map(m => <MasterCard key={m.id} master={m} yearsExp={t.masters.yearsExp} defaultTitle={t.masters.defaultTitle} photoAlt={t.masters.masterPhotoAlt} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Toast for Masters
function MasterToast({ message, type, onClose }: { message: string; type: 'success' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-lg flex items-center gap-3 ${
      type === 'success' ? 'bg-green-500/90' : 'bg-blue-500/90'
    } text-white text-sm font-medium shadow-lg z-50`}>
      {type === 'success' ? (
        <Check className="w-5 h-5 flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-white border-r-transparent animate-spin" />
      )}
      {message}
    </div>
  )
}

function MasterCard({ master, yearsExp, defaultTitle, photoAlt }: {
  master: MasterProfile
  yearsExp: string
  defaultTitle: string
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
          .eq('item_id', master.id)
          .eq('item_type', 'master')
        setIsFavorited(false)
        setToast({ message: 'Favorilerden çıkarıldı', type: 'success' })
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          item_id: master.id,
          item_type: 'master',
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
      <Link href={`/ustalar/${master.id}`}
        className="group block rounded-2xl border border-slate-700/60 bg-slate-800/50 hover:border-orange-500/50 hover:bg-slate-800 transition-all p-5 relative">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 overflow-hidden flex items-center justify-center flex-shrink-0">
            {master.photo_url ? (
              <Image src={master.photo_url} alt={master.full_name || photoAlt} width={56} height={56} className="object-cover w-full h-full" unoptimized />
            ) : (
              <Users className="w-5 h-5 text-orange-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-100 font-semibold text-sm leading-tight">{master.full_name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{master.title ?? defaultTitle}</p>
            {master.location_city && (
              <p className="text-slate-500 text-xs flex items-center gap-1 mt-1.5">
                <MapPin className="w-3 h-3" />{master.location_city}
              </p>
            )}
          </div>
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-700/50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-orange-400 border-r-transparent rounded-full animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            )}
          </button>
        </div>

        {master.experience_years && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400 text-xs">{master.experience_years} {yearsExp}</span>
          </div>
        )}

        {master.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {master.specialties.slice(0, 3).map(s => (
              <span key={s} className="bg-slate-700/80 text-slate-400 text-xs px-2 py-0.5 rounded-md">{s}</span>
            ))}
            {master.specialties.length > 3 && (
              <span className="text-slate-600 text-xs px-1 py-0.5">+{master.specialties.length - 3}</span>
            )}
          </div>
        )}
      </Link>

      {toast && <MasterToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
