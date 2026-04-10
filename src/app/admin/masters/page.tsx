'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Trash2, Shield, AlertCircle, Award } from 'lucide-react'

interface MasterProfile {
  id: string
  user_id: string
  user_email: string
  title: string
  category: string
  location: string
  rating: number
  review_count: number
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export default function MastersPage() {
  const [masters, setMasters] = useState<MasterProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all')

  useEffect(() => {
    fetchMasters()
  }, [filterVerified])

  const fetchMasters = async () => {
    try {
      const response = await fetch('/api/admin/get-masters')

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch masters')
      }

      setMasters(result.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching masters:', error)
      setLoading(false)
    }
  }

  const handleVerifyMaster = async (masterId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('master_profiles')
        .update({ is_verified: !isVerified })
        .eq('id', masterId)

      if (error) throw error

      setMasters(masters.map(m =>
        m.id === masterId ? { ...m, is_verified: !m.is_verified } : m
      ))
    } catch (error) {
      console.error('Error updating master:', error)
      alert('Usta güncellenirken hata oluştu')
    }
  }

  const handleToggleActive = async (masterId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('master_profiles')
        .update({ is_active: !isActive })
        .eq('id', masterId)

      if (error) throw error

      setMasters(masters.map(m =>
        m.id === masterId ? { ...m, is_active: !m.is_active } : m
      ))
    } catch (error) {
      console.error('Error updating master:', error)
      alert('Usta güncellenirken hata oluştu')
    }
  }

  const handleDeleteMaster = async (masterId: string) => {
    if (!confirm('Bu usta profilini KALICI olarak silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('master_profiles')
        .delete()
        .eq('id', masterId)

      if (error) throw error

      setMasters(masters.filter(m => m.id !== masterId))
    } catch (error) {
      console.error('Error deleting master:', error)
      alert('Usta silinirken hata oluştu')
    }
  }

  const filteredMasters = masters.filter(master =>
    master.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    master.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    master.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Award size={28} className="text-green-400" />
          <h1 className="text-3xl font-bold text-white">Usta Profilleri</h1>
        </div>
        <p className="text-slate-400">Platformdaki tüm usta profillerini yönetin ve doğrulayın</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Usta, hizmet veya kategori ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
          />
        </div>

        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value as any)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
        >
          <option value="all">Tüm Ustalar</option>
          <option value="verified">Doğrulanmış</option>
          <option value="unverified">Doğrulanmamış</option>
        </select>
      </div>

      {/* Masters Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredMasters.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
            <p className="text-slate-400">Usta bulunamadı</p>
          </div>
        ) : (
          filteredMasters.map(master => (
            <div
              key={master.id}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Master Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{master.title}</h3>
                      <p className="text-sm text-slate-400">{master.user_email}</p>
                    </div>
                    {master.is_verified && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium flex items-center gap-1">
                        <Shield size={12} />
                        Doğrulı
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="text-slate-400">
                      <strong>Kategori:</strong> {master.category}
                    </span>
                    <span className="text-slate-400">
                      <strong>Konum:</strong> {master.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-yellow-400 font-medium">
                      ⭐ {master.rating.toFixed(1)} / 5.0
                    </span>
                    <span className="text-slate-400 text-sm">
                      ({master.review_count} değerlendirme)
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-slate-700/50 rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Durum</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block border ${
                      master.is_active
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {master.is_active ? 'Aktif' : 'İnaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Katılım: {new Date(master.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-start lg:justify-between">
                  <button
                    onClick={() => handleVerifyMaster(master.id, master.is_verified)}
                    disabled={master.is_verified}
                    className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                      master.is_verified
                        ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-green-600/30 text-green-400 hover:bg-green-600/50 cursor-pointer'
                    }`}
                  >
                    <Shield size={14} />
                    Doğrula
                  </button>

                  <button
                    onClick={() => handleVerifyMaster(master.id, master.is_verified)}
                    disabled={!master.is_verified}
                    className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                      master.is_verified
                        ? 'bg-red-600/30 text-red-400 hover:bg-red-600/50 cursor-pointer'
                        : 'bg-slate-700/30 text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <AlertCircle size={14} />
                    Doğr. Kaldır
                  </button>

                  <button
                    onClick={() => handleToggleActive(master.id, master.is_active)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      master.is_active
                        ? 'bg-orange-600/30 text-orange-400 hover:bg-orange-600/50'
                        : 'bg-green-600/30 text-green-400 hover:bg-green-600/50'
                    }`}
                  >
                    {master.is_active ? 'Deaktif Et' : 'Aktif Et'}
                  </button>

                  <button
                    onClick={() => handleDeleteMaster(master.id)}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-red-600/30 text-red-400 hover:bg-red-600/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 size={14} />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
