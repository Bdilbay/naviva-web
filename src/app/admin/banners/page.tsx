'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Banner {
  id: string
  title: string
  image_url: string | null
  link_url: string | null
  position: string
  width: number | null
  height: number | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  created_at: string
}

const POSITIONS = [
  { value: 'home_hero', label: 'Ana Sayfa - Hero Altı' },
  { value: 'sidebar', label: 'Sol Sidebar (Kategoriler)' },
  { value: 'footer', label: 'Footer Üstü' },
  { value: 'market_top', label: 'Market Sayfası - Başı' },
]

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'home_hero',
    width: '',
    height: '',
    starts_at: '',
    ends_at: '',
    is_active: true,
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBanners((data as Banner[]) || [])
    } catch (err) {
      console.error('Error fetching banners:', err)
      alert('Reklam yüklemesi başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      title: formData.title,
      image_url: formData.image_url || null,
      link_url: formData.link_url || null,
      position: formData.position,
      width: formData.width ? parseInt(formData.width) : null,
      height: formData.height ? parseInt(formData.height) : null,
      starts_at: formData.starts_at || null,
      ends_at: formData.ends_at || null,
      is_active: formData.is_active,
    }

    try {
      if (editing) {
        const { error } = await supabase
          .from('banners')
          .update(payload)
          .eq('id', editing.id)

        if (error) throw error
        alert('Reklam güncellendi')
      } else {
        const { error } = await supabase
          .from('banners')
          .insert([payload])

        if (error) throw error
        alert('Reklam oluşturuldu')
      }

      setShowForm(false)
      setEditing(null)
      setFormData({
        title: '',
        image_url: '',
        link_url: '',
        position: 'home_hero',
        width: '',
        height: '',
        starts_at: '',
        ends_at: '',
        is_active: true,
      })
      fetchBanners()
    } catch (err) {
      console.error('Error saving banner:', err)
      alert('Kaydetme başarısız')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Reklam silindi')
      fetchBanners()
    } catch (err) {
      console.error('Error deleting banner:', err)
      alert('Silme başarısız')
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentActive })
        .eq('id', id)

      if (error) throw error
      fetchBanners()
    } catch (err) {
      console.error('Error toggling banner:', err)
    }
  }

  const openEdit = (banner: Banner) => {
    setEditing(banner)
    setFormData({
      title: banner.title,
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      position: banner.position,
      width: banner.width?.toString() || '',
      height: banner.height?.toString() || '',
      starts_at: banner.starts_at ? banner.starts_at.slice(0, 16) : '',
      ends_at: banner.ends_at ? banner.ends_at.slice(0, 16) : '',
      is_active: banner.is_active,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      position: 'home_hero',
      width: '',
      height: '',
      starts_at: '',
      ends_at: '',
      is_active: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Reklam Alanları Yönetimi</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Reklam
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editing ? 'Reklamı Düzenle' : 'Yeni Reklam Oluştur'}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-white">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Başlık *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  placeholder="Reklam başlığı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reklam Konumu *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Genişlik (px)
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                    placeholder="800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Yükseklik (px)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                    placeholder="400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reklam Resmi URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hedef Link URL
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Başlangıç (Tarihi/Saati)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bitiş (Tarihi/Saati)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm font-medium text-slate-300">
                  Aktif
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  {editing ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banners Table */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Yükleniyor...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-8 text-slate-400">Henüz reklam yok</div>
      ) : (
        <div className="border border-slate-700/50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Başlık</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Konum</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Başlangıç</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Bitiş</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Durum</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                  <td className="px-6 py-3 text-sm text-white">{banner.title}</td>
                  <td className="px-6 py-3 text-sm text-slate-400">
                    {POSITIONS.find((p) => p.value === banner.position)?.label}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-400">
                    {banner.starts_at
                      ? new Date(banner.starts_at).toLocaleString('tr-TR')
                      : '—'}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-400">
                    {banner.ends_at
                      ? new Date(banner.ends_at).toLocaleString('tr-TR')
                      : '—'}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <button
                      onClick={() => handleToggleActive(banner.id, banner.is_active)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{
                        backgroundColor: banner.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                        color: banner.is_active ? '#86efac' : '#cbd5e1',
                      }}
                    >
                      {banner.is_active ? (
                        <>
                          <Eye className="w-3 h-3" /> Aktif
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Pasif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(banner)}
                      className="p-2 text-slate-400 hover:text-orange-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
