'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Trash2, Plus, Ship, AlertCircle, Edit2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Boat {
  id: string
  name: string
  type?: string
  image_url?: string
  created_at: string
}

export default function MyBoatsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [boats, setBoats] = useState<Boat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
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
      console.log('Fetching boats for user:', userId)

      // Test: Tüm boats'ı getir (RLS test için)
      const { data, error: fetchError } = await supabase
        .from('boats')
        .select('*')

      console.log('All boats test:', { data, fetchError })

      // Eğer çalışırsa, user'ın boats'ını getir
      if (!fetchError) {
        const { data: userBoats, error: userError } = await supabase
          .from('boats')
          .select('id, name, type, image_url, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        console.log('User boats response:', { userBoats, userError })

        if (userError) {
          throw new Error(`User boats error: ${userError.message}`)
        }

        setBoats(userBoats || [])
        setError('')
      } else {
        throw new Error(`Fetch all boats error: ${fetchError.message}`)
      }

      setLoading(false)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      console.error('Error fetching boats:', errorMsg)
      setError(errorMsg)
      setBoats([])
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
      alert(t.boats.deleteError)
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8" style={{ paddingTop: "104px" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Ship size={32} className="text-blue-400" />
              <h1 className="text-4xl font-bold text-white">{t.boats.title}</h1>
            </div>
            <button
              onClick={() => router.push('/benim-teknelerim/yeni')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              {t.boats.addButton}
            </button>
          </div>
          <p className="text-slate-400">{t.boats.subtitle}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{t.boats.errorPrefix} {error}</p>
          </div>
        )}

        {/* Boats Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">{t.boats.loading}</p>
          </div>
        ) : boats.length === 0 ? (
          <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center">
            <Ship size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">{t.boats.emptyTitle}</h3>
            <p className="text-slate-400 mb-6">{t.boats.emptyText}</p>
            <button
              onClick={() => router.push('/benim-teknelerim/yeni')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              {t.boats.addFirstButton}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boats.map(boat => (
              <div
                key={boat.id}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-colors group"
              >
                {/* Boat Image */}
                <div className="relative w-full h-48 bg-slate-700">
                  {boat.image_url ? (
                    <Image
                      src={boat.image_url}
                      alt={boat.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Ship size={64} className="text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{boat.name}</h3>
                      {boat.type && (
                        <p className="text-sm text-slate-400">{boat.type}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-6">
                    {t.boats.createdDate} {new Date(boat.created_at).toLocaleDateString('tr-TR')}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/benim-teknelerim/${boat.id}`)}
                      className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors text-sm"
                    >
                      {t.boats.detailButton}
                    </button>
                    <button
                      onClick={() => router.push(`/benim-teknelerim/${boat.id}/edit`)}
                      className="flex-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      {t.boats.editButton}
                    </button>
                    <button
                      onClick={() => handleDeleteBoat(boat.id)}
                      disabled={deletingId === boat.id}
                      className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deletingId === boat.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          {t.boats.deletingButton}
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          {t.boats.deleteButton}
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
        {boats.length > 0 && (
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300">
                <strong>{t.boats.infoTitle}</strong> {t.boats.infoText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
