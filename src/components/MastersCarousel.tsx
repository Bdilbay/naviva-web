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
    const cardWidth = 256 + 16 // w-64 + gap
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
      className="flex-shrink-0 w-64 rounded-2xl border border-slate-700/60 bg-slate-800/50 hover:border-orange-500/40 hover:bg-slate-800 transition-all p-5 flex flex-col h-fit"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-orange-500/15 border border-orange-500/30 overflow-hidden flex items-center justify-center flex-shrink-0">
          {master.photo_url ? (
            <Image
              src={master.photo_url}
              alt={master.full_name || t.home.masterPhotoAlt}
              width={44}
              height={44}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <Users className="w-4 h-4 text-orange-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-slate-100 font-semibold text-sm truncate">
            {master.full_name}
          </p>
          <p className="text-slate-500 text-xs truncate">
            {master.title ?? t.home.defaultTitle}
          </p>
        </div>
      </div>

      {master.location_city && (
        <p className="text-slate-500 text-xs flex items-center gap-1 mb-2 truncate">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{master.location_city}</span>
        </p>
      )}

      {master.experience_years && (
        <p className="text-slate-500 text-xs flex items-center gap-1 mb-3">
          <Star className="w-3 h-3 text-orange-400 flex-shrink-0" />
          {master.experience_years} {t.home.yearsExp}
        </p>
      )}

      {master.avg_rating && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(master.avg_rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="text-amber-400 text-xs font-semibold">
            {master.avg_rating.toFixed(1)}
          </span>
        </div>
      )}
    </Link>
  )
}
