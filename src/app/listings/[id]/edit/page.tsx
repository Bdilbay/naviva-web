'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

interface EditFormData {
  title: string
  description: string
  category: string
  price?: number
  status: string
}

const CATEGORIES = [
  'Elektrikçi',
  'Tesisatçı',
  'Boyacı',
  'Marangoz',
  'Cam Ustası',
  'Dış Cephe',
  'Çatı Ustası',
  'Diğer',
]

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    status: 'active',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const checkAuthAndFetchListing = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/giris')
        return
      }

      setUserId(session.user.id)

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id, title, description, category, price, status')
          .eq('id', listingId)
          .eq('user_id', session.user.id)
          .single()

        if (error) throw error

        if (data) {
          setFormData({
            title: data.title,
            description: data.description,
            category: data.category,
            price: data.price || 0,
            status: data.status,
          })
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching listing:', error)
        alert('İlan yüklenirken hata oluştu')
        router.push('/benim-ilanlarim')
      }
    }

    checkAuthAndFetchListing()
  }, [listingId, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      alert('Tüm zorunlu alanları doldurunuz')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: formData.price || null,
          status: formData.status,
        })
        .eq('id', listingId)
        .eq('user_id', userId)

      if (error) throw error

      alert('İlan başarıyla güncellendi')
      router.push('/benim-ilanlarim')
    } catch (error) {
      console.error('Error saving listing:', error)
      alert('İlan kaydedilirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', userId)

      if (error) throw error

      alert('İlan başarıyla silindi')
      router.push('/benim-ilanlarim')
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('İlan silinirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-slate-400">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push('/benim-ilanlarim')}
          className="flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">İlanı Düzenle</h1>
          <p className="text-slate-400">Hizmet ilanı bilgilerini güncelleyin</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Title */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-2">
              İlan Başlığı <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ör: Profesyonel Elektrikçi"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Description */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Açıklama <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Hizmetinizi detaylı olarak açıklayın..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Kategori <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">Kategori Seçiniz</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Fiyat (TL) <span className="text-slate-400 text-xs font-normal">(İsteğe bağlı)</span>
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ör: 500"
                min="0"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Durum
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="active">Aktif</option>
              <option value="inactive">İnaktif</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Kaydet
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 size={20} />
              Sil
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
