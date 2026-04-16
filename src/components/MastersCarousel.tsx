'use client'

import { useEffect, useRef, useState } from 'react'
import { MasterProfile } from '@/types'
import type { Translations } from '@/lib/i18n'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Users } from 'lucide-react'

interface MastersCarouselProps {
  masters: MasterProfile[]
  t: Translations
}

export default function MastersCarousel({ masters, t }: MastersCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!containerRef.current || masters.length === 0) return

    let animationFrameId: number
    let position = 0
    const cardWidth = 320 + 16 // w-80 + gap (bigger cards)
    const totalWidth = cardWidth * masters.length

    const animate = () => {
      if (!isHovered) {
        position = (position + 0.5) % totalWidth
        if (containerRef.current) {
          containerRef.current.scrollLeft = position
        }
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [masters.length, isHovered])

  if (masters.length === 0) return null

  return (
    <div
      className="overflow-hidden rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-hidden scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Display masters twice for seamless loop */}
        {[...masters, ...masters].map((master, idx) => (
          <MasterCardItem key={`${master.id}-${idx}`} master={master} t={t} />
        ))}
      </div>
    </div>
  )
}

function MasterCardItem({
  master,
  t,
}: {
  master: MasterProfile
  t: Translations
}) {
  return (
    <Link
      href={`/ustalar/${master.id}`}
      className="flex-shrink-0 w-80 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/70 to-slate-800/40 hover:border-orange-500/50 hover:from-slate-800/90 hover:to-slate-800/60 transition-all p-6 flex flex-col h-fit shadow-lg hover:shadow-orange-500/20"
    >
      {/* Avatar + Name Section */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/40 overflow-hidden flex items-center justify-center flex-shrink-0">
          {master.photo_url ? (
            <Image
              src={master.photo_url}
              alt={master.full_name || t.home.masterPhotoAlt}
              width={64}
              height={64}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <Users className="w-7 h-7 text-orange-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base leading-tight mb-1">
            {master.full_name}
          </p>
          <p className="text-slate-400 text-sm mb-2">
            {master.title ?? t.home.defaultTitle}
          </p>

          {/* Rating Stars - Inline */}
          {master.avg_rating && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(master.avg_rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-amber-400 text-xs font-bold">
                {master.avg_rating.toFixed(1)}
              </span>
              {master.review_count && master.review_count > 0 && (
                <span className="text-slate-500 text-xs">
                  ({master.review_count})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      {master.location_city && (
        <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-3 pb-3 border-b border-slate-700/50">
          <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <span className="truncate">{master.location_city}</span>
        </p>
      )}

      {/* Experience + Categories */}
      <div className="space-y-2.5">
        {master.experience_years && (
          <p className="text-slate-300 text-xs flex items-center gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-orange-400"></span>
            {master.experience_years} {t.home.yearsExp}
          </p>
        )}

        {master.categories && master.categories.length > 0 && (
          <p className="text-slate-400 text-xs">
            <span className="text-orange-400 font-semibold">Uzmanlık:</span> {master.categories.slice(0, 2).join(', ')}
          </p>
        )}

        {master.bio && (
          <p className="text-slate-500 text-xs line-clamp-2 italic">
            "{master.bio}"
          </p>
        )}
      </div>
    </Link>
  )
}
