import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Mail, Star, Wrench, Users, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MasterProfile } from '@/types'
import { getTranslations } from '@/lib/i18n/server'
import ReviewsSection from '@/components/masters/ReviewsSection'

async function getMaster(id: string): Promise<MasterProfile | null> {
  const { data } = await supabase
    .from('master_profiles').select('*').eq('id', id).or(`listed_publicly.eq.true,listed_publicly.is.null`).single()
  return data as MasterProfile | null
}

export default async function MasterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, { t, lang }] = await Promise.all([params, getTranslations()])
  const master = await getMaster(id)
  if (!master) notFound()

  const joinDate = new Date(master.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'tr-TR')
  const memberSince = t.masterDetail.memberSince.replace('{date}', joinDate)

  return (
    <div className="pt-16 min-h-screen bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/ustalar" className="hover:text-slate-300 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> {t.masterDetail.back}
          </Link>
          <span>/</span>
          <span className="text-slate-400">{master.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol — profil bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profil başlık */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-orange-500/15 border border-orange-500/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {master.photo_url ? (
                    <Image src={master.photo_url} alt={master.name || t.masters.masterPhotoAlt} width={80} height={80} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <Users className="w-8 h-8 text-orange-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-white text-xl font-bold mb-1">{master.name}</h1>
                  <p className="text-orange-400 text-sm font-medium mb-2">{master.title ?? t.masterDetail.defaultTitle}</p>
                  {master.city && (
                    <p className="text-slate-500 text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />{master.city}
                    </p>
                  )}
                  {master.experience_years && (
                    <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-400" />
                      {master.experience_years} {t.masterDetail.yearsExp}
                    </p>
                  )}
                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(master.avg_rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`}
                      />
                    ))}
                    <span className="text-yellow-400 font-bold text-sm ml-1">
                      {(master.avg_rating ?? 0).toFixed(1)}
                    </span>
                    {master.review_count > 0 && (
                      <span className="text-slate-500 text-sm">({master.review_count})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Biyografi */}
            {master.bio && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t.masterDetail.about}</h2>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{master.bio}</p>
              </div>
            )}

            {/* Uzmanlık alanları */}
            {master.specialties?.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-500" /> {t.masterDetail.specialties}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {master.specialties.map(s => (
                    <span key={s} className="bg-orange-500/10 border border-orange-500/25 text-orange-400 text-sm px-3 py-1.5 rounded-xl">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Üye tarihi */}
            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {memberSince}
            </div>
          </div>

          {/* Sağ — iletişim kartı */}
          <div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 sticky top-20">
              <h2 className="text-white font-semibold mb-5 text-sm">{t.masterDetail.contact}</h2>

              <div className="space-y-3">
                {master.phone && (
                  <a href={`tel:${master.phone}`}
                    className="flex items-center gap-3 w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
                    <Phone className="w-4 h-4" />
                    {master.phone}
                  </a>
                )}
                {master.email && (
                  <a href={`mailto:${master.email}`}
                    className="flex items-center gap-3 w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
                    <Mail className="w-4 h-4" />
                    {t.masterDetail.sendEmail}
                  </a>
                )}
                {!master.phone && !master.email && (
                  <Link href="/giris"
                    className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
                    {t.masterDetail.loginToContact}
                  </Link>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-700/50">
                <p className="text-slate-600 text-xs text-center">
                  {t.masterDetail.contactNote}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection masterId={master.id} masterName={master.name} />
      </div>
    </div>
  )
}
