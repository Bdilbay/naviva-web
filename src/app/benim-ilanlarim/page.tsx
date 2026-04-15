'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trash2, Edit2, Plus, ShoppingCart, AlertCircle, Eye, EyeOff, Check } from 'lucide-react'

interface Listing {
  id: string
  title: string
  description: string
  category: string
  status: string
  price?: number
  created_at: string
}

export default function MyListingsPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/giris?redirect=/benim-ilanlarim')
        return
      }

      setUserId(session.user.id)
      fetchListings(session.user.id)
    }

    checkAuth()
  }, [router])

  const fetchListings = async (userId: string) => {
    try {
      console.log('Fetching listings for user:', userId)
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('id, title, description, category, status, price, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      console.log('Listings response:', { data, fetchError })

      if (fetchError) {
        throw new Error(`Supabase error: ${fetchError.message}`)
      }

      setListings(data || [])
      setError('')
      setLoading(false)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      console.error('Error fetching listings:', errorMsg)
      setError(errorMsg)
      setListings([])
      setLoading(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setDeletingId(listingId)
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', userId)

      if (error) throw error

      setListings(listings.filter(l => l.id !== listingId))
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('İlan silinirken hata oluştu')
      setDeletingId(null)
    }
  }

  const handleToggleVisibility = async (listingId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', listingId)
        .eq('user_id', userId)

      if (error) throw error

      setListings(listings.map(l =>
        l.id === listingId ? { ...l, status: newStatus } : l
      ))

      // Show success modal
      setSuccessMessage(newStatus === 'inactive' ? 'Gizlendi' : 'Yayında')
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 2000)
    } catch (error) {
      console.error('Error updating listing:', error)
      alert('İlan güncellenirken hata oluştu')
    }
  }

  const filteredListings = listings.filter(listing => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'active') return listing.status === 'active'
    if (filterStatus === 'inactive') return listing.status !== 'active'
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8" style={{ paddingTop: "104px" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingCart size={32} className="text-orange-400" />
              <h1 className="text-4xl font-bold text-white">Benim İlanlarım</h1>
            </div>
            <button
              onClick={() => router.push('/market/yeni')}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Yeni İlan
            </button>
          </div>
          <p className="text-slate-400">Hizmetlerinize yönelik ilanları yönetin ve düzenleyin</p>
        </div>

        {/* Filter Tabs */}
        {listings.length > 0 && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Tümü ({listings.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Aktif ({listings.filter(l => l.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              İnaktif ({listings.filter(l => l.status !== 'active').length})
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">Hata: {error}</p>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center">
            <ShoppingCart size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Henüz ilan eklenmedi</h3>
            <p className="text-slate-400 mb-6">
              {filterStatus === 'all'
                ? 'Hizmetlerinizi tanıtmak için ilk ilanınızı ekleyin'
                : filterStatus === 'active'
                ? 'Aktif ilanınız bulunmamaktadır'
                : 'İnaktif ilanınız bulunmamaktadır'}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={() => router.push('/market/yeni')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                İlk İlanı Ekle
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map(listing => (
              <div
                key={listing.id}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Listing Info */}
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-semibold text-white mb-2">{listing.title}</h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{listing.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">
                        <strong>Kategori:</strong> {listing.category}
                      </span>
                      {listing.price && (
                        <span className="text-orange-400 font-semibold">
                          ₺{listing.price.toLocaleString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-slate-700/50 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Durum</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block border ${
                        listing.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {listing.status === 'active' ? 'Aktif' : 'İnaktif'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-3">
                      Oluşturma: {new Date(listing.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-start lg:justify-between">
                    <button
                      onClick={() => router.push(`/listings/${listing.id}/edit`)}
                      className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Düzenle
                    </button>

                    <button
                      onClick={() => handleToggleVisibility(listing.id, listing.status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2 ${
                        listing.status === 'active'
                          ? 'bg-orange-600/20 text-orange-400 hover:bg-orange-600/30'
                          : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      }`}
                    >
                      {listing.status === 'active' ? (
                        <>
                          <EyeOff size={16} />
                          Gizle
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          Göster
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      disabled={deletingId === listing.id}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deletingId === listing.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          Siliniyor...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Sil
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        {listings.length > 0 && (
          <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-orange-300">
                <strong>İpucu:</strong> İlanlarınızı deaktif ederek kaldırabilir, daha sonra yeniden aktif edebilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-fade-in">
              <div
                onClick={() => setShowSuccessModal(false)}
                className="bg-slate-800/95 border border-orange-500/30 rounded-2xl p-8 w-80 text-center cursor-pointer hover:border-orange-500/50 transition-all shadow-2xl"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-orange-500/20 rounded-full p-4 animate-scale-in">
                    <Check size={48} className="text-orange-400" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-white mb-2">{successMessage}</p>
                <p className="text-sm text-slate-400">Kapatmak için tıklayın</p>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          .animate-scale-in { animation: scaleIn 0.4s ease-out; }
        `}</style>
      </div>
    </div>
  )
}
