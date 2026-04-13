'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, AlertCircle, ChevronDown, Edit2, Save, X, Plus, Trash2 } from 'lucide-react'

interface Boat {
  id: string
  name: string
  type?: string
  image_url?: string
  year?: number
  length_m?: number
  beam_m?: number
  draft_m?: number
  engine_model?: string
  flag?: string
  status: string
  registration_no?: string
  harbor_registration_no?: string
  last_maintenance?: string
  home_port?: string
  captain_name?: string
  hull_material?: string
}

interface ModuleItem {
  id: string
  [key: string]: any
}

const MODULE_CONFIG: Record<string, {
  title: string
  description: string
  table: string
  fields: { key: string; label: string; type: string }[]
}> = {
  bilgiler: {
    title: 'Genel Bilgiler',
    description: 'Teknenin temel özellikleri ve detayları',
    table: 'boats',
    fields: [
      { key: 'name', label: 'Tekne Adı', type: 'text' },
      { key: 'type', label: 'Tip', type: 'text' },
      { key: 'flag', label: 'Bayrak', type: 'text' },
      { key: 'registration_no', label: 'Ruhsat No', type: 'text' },
      { key: 'harbor_registration_no', label: 'Liman Kayıt No', type: 'text' },
      { key: 'year', label: 'Üretim Yılı', type: 'number' },
      { key: 'length_m', label: 'Boy (m)', type: 'number' },
      { key: 'beam_m', label: 'En (m)', type: 'number' },
      { key: 'draft_m', label: 'Su Kesimi (m)', type: 'number' },
      { key: 'hull_material', label: 'Gövde Malzeme', type: 'text' },
      { key: 'engine_model', label: 'Motor Modeli', type: 'text' },
      { key: 'captain_name', label: 'Kaptan', type: 'text' },
      { key: 'home_port', label: 'Liman / Marina', type: 'text' },
    ]
  },
  arizalar: {
    title: 'Arıza Kayıtları',
    description: 'Teknede oluşan arızalar ve sorunlar',
    table: 'boat_faults',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'severity', label: 'Önem Derecesi', type: 'select' },
      { key: 'status', label: 'Durum', type: 'select' },
    ]
  },
  gunluk: {
    title: 'Seyir Günlüğü',
    description: 'Yolculuk ve seyir notları',
    table: 'boat_logs',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'date_time', label: 'Tarih & Saat', type: 'datetime' },
      { key: 'location', label: 'Konum', type: 'text' },
    ]
  },
  rota: {
    title: 'Rota & Harita',
    description: 'Seyir rotaları ve konumlar',
    table: 'boat_routes',
    fields: [
      { key: 'name', label: 'Rota Adı', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'start_location', label: 'Başlangıç', type: 'text' },
      { key: 'end_location', label: 'Bitiş', type: 'text' },
      { key: 'distance_nm', label: 'Mesafe (nm)', type: 'number' },
      { key: 'estimated_time', label: 'Tahmini Süre', type: 'text' },
      { key: 'status', label: 'Durum', type: 'select' },
    ]
  },
  bakim: {
    title: 'Bakım Planı',
    description: 'Periyodik bakım planı',
    table: 'boat_maintenance',
    fields: [
      { key: 'item', label: 'Bakım Öğesi', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'interval_months', label: 'Aralık (Ay)', type: 'number' },
      { key: 'next_date', label: 'Sonraki Bakım Tarihi', type: 'date' },
      { key: 'priority', label: 'Öncelik', type: 'select' },
    ]
  },
  isler: {
    title: 'Yapılan İşler',
    description: 'Tamamlanan bakım ve onarım işleri',
    table: 'boat_tasks',
    fields: [
      { key: 'title', label: 'İş Başlığı', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'completed_date', label: 'Tamamlanma Tarihi', type: 'date' },
      { key: 'cost', label: 'Maliyet (₺)', type: 'number' },
      { key: 'technician', label: 'Teknisyen', type: 'text' },
    ]
  },
  harcamalar: {
    title: 'Harcamalar',
    description: 'Bakım ve onarım giderleri',
    table: 'boat_expenses',
    fields: [
      { key: 'category', label: 'Kategori', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'amount', label: 'Tutar (₺)', type: 'number' },
      { key: 'date', label: 'Tarih', type: 'date' },
    ]
  },
  kondisyon: {
    title: 'Kondisyon',
    description: 'Tekne durumu ve sağlık raporları',
    table: 'boat_condition',
    fields: [
      { key: 'hull_condition', label: 'Gövde Durumu', type: 'text' },
      { key: 'engine_condition', label: 'Motor Durumu', type: 'text' },
      { key: 'rigging_condition', label: 'Rigging Durumu', type: 'text' },
      { key: 'interior_condition', label: 'İç Durumu', type: 'text' },
      { key: 'overall_rating', label: 'Genel Puan', type: 'number' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
      { key: 'checked_date', label: 'Kontrol Tarihi', type: 'date' },
    ]
  },
  crew: {
    title: 'Crew',
    description: 'Gemi mürettebatı ve roller',
    table: 'boat_crew',
    fields: [
      { key: 'name', label: 'Ad Soyad', type: 'text' },
      { key: 'role', label: 'Rol', type: 'text' },
      { key: 'phone', label: 'Telefon', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
    ]
  },
  ustalar: {
    title: 'Ustalar',
    description: 'İlişkili ustalar ve servisler',
    table: 'boat_masters',
    fields: [
      { key: 'name', label: 'Ad Soyad', type: 'text' },
      { key: 'specialty', label: 'Uzmanlık', type: 'text' },
      { key: 'phone', label: 'Telefon', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
    ]
  },
  ekipmanlar: {
    title: 'Ekipmanlar',
    description: 'Tekne ekipmanları ve sistemleri',
    table: 'boat_equipment',
    fields: [
      { key: 'name', label: 'Ekipman Adı', type: 'text' },
      { key: 'type', label: 'Tip', type: 'text' },
      { key: 'brand', label: 'Marka', type: 'text' },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'serial_number', label: 'Seri No', type: 'text' },
      { key: 'purchase_date', label: 'Satın Alma Tarihi', type: 'date' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
    ]
  },
  envanter: {
    title: 'Envanter',
    description: 'Tekne envanteri ve malzemeleri',
    table: 'boat_inventory',
    fields: [
      { key: 'item_name', label: 'Öğe Adı', type: 'text' },
      { key: 'quantity', label: 'Miktar', type: 'number' },
      { key: 'category', label: 'Kategori', type: 'text' },
      { key: 'location', label: 'Konum', type: 'text' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
    ]
  },
  fotograflar: {
    title: 'Fotoğraflar',
    description: 'Tekne fotoğraf galerisi',
    table: 'boat_photos',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text' },
      { key: 'image_url', label: 'Resim URL', type: 'text' },
      { key: 'category', label: 'Kategori', type: 'text' },
    ]
  },
  belgeler: {
    title: 'Belgeler',
    description: 'Tekne belgeleri ve sertifikaları',
    table: 'boat_documents',
    fields: [
      { key: 'document_name', label: 'Belge Adı', type: 'text' },
      { key: 'file_url', label: 'Dosya URL', type: 'text' },
      { key: 'document_type', label: 'Belge Türü', type: 'text' },
      { key: 'expiry_date', label: 'Son Geçerlilik Tarihi', type: 'date' },
    ]
  },
  adb: {
    title: 'ADB/Sertifikalar',
    description: 'ADB ve diğer sertifikalar',
    table: 'boat_adb',
    fields: [
      { key: 'certificate_name', label: 'Sertifika Adı', type: 'text' },
      { key: 'certificate_number', label: 'Sertifika No', type: 'text' },
      { key: 'issue_date', label: 'Veriliş Tarihi', type: 'date' },
      { key: 'expiry_date', label: 'Son Geçerlilik Tarihi', type: 'date' },
      { key: 'issuer', label: 'Veren Kuruluş', type: 'text' },
    ]
  },
}

export default function ModulePage() {
  const router = useRouter()
  const params = useParams()
  const boatId = params.id as string
  const moduleKey = params.module as string

  const [boat, setBoat] = useState<Boat | null>(null)
  const [items, setItems] = useState<ModuleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ModuleItem | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const config = MODULE_CONFIG[moduleKey] || MODULE_CONFIG.bilgiler

  useEffect(() => {
    fetchData()
  }, [boatId, moduleKey, router])

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/giris?redirect=/benim-teknelerim')
        return
      }

      // Fetch boat
      const { data: boatData, error: boatError } = await supabase
        .from('boats')
        .select('*')
        .eq('id', boatId)
        .eq('user_id', session.user.id)
        .single()

      if (boatError) throw boatError
      if (boatData) setBoat(boatData as Boat)

      // Fetch module data
      if (moduleKey === 'bilgiler') {
        setItems([boatData as any])
      } else {
        const { data: moduleData, error: moduleError } = await supabase
          .from(config.table)
          .select('*')
          .eq('boat_id', boatId)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (moduleError) throw moduleError
        setItems((moduleData || []) as ModuleItem[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData || !boat) return
    setIsSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Oturum bulunamadı')

      if (moduleKey === 'bilgiler') {
        // Update boat
        const { error: updateError } = await supabase
          .from('boats')
          .update(formData)
          .eq('id', boatId)
          .eq('user_id', session.user.id)

        if (updateError) throw updateError
        setBoat(formData as Boat)
      } else if (editingItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from(config.table)
          .update(formData)
          .eq('id', editingItem.id)
          .eq('user_id', session.user.id)

        if (updateError) throw updateError
        setItems(items.map(i => i.id === editingItem.id ? { ...i, ...formData } : i))
      } else {
        // Create new item
        const { error: insertError } = await supabase
          .from(config.table)
          .insert([{
            boat_id: boatId,
            user_id: session.user.id,
            ...formData
          }])

        if (insertError) throw insertError
        await fetchData()
      }

      setIsEditing(false)
      setEditingItem(null)
      setFormData({})
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Oturum bulunamadı')

      const { error: deleteError } = await supabase
        .from(config.table)
        .delete()
        .eq('id', itemId)
        .eq('user_id', session.user.id)

      if (deleteError) throw deleteError
      setItems(items.filter(i => i.id !== itemId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    )
  }

  if (error && !boat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/benim-teknelerim"
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Geri Dön
          </Link>
          <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/benim-teknelerim/${boatId}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Tekneye Dön: {boat?.name}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{config.title}</h1>
              <p className="text-slate-400 text-lg">{config.description}</p>
            </div>
            {!isEditing && moduleKey !== 'bilgiler' && (
              <button
                onClick={() => {
                  setEditingItem(null)
                  setFormData({})
                  setIsEditing(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Ekle
              </button>
            )}
            {!isEditing && moduleKey === 'bilgiler' && (
              <button
                onClick={() => {
                  setEditingItem(null)
                  setFormData(boat || {})
                  setIsEditing(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Edit2 size={18} />
                Düzenle
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Edit Form or List */}
        {isEditing ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
            <div className="space-y-4">
              {config.fields.map(field => (
                <div key={field.key}>
                  <label className="text-sm text-slate-400 block mb-2">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Seçiniz</option>
                      {field.key === 'severity' && [
                        { value: 'low', label: 'Düşük' },
                        { value: 'medium', label: 'Orta' },
                        { value: 'high', label: 'Yüksek' },
                      ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      {field.key === 'status' && (moduleKey === 'arizalar' ? [
                        { value: 'open', label: 'Açık' },
                        { value: 'in_progress', label: 'Devam Ediyor' },
                        { value: 'closed', label: 'Kapalı' },
                      ] : [
                        { value: 'planned', label: 'Planlandı' },
                        { value: 'active', label: 'Aktif' },
                        { value: 'completed', label: 'Tamamlandı' },
                      ]).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      {field.key === 'priority' && [
                        { value: 'low', label: 'Düşük' },
                        { value: 'medium', label: 'Orta' },
                        { value: 'high', label: 'Yüksek' },
                      ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? (
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
                onClick={() => {
                  setIsEditing(false)
                  setEditingItem(null)
                  setFormData({})
                }}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <X size={20} />
                İptal
              </button>
            </div>
          </div>
        ) : moduleKey === 'bilgiler' && boat ? (
          <BoatDetailsView boat={boat} config={config} />
        ) : items.length > 0 ? (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title || item.name || item.item || item.document_name || item.certificate_name || `Öğe ${item.id.slice(0, 8)}`}
                    </h3>
                    {item.description && <p className="text-slate-400 text-sm mb-2">{item.description}</p>}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      {config.fields.filter(f => f.key !== 'title' && f.key !== 'name' && f.key !== 'item' && f.key !== 'description').slice(0, 4).map(field => (
                        item[field.key] && <div key={field.key}><span className="text-slate-500">{field.label}:</span> {String(item[field.key]).slice(0, 30)}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setFormData(item)
                        setIsEditing(true)
                      }}
                      className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
            <p className="text-slate-400 mb-6">Henüz kayıt bulunmamaktadır</p>
            <button
              onClick={() => {
                setEditingItem(null)
                setFormData({})
                setIsEditing(true)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Yeni Kayıt Ekle
            </button>
          </div>
        )}

        {/* Back Buttons */}
        <div className="mt-8 flex gap-4">
          <Link href={`/benim-teknelerim/${boatId}`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Modüllere Dön
          </Link>
          <Link href="/benim-teknelerim"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
            Teknelerim
          </Link>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-fade-in">
              <div className="bg-slate-800/95 border border-blue-500/30 rounded-2xl p-8 w-80 text-center cursor-pointer hover:border-blue-500/50 transition-all shadow-2xl">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500/20 rounded-full p-4 animate-scale-in">
                    <Save size={48} className="text-blue-400" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-white">Kaydedildi</p>
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

function BoatDetailsView({ boat, config }: { boat: Boat; config: any }) {
  const [expandedSections, setExpandedSections] = useState({
    identity: true,
    technical: false,
    connection: false,
  })

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
        <div className="flex gap-6">
          {boat.image_url ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={boat.image_url}
                alt={boat.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">⛵</span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{boat.name}</h2>
            <p className="text-slate-400 mb-3">{boat.type || '-'}</p>
          </div>
        </div>
      </div>

      <AccordionSection
        title="KİMLİK BİLGİLERİ"
        expanded={expandedSections.identity}
        onToggle={() => setExpandedSections(s => ({ ...s, identity: !s.identity }))}
      >
        <InfoRow label="Tekne Adı" value={boat.name} />
        <InfoRow label="Tip" value={boat.type || '—'} />
        <InfoRow label="Bayrak" value={boat.flag || '—'} />
        <InfoRow label="Ruhsat No" value={boat.registration_no || '—'} />
        <InfoRow label="Liman Kayıt No" value={boat.harbor_registration_no || '—'} />
      </AccordionSection>

      <AccordionSection
        title="TEKNİK ÖZELLİKLER"
        expanded={expandedSections.technical}
        onToggle={() => setExpandedSections(s => ({ ...s, technical: !s.technical }))}
      >
        <InfoRow label="Üretim Yılı" value={boat.year?.toString() || '—'} />
        <InfoRow label="Boy" value={boat.length_m ? `${boat.length_m}m` : '—'} />
        <InfoRow label="En" value={boat.beam_m ? `${boat.beam_m}m` : '—'} />
        <InfoRow label="Su Kesimi" value={boat.draft_m ? `${boat.draft_m}m` : '—'} />
        <InfoRow label="Gövde Malzeme" value={boat.hull_material || '—'} />
        <InfoRow label="Motor Modeli" value={boat.engine_model || '—'} />
      </AccordionSection>

      <AccordionSection
        title="BAĞLANTI"
        expanded={expandedSections.connection}
        onToggle={() => setExpandedSections(s => ({ ...s, connection: !s.connection }))}
      >
        <InfoRow label="Kaptan" value={boat.captain_name || '—'} />
        <InfoRow label="Liman / Marina" value={boat.home_port || '—'} />
      </AccordionSection>
    </div>
  )
}

function AccordionSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors text-left"
      >
        <h3 className="text-orange-400 font-semibold text-sm tracking-wide">{title}</h3>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="border-t border-slate-700 divide-y divide-slate-700">
          {children}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 text-sm">
      <span className="text-slate-400 flex-1">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  )
}
