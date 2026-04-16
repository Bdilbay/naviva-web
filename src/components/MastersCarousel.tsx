'use client'

import { useEffect, useRef, useState } from 'react'
import { MasterProfile } from '@/types'
import type { Translations } from '@/lib/i18n'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Users, ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react'

interface MastersCarouselProps {
  masters: MasterProfile[]
  t: Translations
}

export default function MastersCarousel({ masters, t }: MastersCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedMaster, setSelectedMaster] = useState<MasterProfile | null>(masters[0] || null)

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
    <div className="space-y-6">
      {/* Carousel */}
      <div
        className="overflow-hidden rounded-lg relative group"
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
            <MasterCardItem
              key={`${master.id}-${idx}`}
              master={master}
              t={t}
              isSelected={selectedMaster?.id === master.id}
              onSelect={setSelectedMaster}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-orange-500/90 hover:bg-orange-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Önceki"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-orange-500/90 hover:bg-orange-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Sonraki"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Master Details Below Carousel */}
      {selectedMaster && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">{selectedMaster.name}</h3>

              {/* Rating & Review Count */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(selectedMaster.avg_rating ?? 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-amber-400 font-bold text-sm">
                  {(selectedMaster.avg_rating ?? 0).toFixed(1)}
                </span>
                {selectedMaster.review_count && selectedMaster.review_count > 0 && (
                  <span className="text-slate-400 text-sm">
                    ({selectedMaster.review_count} {selectedMaster.review_count === 1 ? 'yorum' : 'yorum'})
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {selectedMaster.phone && (
                  <a href={`tel:${selectedMaster.phone}`} className="flex items-center gap-2 text-green-400 text-sm hover:text-green-300 transition-colors">
                    <Phone className="w-4 h-4" />
                    {selectedMaster.phone}
                  </a>
                )}
                {selectedMaster.email && (
                  <a href={`mailto:${selectedMaster.email}`} className="flex items-center gap-2 text-blue-400 text-sm hover:text-blue-300 transition-colors">
                    <Mail className="w-4 h-4" />
                    {selectedMaster.email}
                  </a>
                )}
              </div>
            </div>

            {/* Profile Link */}
            <Link
              href={`/ustalar/${selectedMaster.id}`}
              className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm flex-shrink-0"
            >
              Profili Gör
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function MasterCardItem({
  master,
  t,
  isSelected,
  onSelect,
}: {
  master: MasterProfile
  t: Translations
  isSelected: boolean
  onSelect: (master: MasterProfile) => void
}) {
  return (
    <button
      onClick={() => onSelect(master)}
      className={`flex-shrink-0 w-80 h-80 rounded-2xl border-2 transition-all p-6 flex flex-col items-center justify-between shadow-lg ${
        isSelected
          ? 'border-orange-500/80 bg-gradient-to-br from-slate-800/90 to-slate-800/70 shadow-orange-500/30'
          : 'border-slate-700/60 bg-gradient-to-br from-slate-800/70 to-slate-800/40 hover:border-orange-500/50 hover:from-slate-800/80 hover:to-slate-800/60 hover:shadow-orange-500/20'
      }`}
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
    </button>
  )
}
