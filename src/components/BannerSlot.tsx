'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface Banner {
  id: string
  title: string
  image_url: string | null
  link_url: string | null
  position: string
  width: number | null
  height: number | null
  is_active: boolean
}

export default function BannerSlot({
  position,
  className = '',
  isAdmin = false
}: {
  position: string
  className?: string
  isAdmin?: boolean
}) {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const now = new Date().toISOString()
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('position', position)
          .eq('is_active', true)
          .or(`starts_at.is.null,starts_at.lte.${now}`)
          .or(`ends_at.is.null,ends_at.gte.${now}`)
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Banner fetch error:', error)
        }

        if (data) {
          setBanner(data as Banner)
        }
      } catch (err) {
        console.error('Unexpected error fetching banner:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [position])

  if (loading) {
    return null
  }

  // Show banner if exists
  if (banner) {
    // Use banner dimensions if provided, otherwise use defaults
    const containerStyle = {
      width: banner.width ? `${banner.width}px` : undefined,
      height: banner.height ? `${banner.height}px` : undefined,
    }

    const content = (
      <div
        className={`flex items-center justify-center overflow-hidden rounded-lg ${className}`}
        style={containerStyle}
      >
        {banner.image_url ? (
          <Image
            src={banner.image_url}
            alt={banner.title}
            width={banner.width || 800}
            height={banner.height || 400}
            className="w-full h-full object-cover"
            loading="eager"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-center p-6">
            <h3 className="text-white font-semibold text-center">{banner.title}</h3>
          </div>
        )}
      </div>
    )

    if (banner.link_url) {
      return (
        <Link href={banner.link_url} className="block">
          {content}
        </Link>
      )
    }

    return <div className="block">{content}</div>
  }

  // Show placeholder only for admins when no banner exists
  if (isAdmin) {
    return (
      <div className={`border-2 border-dashed border-slate-600 rounded-lg p-8 flex items-center justify-center ${className}`}>
        <p className="text-slate-400 text-sm text-center">
          📌 Reklam Alanı: <span className="font-semibold">{position}</span>
        </p>
      </div>
    )
  }

  return null
}
