'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Announcement {
  id: string
  title: string
  content?: string
  category: string
  is_active: boolean
  image_url?: string
  link_url?: string
  created_at: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchAnnouncements()
  }, [selectedCategory])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching announcements:', error)
        setAnnouncements([])
      } else {
        setAnnouncements(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      adb: 'ADB/Denizcilik',
      weather: 'Hava Durumu',
      general: 'Genel',
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      adb: 'bg-orange-100 text-orange-800',
      weather: 'bg-blue-100 text-blue-800',
      general: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const categories = ['all', 'adb', 'weather']

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfa
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Duyurular</h1>
          <p className="text-slate-400">Tüm denizcilik ve hava durumu duyurularını burada bulabilirsiniz.</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat === 'all' ? 'Tümü' : getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-orange-500 rounded-full"></div>
            </div>
            <p className="text-slate-400 mt-4">Duyurular yükleniyor...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Henüz duyuru bulunmamaktadır.</p>
          </div>
        )}

        {/* Announcements List */}
        {!loading && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-orange-500/50 transition-colors"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{announcement.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(announcement.category)}`}>
                          {getCategoryLabel(announcement.category)}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(announcement.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  {announcement.content && (
                    <p className="text-slate-300 mb-4 leading-relaxed">{announcement.content}</p>
                  )}

                  {/* Image */}
                  {announcement.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden max-h-96">
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Link */}
                  {announcement.link_url && (
                    <a
                      href={announcement.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium transition-colors mt-4"
                    >
                      Daha Fazla Bilgi
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
