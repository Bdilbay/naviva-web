'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trash2, Plus, Ship, AlertCircle } from 'lucide-react'

interface Boat {
  id: string
  name: string
  boat_type?: string
  created_at: string
}

export default function MyBoatsPage() {
  const router = useRouter()
  const [boats, setBoats] = useState<Boat[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/giris?redirect=/benim-teknelerim')
        return
      }

      setUserId(session.user.id)
      fetchBoats(session.user.id)
    }

    checkAuth()
  }, [router])

  const fetchBoats = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('boats')
        .select('id, name, boat_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setBoats(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching boats:', error)
      setLoading(false)
    }
  }

  const handleDeleteBoat = async (boatId: string) => {
    if (!confirm('Bu tekneyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setDeletingId(boatId)
    try {
      const { error } = await supabase
        .from('boats')
        .delete()
        .eq('id', boatId)
        .eq('user_id', userId)

      if (error) throw error

      setBoats(boats.filter(b => b.id !== boatId))
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting boat:', error)
      alert('Tekne silinirken hata oluştu')
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Ship size={32} className="text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Benim Teknelerim</h1>
            </div>
            <button
              onClick={() => router.push('/add-boat')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Tekne Ekle
            </button>
          </div>
          <p className="text-slate-400">Sahip olduğunuz tekneleri yönetin</p>
        </div>

        {/* Boats Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : boats.length === 0 ? (
          <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center">
            <Ship size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Henüz tekne eklenmedi</h3>
            <p className="text-slate-400 mb-6">Eğlenceli deniz deneyimleri için ilk teknenizi ekleyin</p>
            <button
              onClick={() => router.push('/add-boat')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              İlk Tekneyi Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boats.map(boat => (
              <div
                key={boat.id}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{boat.name}</h3>
                    {boat.boat_type && (
                      <p className="text-sm text-slate-400">{boat.boat_type}</p>
                    )}
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <Ship size={24} className="text-blue-400" />
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-6">
                  Oluşturma: {new Date(boat.created_at).toLocaleDateString('tr-TR')}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/boats/${boat.id}`)}
                    className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors text-sm"
                  >
                    Detay
                  </button>
                  <button
                    onClick={() => handleDeleteBoat(boat.id)}
                    disabled={deletingId === boat.id}
                    className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deletingId === boat.id ? (
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
            ))}
          </div>
        )}

        {/* Info Banner */}
        {boats.length > 0 && (
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300">
                <strong>Bilgi:</strong> Bir tekneyi silmek tüm ilişkili logları, alarmları ve seyir günlüğünü silecektir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
