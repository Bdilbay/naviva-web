'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Users, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MasterProfile {
  id: string
  full_name: string
  location_city?: string
  photo_url?: string
  avg_rating: number
  review_count: number
  specialties?: string[]
}

interface TrustedMastersListProps {
  limit?: number
  showTitle?: boolean
}

export function TrustedMastersList({ limit = 6, showTitle = true }: TrustedMastersListProps) {
  const [masters, setMasters] = useState<MasterProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrustedMasters()
  }, [limit])

  const fetchTrustedMasters = async () => {
    try {
      const { data, error } = await supabase
        .from('master_profiles')
        .select('id, full_name, location_city, photo_url, avg_rating, review_count, specialties')
        .or(`listed_publicly.eq.true,listed_publicly.is.null`)
        .gt('avg_rating', 0)
        .order('avg_rating', { ascending: false })
        .order('review_count', { ascending: false })
        .limit(limit)

      if (error) throw error
      setMasters(data || [])
    } catch (error) {
      console.error('Failed to fetch trusted masters:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 bg-slate-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (masters.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Henüz derecelendirilmiş usta bulunmamaktadır</p>
      </div>
    )
  }

  return (
    <div>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            En Güvenilir Ustalar
          </h2>
          <p className="text-slate-400 text-sm">Kullanıcılar tarafından yüksek puanlandırılan ustalar</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {masters.map((master) => (
          <Link key={master.id} href={`/ustalar/${master.id}`}
            className="group block rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/30 hover:border-yellow-500/40 hover:from-slate-800/80 hover:to-slate-800/50 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-yellow-500/10">

            {/* Photo */}
            <div className="relative w-full h-40 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
              {master.photo_url ? (
                <Image
                  src={master.photo_url}
                  alt={master.full_name}
                  width={300}
                  height={160}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-600/10">
                  <Users className="w-12 h-12 text-orange-400/50" />
                </div>
              )}

              {/* Rating Badge */}
              {master.avg_rating > 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500/95 px-2 py-1.5 rounded-full shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span className="text-xs font-bold text-white">{master.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-slate-100 font-bold text-sm leading-tight truncate">{master.full_name}</h3>

              {master.location_city && (
                <p className="text-slate-500 text-xs mt-1">{master.location_city}</p>
              )}

              {/* Rating Stars */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(master.avg_rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500">({master.review_count})</span>
              </div>

              {/* Specialties */}
              {master.specialties && master.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {master.specialties.slice(0, 2).map((specialty: string) => (
                    <span key={specialty} className="bg-yellow-500/15 text-yellow-300 text-xs px-2 py-0.5 rounded border border-yellow-500/20">
                      {specialty}
                    </span>
                  ))}
                  {master.specialties.length > 2 && (
                    <span className="text-slate-600 text-xs px-2 py-0.5">+{master.specialties.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
