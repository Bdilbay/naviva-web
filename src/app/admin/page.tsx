'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BarChart3, Database, TrendingUp, Users, ShoppingCart, AlertCircle, Activity, MessageSquare, Flag } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeListings: number
  totalMasters: number
  totalBoats: number
  totalMessages: number
  pendingReports: number
  blockedWords: number
  conversations: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeListings: 0,
    totalMasters: 0,
    totalBoats: 0,
    totalMessages: 0,
    pendingReports: 0,
    blockedWords: 0,
    conversations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Use server-side API to fetch stats
      const response = await fetch('/api/admin/stats')

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stats')
      }

      setStats(result.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const mainCards = [
    {
      title: 'Toplam Kullanıcılar',
      value: stats.totalUsers,
      change: 'Platform Üyeleri',
      icon: Users,
      color: 'from-blue-600 to-blue-400',
      lightColor: 'bg-blue-500/10',
      href: '/admin/users',
    },
    {
      title: 'Aktif İlanlar',
      value: stats.activeListings,
      change: 'Web Platform',
      icon: ShoppingCart,
      color: 'from-orange-600 to-orange-400',
      lightColor: 'bg-orange-500/10',
      href: '/admin/listings',
    },
    {
      title: 'Usta Profilleri',
      value: stats.totalMasters,
      change: 'Hizmet Sağlayıcılar',
      icon: Database,
      color: 'from-green-600 to-green-400',
      lightColor: 'bg-green-500/10',
      href: '/admin/masters',
    },
    {
      title: 'Tekneler',
      value: stats.totalBoats,
      change: 'Mobil Uygulama',
      icon: Activity,
      color: 'from-purple-600 to-purple-400',
      lightColor: 'bg-purple-500/10',
      href: '/admin/mobile-data',
    },
    {
      title: 'Konuşmalar',
      value: stats.conversations,
      change: 'Kullanıcı Mesajları',
      icon: MessageSquare,
      color: 'from-pink-600 to-pink-400',
      lightColor: 'bg-pink-500/10',
      href: '/admin/messages',
    },
    {
      title: 'Beklemede Raporlar',
      value: stats.pendingReports,
      change: 'Denetim Gereken',
      icon: Flag,
      color: 'from-red-600 to-red-400',
      lightColor: 'bg-red-500/10',
      href: '/admin/moderation',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Platform yönetim ve analitik merkezi</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mainCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <button
                key={idx}
                onClick={() => router.push(card.href)}
                className={`bg-gradient-to-br ${card.color} p-0.5 rounded-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer`}
              >
                <div className="bg-slate-800 rounded-2xl p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-left">
                      <p className="text-slate-400 text-sm mb-2">{card.title}</p>
                      <p className="text-3xl font-bold text-white">{loading ? '--' : card.value}</p>
                    </div>
                    <div className={`${card.lightColor} p-3 rounded-xl`}>
                      <Icon className="text-white" size={24} />
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">{card.change}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Mobile App Management */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mobil Uygulama</h2>
                <p className="text-slate-400 text-sm">Tekne ve kullanıcı verileri</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/admin/mobile-data"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all group"
              >
                <span className="text-slate-300 group-hover:text-white">Kullanıcılar & Tekneler</span>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </Link>
              <Link
                href="/admin/mobile-data?tab=logs"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all group"
              >
                <span className="text-slate-300 group-hover:text-white">Tekne Logları</span>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </Link>
              <Link
                href="/admin/mobile-data?tab=alerts"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all group"
              >
                <span className="text-slate-300 group-hover:text-white">Alarmlar</span>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </Link>
            </div>
          </div>

          {/* Web Platform Management */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-500/10 p-3 rounded-lg">
                <span className="text-2xl">🌐</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Web Platformu</h2>
                <p className="text-slate-400 text-sm">İlanlar ve pazar yönetimi</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/admin/web-data"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-orange-500/50 hover:bg-slate-700/50 transition-all group"
              >
                <span className="text-slate-300 group-hover:text-white">İlanlar</span>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </Link>
              <Link
                href="/admin/masters"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-orange-500/50 hover:bg-slate-700/50 transition-all group"
              >
                <span className="text-slate-300 group-hover:text-white">Usta Profilleri</span>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </Link>
              <Link
                href="/admin/web-data?tab=reviews"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-orange-500/50 hover:bg-slate-700/50 transition-all group"
              >
                <span className="text-slate-300 group-hover:text-white">Yorumlar</span>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </Link>
            </div>
          </div>

          {/* Messaging & Moderation Management */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-pink-500/10 p-3 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mesajlaşma & Denetim</h2>
                <p className="text-slate-400 text-sm">İçerik kontrolü ve moderation</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/admin/messages"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-pink-500/50 hover:bg-slate-700/50 transition-all group"
              >
                <span className="text-slate-300 group-hover:text-white">
                  Konuşmalar ({stats.conversations})
                </span>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </Link>
              <Link
                href="/admin/moderation"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-pink-500/50 hover:bg-slate-700/50 transition-all group"
              >
                <span className="text-slate-300 group-hover:text-white">
                  Denetim ({stats.pendingReports} beklemede)
                </span>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-pink-500/50 hover:bg-slate-700/50 transition-all group"
              >
                <span className="text-slate-300 group-hover:text-white">
                  Kullanıcılar ({stats.totalUsers})
                </span>
                <span className="text-slate-500 group-hover:text-slate-300">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <BarChart3 className="text-green-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Analitikler</h2>
                <p className="text-slate-400 text-sm">Platform performans ve metrikleri</p>
              </div>
            </div>
            <Link
              href="/admin/stats"
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg font-medium transition-all"
            >
              Detayları Göster
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
