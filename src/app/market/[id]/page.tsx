import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Ruler, Users, Anchor, Fuel, Gauge, BedDouble, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Listing } from '@/types'
import { getTranslations } from '@/lib/i18n/server'
import type { Translations } from '@/lib/i18n'
import ListingDetailSidebar from '@/components/market/ListingDetailSidebar'

async function getListing(id: string): Promise<Listing | null> {
  const { data } = await supabase.from('listings').select('*').eq('id', id).single()
  return data as Listing | null
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, { t, lang }] = await Promise.all([params, getTranslations()])
  const listing = await getListing(id)
  if (!listing) notFound()

  const catLabel: Record<string, string> = {
    boat_sale: t.marketDetail.boat_sale,
    boat_rent_daily: t.marketDetail.boat_rent_daily,
    boat_rent_hourly: t.marketDetail.boat_rent_hourly,
    boat_tour: t.marketDetail.boat_tour,
    boat_fishing: t.marketDetail.boat_fishing,
    equipment_sale: t.marketDetail.equipment_sale,
    equipment_rent: t.marketDetail.equipment_rent,
  }

  const specs = [
    listing.boat_year && { icon: Calendar, label: t.marketDetail.spec_year, value: String(listing.boat_year) },
    listing.boat_length_m && { icon: Ruler, label: t.marketDetail.spec_length, value: `${listing.boat_length_m} m` },
    listing.boat_beam_m && { icon: Ruler, label: t.marketDetail.spec_beam, value: `${listing.boat_beam_m} m` },
    listing.boat_hull_material && { icon: Anchor, label: t.marketDetail.spec_hull, value: listing.boat_hull_material },
    listing.boat_capacity && { icon: Users, label: t.marketDetail.spec_capacity, value: `${listing.boat_capacity} ${t.marketDetail.persons}` },
    listing.boat_cabin_count && { icon: Home, label: t.marketDetail.spec_cabin, value: String(listing.boat_cabin_count) },
    listing.boat_berth_count && { icon: BedDouble, label: t.marketDetail.spec_berth, value: String(listing.boat_berth_count) },
    listing.boat_engine_brand && { icon: Gauge, label: t.marketDetail.spec_engine, value: listing.boat_engine_brand },
    listing.boat_engine_hp && { icon: Gauge, label: t.marketDetail.spec_power, value: `${listing.boat_engine_hp} HP` },
    listing.boat_fuel_type && { icon: Fuel, label: t.marketDetail.spec_fuel, value: listing.boat_fuel_type },
    listing.boat_engine_hours && { icon: Calendar, label: t.marketDetail.spec_hours, value: String(listing.boat_engine_hours) },
    listing.boat_flag && { icon: Anchor, label: t.marketDetail.spec_flag, value: listing.boat_flag },
  ].filter(Boolean) as { icon: React.ElementType, label: string, value: string }[]


  return (
    <div className="pt-16 min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/market" className="hover:text-slate-300 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> {t.marketDetail.back}
          </Link>
          <span>/</span>
          <span className="text-slate-400">{catLabel[listing.category]}</span>
          {listing.boat_type && <><span>/</span><span className="text-slate-400">{listing.boat_type}</span></>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol — fotoğraflar + detaylar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fotoğraf galerisi */}
            <div className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50">
              {listing.photos.length > 0 ? (
                <PhotoGallery photos={listing.photos} title={listing.title} />
              ) : (
                <div className="h-72 flex items-center justify-center">
                  <Anchor className="w-16 h-16 text-slate-700" />
                </div>
              )}
            </div>

            {/* Başlık + etiketler */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                  {catLabel[listing.category]}
                </span>
                {listing.boat_type && (
                  <span className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-lg">{listing.boat_type}</span>
                )}
                {listing.boat_is_swappable && (
                  <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs px-3 py-1 rounded-lg">{t.marketDetail.swap}</span>
                )}
              </div>
              <h1 className="text-white text-2xl font-bold mb-2">{listing.title}</h1>
              {listing.location_city && (
                <p className="text-slate-500 text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.location_city}{listing.location_district ? `, ${listing.location_district}` : ''}
                  {listing.location_marina ? ` — ${listing.location_marina}` : ''}
                </p>
              )}
            </div>

            {/* Teknik özellikler */}
            {specs.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{t.marketDetail.specs}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specs.map((spec, i) => {
                    const Icon = spec.icon
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <Icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-slate-500 text-xs">{spec.label}</p>
                          <p className="text-slate-200 text-sm font-medium">{spec.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Açıklama */}
            {listing.description && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t.marketDetail.desc}</h2>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}
          </div>

          {/* Sağ — fiyat + iletişim + favori */}
          <ListingDetailSidebar listing={listing} t={t} lang={lang} />
        </div>
      </div>
    </div>
  )
}

function PhotoGallery({ photos, title }: { photos: string[], title: string }) {
  return (
    <div className="relative">
      <div className="relative h-80">
        <Image src={photos[0]} alt={title || 'Listing photo'} fill className="object-cover" unoptimized />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 p-3 bg-slate-900/50 overflow-x-auto">
          {photos.slice(1, 5).map((p, i) => (
            <div key={i} className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
              <Image src={p} alt={`${title || 'Listing photo'} ${i + 2}`} fill className="object-cover" unoptimized />
            </div>
          ))}
          {photos.length > 5 && (
            <div className="w-20 h-16 flex-shrink-0 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
              +{photos.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
