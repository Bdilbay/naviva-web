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

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const amount = 336 // card width + gap
      containerRef.current.scrollLeft += direction === 'left' ? -amount : amount
    }
  }

  if (masters.length === 0) return null

  return (
    <div className="relative flex items-center gap-4">
      {/* Left Arrow Button */}
      <button
        onClick={() => scroll('left')}
        className="flex-shrink-0 p-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white shadow-lg transition-colors text-2xl font-bold leading-none h-12 w-12 flex items-center justify-center"
        title="Önceki"
      >
        &lt;
      </button>

      {/* Carousel Container */}
      <div
        className="flex-1 overflow-hidden rounded-lg"
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

      {/* Right Arrow Button */}
      <button
        onClick={() => scroll('right')}
        className="flex-shrink-0 p-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white shadow-lg transition-colors text-2xl font-bold leading-none h-12 w-12 flex items-center justify-center"
        title="Sonraki"
      >
        &gt;
      </button>
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
      className="flex-shrink-0 w-80 h-80 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/70 to-slate-800/40 hover:border-orange-500/50 hover:from-slate-800/90 hover:to-slate-800/60 transition-all p-6 flex flex-col items-center justify-between shadow-lg hover:shadow-orange-500/20"
    >
      {/* Avatar - Centered */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/40 overflow-hidden flex items-center justify-center flex-shrink-0">
        {master.photo_url ? (
          <Image
            src={master.photo_url}
            alt={master.name || t.home.masterPhotoAlt}
            width={96}
            height={96}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <Users className="w-10 h-10 text-orange-400" />
        )}
      </div>

      {/* Name + Title */}
      <div className="text-center mt-4 flex-1 flex flex-col justify-center">
        <p className="text-white font-bold text-base leading-tight truncate max-w-full px-2">
          {master.name}
        </p>
        <p className="text-slate-400 text-xs mt-1 line-clamp-2">
          {master.title ?? t.home.defaultTitle}
        </p>
      </div>

      {/* Location */}
      {master.city && (
        <p className="text-slate-400 text-xs flex items-center justify-center gap-1.5 mt-2">
          <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <span className="truncate">{master.city}</span>
        </p>
      )}

      {/* Categories - Bottom */}
      {master.categories && master.categories.length > 0 && (
        <p className="text-slate-400 text-xs text-center mt-2 line-clamp-2 px-2">
          {master.categories.slice(0, 2).join(', ')}
        </p>
      )}

      {/* Rating Info */}
      <div className="w-full mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(master.avg_rating ?? 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="text-amber-400 font-bold text-xs">
            {(master.avg_rating ?? 0).toFixed(1)}
          </span>
          {master.review_count && master.review_count > 0 && (
            <span className="text-slate-500 text-xs ml-1">
              ({master.review_count})
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
