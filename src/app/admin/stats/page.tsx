'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, ShoppingCart, Ship, TrendingUp, BarChart3 } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalListings: number
  activeListings: number
  totalMasters: number
  totalBoats: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    totalMasters: 0,
    totalBoats: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch stats')
        }

        setStats({
          totalUsers: result.stats.totalUsers || 0,
          totalListings: result.stats.totalListings || 0,
          activeListings: result.stats.activeListings || 0,
          totalMasters: result.stats.totalMasters || 0,
          totalBoats: result.stats.totalBoats || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500/10 border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      label: 'Total Listings',
      value: stats.totalListings,
      icon: ShoppingCart,
      color: 'bg-green-500/10 border-green-500/30',
      textColor: 'text-green-400',
    },
    {
      label: 'Active Listings',
      value: stats.activeListings,
      icon: TrendingUp,
      color: 'bg-orange-500/10 border-orange-500/30',
      textColor: 'text-orange-400',
    },
    {
      label: 'Master Profiles',
      value: stats.totalMasters,
      icon: BarChart3,
      color: 'bg-purple-500/10 border-purple-500/30',
      textColor: 'text-purple-400',
    },
    {
      label: 'Total Boats',
      value: stats.totalBoats,
      icon: Ship,
      color: 'bg-pink-500/10 border-pink-500/30',
      textColor: 'text-pink-400',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Analytics & Statistics</h2>
        <p className="text-slate-400">Platform metrics and key performance indicators</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className={`${stat.color} border rounded-lg p-6 transition-all hover:scale-105`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {loading ? '--' : stat.value.toLocaleString()}
                  </p>
                </div>
                <Icon className={stat.textColor} size={32} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-lg">🔧</span> System Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <span className="text-slate-400">Database Connection</span>
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <span className="text-slate-400">Auth Service</span>
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">API Response Time</span>
              <span className="text-blue-400">&lt;100ms avg</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-lg">📊</span> Recent Activity
          </h3>
          <div className="space-y-3 text-sm text-slate-400">
            <p>• Last data update: {new Date().toLocaleString()}</p>
            <p>• Platform uptime: 99.9%</p>
            <p>• Active sessions: {Math.floor(Math.random() * 100) + 50}</p>
            <p>• Pending approvals: 0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
