'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Trash2, Eye, EyeOff, MapPin, Star } from 'lucide-react'

interface Listing {
  id: string
  title: string
  description: string
  category: string
  location: string
  rating?: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  master_email: string
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchListings()
  }, [filterStatus])

  const fetchListings = async () => {
    try {
      let query = supabase
        .from('listings')
        .select('id, title, description, category, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      const { data, error } = await query

      if (error) throw error

      const formattedListings = data?.map((listing: any) => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        location: listing.category, // Using category as location placeholder
        rating: 0,
        is_featured: false,
        is_active: true,
        created_at: listing.created_at,
        master_email: 'Unknown',
      })) || []

      setListings(formattedListings)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching listings:', error)
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (listingId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('master_profiles')
        .update({ is_active: !isActive })
        .eq('id', listingId)

      if (error) throw error

      setListings(listings.map(l =>
        l.id === listingId ? { ...l, is_active: !l.is_active } : l
      ))
    } catch (error) {
      console.error('Error updating listing:', error)
      alert('İlan güncellenirken hata oluştu')
    }
  }

  const handleToggleFeatured = async (listingId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('master_profiles')
        .update({ is_featured: !isFeatured })
        .eq('id', listingId)

      if (error) throw error

      setListings(listings.map(l =>
        l.id === listingId ? { ...l, is_featured: !l.is_featured } : l
      ))
    } catch (error) {
      console.error('Error updating listing:', error)
      alert('İlan güncellenirken hata oluştu')
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Bu ilanı KALICI olarak silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('master_profiles')
        .delete()
        .eq('id', listingId)

      if (error) throw error

      setListings(listings.filter(l => l.id !== listingId))
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('İlan silinirken hata oluştu')
    }
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.master_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MapPin size={28} className="text-orange-400" />
          <h1 className="text-3xl font-bold text-white">İlanlar</h1>
        </div>
        <p className="text-slate-400">Platformdaki tüm usta ilanlarını yönetin</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Başlık, konum veya usta ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
        >
          <option value="all">Tüm İlanlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">İnaktif</option>
        </select>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
            <p className="text-slate-400">İlan bulunamadı</p>
          </div>
        ) : (
          filteredListings.map(listing => (
            <div
              key={listing.id}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Listing Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                    {listing.is_featured && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star size={12} />
                        Öne Çıkan
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{listing.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      <strong>Kategori:</strong> {listing.category}
                    </span>
                    <span className="text-slate-400">
                      <strong>Konum:</strong> {listing.location}
                    </span>
                    {listing.rating && (
                      <span className="text-yellow-400">
                        <strong>⭐</strong> {listing.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-3">
                    Usta: {listing.master_email}
                  </p>
                </div>

                {/* Stats */}
                <div className="bg-slate-700/50 rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Durum</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                      listing.is_active
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {listing.is_active ? 'Aktif' : 'İnaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Oluşturma: {new Date(listing.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-start lg:justify-between">
                  <button
                    onClick={() => handleToggleVisibility(listing.id, listing.is_active)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      listing.is_active
                        ? 'bg-orange-600/30 text-orange-400 hover:bg-orange-600/50'
                        : 'bg-green-600/30 text-green-400 hover:bg-green-600/50'
                    }`}
                  >
                    {listing.is_active ? (
                      <>
                        <EyeOff size={14} />
                        Gizle
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        Göster
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(listing.id, listing.is_featured)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      listing.is_featured
                        ? 'bg-yellow-600/30 text-yellow-400 hover:bg-yellow-600/50'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Star size={14} />
                    {listing.is_featured ? 'Kaldır' : 'Öne Çık'}
                  </button>

                  <button
                    onClick={() => handleDeleteListing(listing.id)}
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
