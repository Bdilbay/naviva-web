'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Announcement {
  id: string
  title: string
  content?: string
  category: string
  is_active: boolean
  link_url?: string
  created_at: string
}

export default function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [announcements.length])

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error) {
        setAnnouncements(data || [])
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || announcements.length === 0) {
    return null
  }

  const current = announcements[currentIndex]
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      adb: 'from-orange-600 to-orange-700',
      weather: 'from-blue-600 to-blue-700',
      general: 'from-slate-600 to-slate-700',
    }
    return colors[category] || 'from-slate-600 to-slate-700'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      adb: 'ADB/Denizcilik',
      weather: 'Hava Durumu',
      general: 'Genel',
    }
    return labels[category] || category
  }

  return (
    <div className={`relative bg-gradient-to-r ${getCategoryColor(current.category)} rounded-xl p-6 mb-12 overflow-hidden group`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white/80">{getCategoryLabel(current.category)}</span>
          </div>
          <span className="text-xs font-medium text-white/60 bg-black/20 px-2 py-1 rounded">
            {currentIndex + 1} / {announcements.length}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">{current.title}</h3>
          {current.content && (
            <p className="text-white/90 text-sm line-clamp-2">{current.content}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <Link
            href="/duyurular"
            className="inline-flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Tümünü Gör
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
