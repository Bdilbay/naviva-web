'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, AlertCircle, ChevronDown, Edit2, Save, X, Plus, Trash2, Check, Info, Phone, Mail, Star } from 'lucide-react'
import { getFeaturedAnnouncement, type Announcement } from '@/services/announcement_service'
import { RatingModal } from '@/components/RatingModal'

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

// TODO: Supabase schema sync — şu modüller schema uyuşmazlığı var:
// - bakim (boat_maintenance)
// - arizalar (boat_faults)
// - isler (boat_tasks)
// Supabase'te bu tabloları kontrol et ve migrate et

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
      { key: 'status', label: 'Durum', type: 'select' },
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
      { key: 'last_maintenance', label: 'Son Bakım Tarihi', type: 'date' },
      { key: 'image_url', label: 'Tekne Resmi *', type: 'file' },
    ]
  },
  arizalar: {
    title: 'Arıza Kayıtları',
    description: 'Teknede oluşan arızalar ve sorunlar',
    table: 'boat_faults',
    fields: [
      { key: 'title', label: 'Başlık *', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'location', label: 'Konum', type: 'text' },
      { key: 'category', label: 'Kategori', type: 'text' },
      { key: 'date', label: 'Tarih', type: 'date' },
      { key: 'severity', label: 'Önem Derecesi', type: 'select' },
      { key: 'status', label: 'Durum', type: 'select' },
      { key: 'master_name', label: 'Usta Adı', type: 'master_select' },
      { key: 'actual_cost', label: 'Gerçek Maliyet (₺)', type: 'number' },
      { key: 'image_url', label: 'Fotoğraf', type: 'file' },
    ]
  },
  gunluk: {
    title: 'Seyir Günlüğü',
    description: 'Yolculuk ve seyir notları',
    table: 'boat_logs',
    fields: [
      { key: 'date', label: 'Tarih', type: 'date' },
      { key: 'from_port', label: 'Kalkış Limanı', type: 'text' },
      { key: 'to_port', label: 'Varış Limanı', type: 'text' },
      { key: 'dep_time', label: 'Kalkış Saati (HH:mm)', type: 'text' },
      { key: 'arr_time', label: 'Varış Saati (HH:mm)', type: 'text' },
      { key: 'course_true', label: 'Gerçek Kurs (0-359°)', type: 'number' },
      { key: 'speed_kn', label: 'Hız (kn)', type: 'number' },
      { key: 'distance_nm', label: 'Mesafe (nm)', type: 'number' },
      { key: 'wind_dir', label: 'Rüzgar Yönü', type: 'text' },
      { key: 'wind_beaufort', label: 'Rüzgar Beaufort (0-12)', type: 'number' },
      { key: 'wave_height_m', label: 'Dalga Yüksekliği (m)', type: 'number' },
      { key: 'pressure_hpa', label: 'Basınç (hPa)', type: 'number' },
      { key: 'visibility', label: 'Görüş Mesafesi', type: 'text' },
      { key: 'eng_hours_start', label: 'Motor Saatleri (Başlangıç)', type: 'number' },
      { key: 'eng_hours_end', label: 'Motor Saatleri (Bitiş)', type: 'number' },
      { key: 'fuel_pct', label: 'Yakıt (%)', type: 'number' },
      { key: 'water_pct', label: 'Su (%)', type: 'number' },
      { key: 'battery_v', label: 'Pil Voltajı (V)', type: 'number' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
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
      { key: 'title', label: 'Başlık *', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'category', label: 'Kategori', type: 'text' },
      { key: 'interval_months', label: 'Aralık (Ay)', type: 'number' },
      { key: 'due_date', label: 'Bitiş Tarihi *', type: 'date' },
      { key: 'status', label: 'Durum', type: 'select' },
      { key: 'master_name', label: 'Usta Adı', type: 'master_select' },
      { key: 'cost', label: 'Maliyet (₺)', type: 'number' },
      { key: 'completed_date', label: 'Tamamlanma Tarihi', type: 'date' },
    ]
  },
  isler: {
    title: 'Yapılan İşler',
    description: 'Tamamlanan bakım ve onarım işleri',
    table: 'boat_tasks',
    fields: [
      { key: 'title', label: 'İş Başlığı *', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'date', label: 'Tarih', type: 'date' },
      { key: 'category', label: 'Kategori', type: 'select' },
      { key: 'master_name', label: 'Usta/Teknisyen', type: 'master_select' },
      { key: 'cost', label: 'Maliyet (₺)', type: 'number' },
    ]
  },
  harcamalar: {
    title: 'Harcamalar',
    description: 'Bakım ve onarım giderleri',
    table: 'expenses',
    fields: [
      { key: 'title', label: 'Başlık *', type: 'text' },
      { key: 'category', label: 'Kategori *', type: 'select' },
      { key: 'amount', label: 'Tutar (₺) *', type: 'number' },
      { key: 'expense_date', label: 'Tarih', type: 'date' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
      { key: 'photo_url', label: 'Fotoğraf', type: 'file' },
    ]
  },
  kondisyon: {
    title: 'Kondisyon',
    description: 'Tekne durumu ve sağlık raporları',
    table: 'boat_condition',
    fields: [
      { key: 'title', label: 'Başlık', type: 'text' },
      { key: 'date', label: 'Kontrol Tarihi', type: 'date' },
      { key: 'hull_score', label: 'Gövde Puanı (0-10)', type: 'number' },
      { key: 'engine_score', label: 'Motor Puanı (0-10)', type: 'number' },
      { key: 'electrical_score', label: 'Elektrik Puanı (0-10)', type: 'number' },
      { key: 'deck_score', label: 'Güverte Puanı (0-10)', type: 'number' },
      { key: 'interior_score', label: 'İç Mekan Puanı (0-10)', type: 'number' },
      { key: 'rigging_score', label: 'Donanım Puanı (0-10)', type: 'number' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
    ]
  },
  crew: {
    title: 'Crew',
    description: 'Gemi mürettebatı ve roller',
    table: 'boat_crew',
    fields: [
      { key: 'name', label: 'Ad Soyad', type: 'text' },
      { key: 'role', label: 'Rol', type: 'select' },
      { key: 'photo_url', label: 'Fotoğraf *', type: 'file' },
      { key: 'phone', label: 'Telefon', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'skills', label: 'Yeterlilikler', type: 'text' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
    ]
  },
  ustalar: {
    title: 'Ustalar',
    description: 'İlişkili ustalar ve servisler',
    table: 'boat_masters',
    fields: [
      { key: 'name', label: 'Ad Soyad', type: 'text' },
      { key: 'specialty', label: 'Uzmanlık', type: 'text' },
      { key: 'photo_url', label: 'Fotoğraf *', type: 'file' },
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
      { key: 'brand', label: 'Marka', type: 'text' },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'serial_number', label: 'Seri No', type: 'text' },
      { key: 'category', label: 'Kategori', type: 'select' },
      { key: 'purchase_date', label: 'Satın Alma Tarihi', type: 'date' },
      { key: 'warranty_expiry', label: 'Garanti Bitiş Tarihi', type: 'date' },
      { key: 'location', label: 'Konum (Tekne)', type: 'text' },
      { key: 'image_url', label: 'Fotoğraf', type: 'file' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
    ]
  },
  envanter: {
    title: 'Envanter',
    description: 'Tekne envanteri ve malzemeleri',
    table: 'boat_inventory',
    fields: [
      { key: 'name', label: 'Ürün Adı', type: 'text' },
      { key: 'category', label: 'Kategori', type: 'select' },
      { key: 'unit', label: 'Birim', type: 'text' },
      { key: 'qty', label: 'Adet', type: 'number' },
      { key: 'min_qty', label: 'Minimum Adet', type: 'number' },
      { key: 'location', label: 'Konum', type: 'text' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
    ]
  },
  fotograflar: {
    title: 'Fotoğraflar',
    description: 'Tekne fotoğraf galerisi',
    table: 'boat_photos',
    fields: [
      { key: 'title', label: 'Albüm Başlığı', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'date', label: 'Tarih', type: 'date' },
      { key: 'image_url', label: 'Fotoğraf *', type: 'file' },
    ]
  },
  belgeler: {
    title: 'Belgeler',
    description: 'Tekne belgeleri ve sertifikaları',
    table: 'boat_documents',
    fields: [
      { key: 'title', label: 'Belge Adı', type: 'text' },
      { key: 'description', label: 'Açıklama', type: 'textarea' },
      { key: 'category', label: 'Belge Türü', type: 'select' },
      { key: 'expiry_date', label: 'Son Geçerlilik Tarihi', type: 'date' },
      { key: 'file_url', label: 'Belge Dosyası *', type: 'file' },
    ]
  },
  adb: {
    title: 'ADB/Sertifikalar',
    description: 'ADB ve diğer sertifikalar',
    table: 'boat_adb',
    fields: [
      { key: 'title', label: 'Sertifika Adı', type: 'text' },
      { key: 'type', label: 'Sertifika Tipi', type: 'select' },
      { key: 'cert_no', label: 'Sertifika No', type: 'text' },
      { key: 'expiry_date', label: 'Son Geçerlilik Tarihi', type: 'date' },
      { key: 'notes', label: 'Notlar', type: 'textarea' },
      { key: 'image_url', label: 'Fotoğraf', type: 'file' },
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
  const [activeFilter, setActiveFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [ratingMasterData, setRatingMasterData] = useState<{ id: string; name: string; item: ModuleItem } | null>(null)
  const [masterDetailOpen, setMasterDetailOpen] = useState(false)
  const [selectedMaster, setSelectedMaster] = useState<any>(null)
  const [masterSearch, setMasterSearch] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  const config = MODULE_CONFIG[moduleKey] || MODULE_CONFIG.bilgiler

  // Filter logic for different modules
  const getFilteredItems = (): ModuleItem[] => {
    let result = items

    if (moduleKey === 'ustalar' && masterSearch) {
      const query = masterSearch.toLowerCase()
      console.log('🔍 Filtering ustalar:', { query, total: result.length, masterSearch })
      console.log('📋 Items before filter:', result.map(i => ({ name: i.name, specialty: i.specialty, phone: i.phone })))
      result = result.filter(i => {
        const name = (i.name || '').toLowerCase()
        const specialty = (i.specialty || '').toLowerCase()
        const phone = (i.phone || '').toLowerCase()
        const matches = name.includes(query) || specialty.includes(query) || phone.includes(query)
        console.log('  -', i.name, { name, specialty, phone, matches })
        return matches
      })
      console.log('  ✅ Filtered result:', result.length, result.map(i => i.name))
    }

    if (moduleKey === 'arizalar') {
      switch (activeFilter) {
        case 'open': return result.filter(i => i.status === 'open')
        case 'closed': return result.filter(i => i.status === 'closed')
        case 'high': return result.filter(i => i.severity === 'high' && i.status === 'open')
        default: return result
      }
    }
    if (moduleKey === 'rota') {
      switch (activeFilter) {
        case 'planned': return result.filter(i => i.status === 'planned')
        case 'active': return result.filter(i => i.status === 'active')
        case 'completed': return result.filter(i => i.status === 'completed')
        default: return result
      }
    }
    return result
  }

  const filteredItems = getFilteredItems()
  if (moduleKey === 'ustalar') {
    console.log('📌 getFilteredItems called:', { moduleKey, masterSearch, itemsCount: items.length, filteredCount: filteredItems.length })
  }

  useEffect(() => {
    fetchData()
    if (moduleKey === 'adb') {
      loadAnnouncement()
    }
  }, [boatId, moduleKey, router])

  const loadAnnouncement = async () => {
    const ann = await getFeaturedAnnouncement('adb')
    setAnnouncement(ann)
  }

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/giris?redirect=/benim-teknelerim')
        return
      }

      setCurrentUser(session.user)

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
      } else if (moduleKey === 'ustalar') {
        // For ustalar (masters), fetch boat-specific, user-registered global, and other global masters
        console.log('🚀 Starting ustalar fetch for boat:', boatId)

        const { data: boatMasters, error: boatMastersError } = await supabase
          .from('boat_masters')
          .select('*')
          .eq('boat_id', boatId)
          .order('name', { ascending: true })
        console.log('📍 boatMasters:', { count: boatMasters?.length || 0, error: boatMastersError?.message })

        // User's own registered masters
        const { data: userMasters, error: userMastersError } = await supabase
          .from('master_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .order('name', { ascending: true })
        console.log('👤 userMasters:', { count: userMasters?.length || 0, error: userMastersError?.message })

        // Other global masters (not user's own)
        const { data: globalMasters, error: globalMastersError } = await supabase
          .from('master_profiles')
          .select('*')
          .or(`listed_publicly.eq.true,listed_publicly.is.null`)
          .or(`user_id.neq.${session.user.id},user_id.is.null`)
          .order('name', { ascending: true })
        console.log('🌍 globalMasters:', { count: globalMasters?.length || 0, error: globalMastersError?.message })

        if (boatMastersError) throw boatMastersError
        if (userMastersError) throw userMastersError
        if (globalMastersError) throw globalMastersError

        // Combine: boat masters first, then user's global, then other global (avoiding duplicates)
        const combined: any[] = (boatMasters || []).map((bm: any) => ({
          ...bm,
          id: bm.id || '',
          name: bm.name || '',
          specialty: bm.specialty || '',
          phone: bm.phone || '',
          email: bm.email || '',
          notes: bm.notes || '',
        }))
        const masterNames = new Set(combined.map((m: any) => m.name?.toLowerCase()))

        // Add user's registered masters
        if (userMasters) {
          userMasters.forEach((um: any) => {
            if (!masterNames.has(um.name?.toLowerCase())) {
              combined.push({
                id: um.id,
                name: um.name || '',
                specialty: Array.isArray(um.specialties) ? um.specialties.join(', ') : (Array.isArray(um.categories) ? um.categories.join(', ') : ''),
                phone: um.phone || '',
                email: um.email || '',
                notes: um.bio || '',
                is_global: true,
                is_user_registered: true,
                user_id: session.user.id,
                avg_rating: um.avg_rating || 0,
                review_count: um.review_count || 0,
              })
              masterNames.add(um.name?.toLowerCase())
            }
          })
        }

        // Add other global masters
        if (globalMasters) {
          globalMasters.forEach((gm: any) => {
            if (!masterNames.has(gm.name?.toLowerCase())) {
              combined.push({
                id: gm.id,
                name: gm.name || '',
                specialty: Array.isArray(gm.specialties) ? gm.specialties.join(', ') : (Array.isArray(gm.categories) ? gm.categories.join(', ') : ''),
                phone: gm.phone || '',
                email: gm.email || '',
                notes: gm.bio || '',
                is_global: true,
                avg_rating: gm.avg_rating || 0,
                review_count: gm.review_count || 0,
              })
              masterNames.add(gm.name?.toLowerCase())
            }
          })
        }

        console.log('✅ Ustalar loaded:', combined.length, combined)
        console.table(combined.map(m => ({ name: m.name, specialty: m.specialty, phone: m.phone, is_user_registered: m.is_user_registered, is_global: m.is_global })))
        setItems(combined as ModuleItem[])
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

    // Validate required fields
    const requiredFields = config.fields.filter(f => f.label.includes('*'))
    const missingFields = requiredFields.filter(f => !formData[f.key])

    if (missingFields.length > 0) {
      setError(`Lütfen zorunlu alanları doldurunuz: ${missingFields.map(f => f.label.replace('*', '').trim()).join(', ')}`)
      return
    }

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
        // Update existing item - only include fields that are in config
        const allowedFields = config.fields.map(f => f.key)
        const filteredFormData = Object.fromEntries(
          Object.entries(formData).filter(([key]) => allowedFields.includes(key))
        )

        const { error: updateError } = await supabase
          .from(config.table)
          .update(filteredFormData)
          .eq('id', editingItem.id)
          .eq('user_id', session.user.id)

        if (updateError) throw updateError
        setItems(items.map(i => i.id === editingItem.id ? { ...i, ...filteredFormData } : i))
      } else {
        // Create new item - only include fields that are in config
        const allowedFields = config.fields.map(f => f.key)
        const filteredFormData = Object.fromEntries(
          Object.entries(formData).filter(([key]) => allowedFields.includes(key))
        )

        const insertPayload = {
          boat_id: boatId,
          user_id: session.user.id,
          ...filteredFormData
        }
        console.log('📝 Module:', moduleKey)
        console.log('📝 Table:', config.table)
        console.log('📝 Allowed fields:', allowedFields)
        console.log('📝 Form data keys:', Object.keys(formData))
        console.log('📝 Filtered payload:', insertPayload)

        const response = await supabase
          .from(config.table)
          .insert([insertPayload])
          .select()

        const { error: insertError, data: insertData } = response

        console.log('📊 Response:', response)
        console.log('❌ Insert error:', insertError)
        console.log('✅ Insert data:', insertData)

        if (insertError) {
          // Try to get a meaningful error message
          let errorMsg = 'Kayıt eklenirken hata oluştu'
          if (insertError.message) errorMsg = insertError.message
          else if (insertError.details) errorMsg = insertError.details
          else if (insertError.hint) errorMsg = insertError.hint
          else if (Object.keys(insertError).length === 0) {
            errorMsg = `Supabase hatası (${config.table} tablosuna yazma izni kontrol edin)`
          }
          throw new Error(errorMsg)
        }
        console.log('✅ Başarılı!')
        await fetchData()
      }

      // Check if should show rating modal for maintenance completion
      const statusChangedToDone = moduleKey === 'bakim' && formData.status === 'done' && formData.master_name
      const wasPreviouslySomethingElse = !editingItem || editingItem.status !== 'done'
      const willShowRating = statusChangedToDone && wasPreviouslySomethingElse

      setIsEditing(false)
      setEditingItem(null)
      setFormData({})
      setError('')

      if (willShowRating) {
        console.log('⭐ Show rating dialog for:', formData.master_name)
        // Show rating modal - don't show success modal
        setRatingMasterData({
          id: formData.master_name,
          name: formData.master_name,
          item: { ...editingItem, ...formData }
        })
        setRatingModalOpen(true)
      } else {
        // Show success modal for non-rating saves
        setShowSuccessModal(true)
        setTimeout(() => {
          setShowSuccessModal(false)
          router.push(`/benim-teknelerim/${boatId}`)
        }, 1500)
      }
    } catch (err) {
      console.error('Save error:', err)
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

  const handleToggleStatus = async (item: ModuleItem) => {
    if (!boat) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Oturum bulunamadı')

      const newStatus = item.status === 'open' ? 'closed' : item.status === 'closed' ? 'open' : item.status === 'active' ? 'completed' : 'active'
      const { error: updateError } = await supabase
        .from(config.table)
        .update({ status: newStatus })
        .eq('id', item.id)
        .eq('user_id', session.user.id)

      if (updateError) throw updateError
      setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i))

      // Show rating modal for maintenance completion with master
      if (moduleKey === 'bakim' && newStatus === 'completed' && item.master_name) {
        setRatingMasterData({
          id: item.id,
          name: item.master_name,
          item: item
        })
        setRatingModalOpen(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum güncellenemedi')
    }
  }

  // Statistics helpers
  const getStats = (): Record<string, any> | null => {
    if (moduleKey === 'arizalar') {
      const openCount = items.filter(i => i.status === 'open').length
      const closedCount = items.filter(i => i.status === 'closed').length
      const criticalCount = items.filter(i => i.severity === 'high' && i.status === 'open').length
      return { openCount, closedCount, criticalCount, type: 'faults' }
    }
    if (moduleKey === 'rota') {
      const plannedCount = items.filter(i => i.status === 'planned').length
      const activeCount = items.filter(i => i.status === 'active').length
      const completedCount = items.filter(i => i.status === 'completed').length
      return { plannedCount, activeCount, completedCount, type: 'routes' }
    }
    if (moduleKey === 'bakim') {
      const highPriority = items.filter(i => i.priority === 'high').length
      const mediumPriority = items.filter(i => i.priority === 'medium').length
      const totalMaintenance = items.length
      return { highPriority, mediumPriority, totalMaintenance, type: 'maintenance' }
    }
    if (moduleKey === 'isler') {
      const totalTasks = items.length
      const totalCost = items.reduce((sum, i) => sum + (i.cost || 0), 0)
      return { totalTasks, totalCost, type: 'tasks' }
    }
    if (moduleKey === 'harcamalar') {
      const totalExpenses = items.length
      const totalAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0)
      return { totalExpenses, totalAmount, type: 'expenses' }
    }
    if (moduleKey === 'kondisyon') {
      const avgRating = items.length > 0 ? Math.round(items.reduce((sum, i) => sum + (i.overall_rating || 0), 0) / items.length) : 0
      const totalInspections = items.length
      return { avgRating, totalInspections, type: 'condition' }
    }
    if (moduleKey === 'crew') {
      const totalCrew = items.length
      return { totalCrew, type: 'crew' }
    }
    if (moduleKey === 'ustalar') {
      const totalMasters = items.length
      return { totalMasters, type: 'masters' }
    }
    if (moduleKey === 'ekipmanlar') {
      const totalEquipment = items.length
      return { totalEquipment, type: 'equipment' }
    }
    if (moduleKey === 'envanter') {
      const totalItems = items.length
      const totalQuantity = items.reduce((sum, i) => sum + (i.quantity || 0), 0)
      return { totalItems, totalQuantity, type: 'inventory' }
    }
    if (moduleKey === 'fotograflar') {
      const totalPhotos = items.length
      return { totalPhotos, type: 'photos' }
    }
    if (moduleKey === 'belgeler') {
      const totalDocuments = items.length
      const expiringDocuments = items.filter(i => {
        if (!i.expiry_date) return false
        const expiry = new Date(i.expiry_date)
        const today = new Date()
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        return expiry <= thirtyDaysFromNow && expiry > today
      }).length
      return { totalDocuments, expiringDocuments, type: 'documents' }
    }
    if (moduleKey === 'adb') {
      const totalCertificates = items.length
      const expiringCerts = items.filter(i => {
        if (!i.expiry_date) return false
        const expiry = new Date(i.expiry_date)
        const today = new Date()
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        return expiry <= thirtyDaysFromNow && expiry > today
      }).length
      return { totalCertificates, expiringCerts, type: 'adb' }
    }
    return null
  }

  const stats = getStats()

  // Helper to group items by month
  const groupByMonth = (items: ModuleItem[]) => {
    const grouped: Record<string, ModuleItem[]> = {}
    items.forEach(item => {
      let dateField = item.date_time || item.completed_date || item.date || item.created_at
      if (dateField) {
        const date = new Date(dateField)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(item)
      }
    })
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))
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

  // Group items for modules that need chronological grouping
  const shouldGroupByMonth = ['gunluk', 'isler', 'harcamalar'].includes(moduleKey)
  const groupedItems = shouldGroupByMonth ? groupByMonth(filteredItems) : []
  const showMonthGrouping = shouldGroupByMonth && groupedItems.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 md:p-8" style={{ paddingTop: '104px' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header with Action Buttons */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{config.title}</h1>
            <p className="text-slate-400">{config.description}</p>
          </div>

          {/* Action Buttons - same row as header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 whitespace-nowrap">
            <Link href={`/benim-teknelerim/${boatId}`}
              className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Geri Dön</span>
            </Link>
            {moduleKey !== 'bilgiler' && (
              <button
                onClick={() => {
                  setEditingItem(null)
                  setFormData({})
                  setIsModalOpen(true)
                }}
                className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Ekle</span>
              </button>
            )}
            {moduleKey === 'bilgiler' && (
              <button
                onClick={() => {
                  setEditingItem(null)
                  setFormData(boat || {})
                  setIsModalOpen(true)
                }}
                className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                <Edit2 size={16} />
                <span className="hidden sm:inline">Düzenle</span>
              </button>
            )}
          </div>
        </div>

        {/* ADB Announcement Banner */}
        {moduleKey === 'adb' && announcement && (
          <div className="mb-6 p-4 bg-orange-500/15 border border-orange-500/50 rounded-lg flex items-start gap-3 hover:bg-orange-500/20 transition-colors cursor-pointer"
            onClick={() => announcement.link_url && window.open(announcement.link_url, '_blank')}>
            <Info size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-orange-200 font-semibold text-sm">{announcement.title}</h3>
              {announcement.content && (
                <p className="text-orange-100/70 text-sm mt-1 line-clamp-2">{announcement.content}</p>
              )}
            </div>
            {announcement.link_url && (
              <span className="text-orange-400 text-xs mt-0.5 flex-shrink-0">→</span>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Boat Details View */}
        {moduleKey === 'bilgiler' && boat && !isModalOpen ? (
          <BoatDetailsView boat={boat} config={config} />
        ) : moduleKey !== 'bilgiler' && !isModalOpen ? (
          <>
            {/* Statistics Dashboard */}
            {stats && items.length > 0 && (
              <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {stats.type === 'faults' && (
                  <>
                    <StatBox value={stats.openCount || 0} label="Açık" color="bg-red-500/20 border-red-500/50" textColor="text-red-400" />
                    <StatBox value={stats.closedCount || 0} label="Kapalı" color="bg-green-500/20 border-green-500/50" textColor="text-green-400" />
                    <StatBox value={stats.criticalCount || 0} label="Kritik" color="bg-orange-500/20 border-orange-500/50" textColor="text-orange-400" />
                  </>
                )}
                {stats.type === 'routes' && (
                  <>
                    <StatBox value={stats.plannedCount || 0} label="Planlandı" color="bg-blue-500/20 border-blue-500/50" textColor="text-blue-400" />
                    <StatBox value={stats.activeCount || 0} label="Aktif" color="bg-orange-500/20 border-orange-500/50" textColor="text-orange-400" />
                    <StatBox value={stats.completedCount || 0} label="Tamamlandı" color="bg-green-500/20 border-green-500/50" textColor="text-green-400" />
                  </>
                )}
                {stats.type === 'maintenance' && (
                  <>
                    <StatBox value={stats.highPriority || 0} label="Yüksek Öncelik" color="bg-red-500/20 border-red-500/50" textColor="text-red-400" />
                    <StatBox value={stats.mediumPriority || 0} label="Orta Öncelik" color="bg-orange-500/20 border-orange-500/50" textColor="text-orange-400" />
                    <StatBox value={stats.totalMaintenance || 0} label="Toplam" color="bg-blue-500/20 border-blue-500/50" textColor="text-blue-400" />
                  </>
                )}
                {stats.type === 'tasks' && (
                  <>
                    <StatBox value={stats.totalTasks || 0} label="İş Sayısı" color="bg-blue-500/20 border-blue-500/50" textColor="text-blue-400" />
                    <StatBox value={`₺${stats.totalCost?.toLocaleString('tr-TR') || 0}`} label="Toplam Maliyet" color="bg-orange-500/20 border-orange-500/50" textColor="text-orange-400" isText />
                  </>
                )}
                {stats.type === 'expenses' && (
                  <>
                    <StatBox value={stats.totalExpenses || 0} label="Harcama Sayısı" color="bg-red-500/20 border-red-500/50" textColor="text-red-400" />
                    <StatBox value={`₺${stats.totalAmount?.toLocaleString('tr-TR') || 0}`} label="Toplam Tutar" color="bg-orange-500/20 border-orange-500/50" textColor="text-orange-400" isText />
                  </>
                )}
                {stats.type === 'condition' && (
                  <>
                    <StatBox value={`${stats.avgRating || 0}/10`} label="Ort. Puanı" color="bg-blue-500/20 border-blue-500/50" textColor="text-blue-400" isText />
                    <StatBox value={stats.totalInspections || 0} label="Muayene Sayısı" color="bg-green-500/20 border-green-500/50" textColor="text-green-400" />
                  </>
                )}
                {stats.type === 'crew' && (
                  <StatBox value={stats.totalCrew || 0} label="Toplam Mürettebat" color="bg-blue-500/20 border-blue-500/50" textColor="text-blue-400" />
                )}
                {stats.type === 'masters' && (
                  <StatBox value={stats.totalMasters || 0} label="Toplam Usta" color="bg-orange-500/20 border-orange-500/50" textColor="text-orange-400" />
                )}
                {stats.type === 'equipment' && (
                  <StatBox value={stats.totalEquipment || 0} label="Ekipman Sayısı" color="bg-purple-500/20 border-purple-500/50" textColor="text-purple-400" />
                )}
                {stats.type === 'inventory' && (
                  <>
                    <StatBox value={stats.totalItems || 0} label="Öğe Türü" color="bg-blue-500/20 border-blue-500/50" textColor="text-blue-400" />
                    <StatBox value={stats.totalQuantity || 0} label="Toplam Miktar" color="bg-green-500/20 border-green-500/50" textColor="text-green-400" />
                  </>
                )}
                {stats.type === 'photos' && (
                  <StatBox value={stats.totalPhotos || 0} label="Toplam Fotoğraf" color="bg-cyan-500/20 border-cyan-500/50" textColor="text-cyan-400" />
                )}
                {stats.type === 'documents' && (
                  <>
                    <StatBox value={stats.totalDocuments || 0} label="Belge Sayısı" color="bg-blue-500/20 border-blue-500/50" textColor="text-blue-400" />
                    {stats.expiringDocuments > 0 && <StatBox value={stats.expiringDocuments || 0} label="Sonu Yaklaşan" color="bg-red-500/20 border-red-500/50" textColor="text-red-400" />}
                  </>
                )}
                {stats.type === 'adb' && (
                  <>
                    <StatBox value={stats.totalCertificates || 0} label="Sertifika Sayısı" color="bg-green-500/20 border-green-500/50" textColor="text-green-400" />
                    {stats.expiringCerts > 0 && <StatBox value={stats.expiringCerts || 0} label="Sonu Yaklaşan" color="bg-red-500/20 border-red-500/50" textColor="text-red-400" />}
                  </>
                )}
              </div>
            )}

            {/* Search Box for Ustalar */}
            {moduleKey === 'ustalar' && (
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Usta ara... (ad, uzmanlık, telefon)"
                  value={masterSearch}
                  onChange={(e) => setMasterSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm"
                />
                {items.length === 0 && !loading && (
                  <p className="text-xs text-slate-500 mt-2">Henüz usta eklenmemiş</p>
                )}
              </div>
            )}

            {/* Filter Chips */}
            {(moduleKey === 'arizalar' || moduleKey === 'rota') && items.length > 0 && (
              <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
                {moduleKey === 'arizalar' ? (
                  <>
                    <FilterChip label="Tümü" value="all" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                    <FilterChip label="Açık" value="open" active={activeFilter === 'open'} onClick={() => setActiveFilter('open')} color="from-red-500 to-red-600" />
                    <FilterChip label="Kapalı" value="closed" active={activeFilter === 'closed'} onClick={() => setActiveFilter('closed')} color="from-green-500 to-green-600" />
                    <FilterChip label="Kritik" value="high" active={activeFilter === 'high'} onClick={() => setActiveFilter('high')} color="from-orange-500 to-orange-600" />
                  </>
                ) : moduleKey === 'rota' ? (
                  <>
                    <FilterChip label="Tümü" value="all" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                    <FilterChip label="Planlandı" value="planned" active={activeFilter === 'planned'} onClick={() => setActiveFilter('planned')} color="from-blue-500 to-blue-600" />
                    <FilterChip label="Aktif" value="active" active={activeFilter === 'active'} onClick={() => setActiveFilter('active')} color="from-orange-500 to-orange-600" />
                    <FilterChip label="Tamamlandı" value="completed" active={activeFilter === 'completed'} onClick={() => setActiveFilter('completed')} color="from-green-500 to-green-600" />
                  </>
                ) : null}
              </div>
            )}

            {/* Items List with Month Grouping */}
            {filteredItems.length > 0 ? (
              <div className="space-y-6">
                {showMonthGrouping ? (
                  groupedItems.map(([monthKey, monthItems]) => {
                    const [year, month] = monthKey.split('-')
                    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
                    const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`

                    return (
                      <div key={monthKey}>
                        <h3 className="text-slate-400 text-sm font-semibold mb-3 px-2">{monthLabel}</h3>
                        <div className="space-y-3">
                          {monthItems.map(item => (
                            <ItemCard key={item.id} item={item} moduleKey={moduleKey} config={config} onEdit={() => {
                              setEditingItem(item)
                              setFormData(item)
                              setIsModalOpen(true)
                            }} onDelete={() => handleDelete(item.id)} onToggle={() => handleToggleStatus(item)} onView={() => {
                              setSelectedMaster(item)
                              setMasterDetailOpen(true)
                            }} />
                          ))}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="space-y-3">
                    {filteredItems.map(item => (
                      <ItemCard key={item.id} item={item} moduleKey={moduleKey} config={config} onEdit={() => {
                        setEditingItem(item)
                        setFormData(item)
                        setIsModalOpen(true)
                      }} onDelete={() => handleDelete(item.id)} onToggle={() => handleToggleStatus(item)} onView={() => {
                        setSelectedMaster(item)
                        setMasterDetailOpen(true)
                      }} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState onAdd={() => {
                setEditingItem(null)
                setFormData({})
                setIsModalOpen(true)
              }} />
            )}
          </>
        ) : null}

        {/* Edit Form Modal */}
        {isModalOpen && (
          <EditFormModal
            item={editingItem}
            moduleKey={moduleKey}
            config={config}
            formData={formData}
            onFormChange={(data) => setFormData(data)}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false)
              setEditingItem(null)
              setFormData({})
            }}
            isSaving={isSaving}
            boatId={boatId}
          />
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
                <p className="text-xl font-semibold text-white mb-2">Kaydedildi</p>
                <p className="text-sm text-slate-400">Kapatmak için tıklayın</p>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {ratingModalOpen && ratingMasterData && (
          <RatingModal
            masterId={ratingMasterData.id}
            masterName={ratingMasterData.name}
            boatId={boatId}
            onClose={() => {
              setRatingModalOpen(false)
              setRatingMasterData(null)
              setTimeout(() => {
                router.push(`/benim-teknelerim/${boatId}`)
              }, 100)
            }}
            onSuccess={() => {
              setRatingModalOpen(false)
              setRatingMasterData(null)
              setShowSuccessModal(true)
              setTimeout(() => {
                setShowSuccessModal(false)
                setTimeout(() => {
                  router.push(`/benim-teknelerim/${boatId}`)
                }, 500)
              }, 1500)
            }}
          />
        )}

        {/* Master Detail Modal */}
        {masterDetailOpen && selectedMaster && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800/95 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedMaster.name}</h2>
                <button
                  onClick={() => {
                    setMasterDetailOpen(false)
                    setSelectedMaster(null)
                  }}
                  className="p-2 hover:bg-slate-700 rounded transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Rating Section */}
                {(selectedMaster.avg_rating !== undefined || selectedMaster.review_count !== undefined) && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Usta Değerlendirmesi</p>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={18}
                                className={`${
                                  i < Math.round(selectedMaster.avg_rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-slate-600 text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-bold text-white">{(selectedMaster.avg_rating || 0).toFixed(1)}</span>
                          {selectedMaster.review_count > 0 && (
                            <span className="text-slate-400">({selectedMaster.review_count} değerlendirme)</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setRatingMasterData({
                            id: selectedMaster.id,
                            name: selectedMaster.name,
                            item: selectedMaster,
                          })
                          setRatingModalOpen(true)
                          setMasterDetailOpen(false)
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        ⭐ Değerlendir
                      </button>
                    </div>
                  </div>
                )}

                {/* Specialty */}
                {selectedMaster.specialty && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Uzmanlık Alanları</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMaster.specialty.split(',').map((spec: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-orange-500/15 border border-orange-500/30 text-orange-300 rounded-full text-sm">
                          {spec.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div>
                  <p className="text-slate-400 text-sm mb-3">İletişim Bilgileri</p>
                  <div className="space-y-2">
                    {selectedMaster.phone && (
                      <p className="flex items-center gap-3 text-white">
                        <Phone size={16} className="text-orange-400" />
                        {selectedMaster.phone}
                      </p>
                    )}
                    {selectedMaster.email && (
                      <p className="flex items-center gap-3 text-white">
                        <Mail size={16} className="text-orange-400" />
                        {selectedMaster.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedMaster.notes && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Notlar</p>
                    <p className="text-white bg-slate-900/50 rounded-lg p-3">{selectedMaster.notes}</p>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {selectedMaster.is_user_registered ? (
                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-full text-sm font-medium">
                      👤 Kullanıcı Kaydı
                    </span>
                  ) : selectedMaster.is_global ? (
                    <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-full text-sm font-medium">
                      🌍 Global Usta
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-700 border border-slate-600 text-slate-400 rounded-full text-sm font-medium">
                      📌 Tekneye Özel
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setMasterDetailOpen(false)
                  setSelectedMaster(null)
                }}
                className="mt-8 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Kapat
              </button>
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

// Helper Components

function BoatDetailsView({ boat, config }: { boat: Boat; config: any }) {
  const [expandedSections, setExpandedSections] = useState({
    identity: true,
    technical: false,
    connection: false,
    equipment: false,
  })
  const [equipmentChecked, setEquipmentChecked] = useState<Record<string, boolean>>({})

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
        <InfoRow label="Son Bakım" value={boat.last_maintenance ? new Date(boat.last_maintenance).toLocaleDateString('tr-TR') : '—'} />
        <InfoRow label="Durum" value={
          boat.status === 'maintenance' ? '🔧 Bakımda' :
          boat.status === 'inactive' ? '❌ Pasif' :
          '✅ Aktif'
        } />
      </AccordionSection>

      <AccordionSection
        title="ZORUNLU EKİPMANLAR"
        expanded={expandedSections.equipment}
        onToggle={() => setExpandedSections(s => ({ ...s, equipment: !s.equipment }))}
        trailing={
          <span className="text-orange-400 font-semibold text-sm">
            {Object.values(equipmentChecked).filter(Boolean).length} / 14
          </span>
        }
      >
        <div className="px-4 py-3 text-sm space-y-2">
          <RequiredEquipmentItem
            name="Can Yeleği (kişi başı)"
            checked={equipmentChecked['life_jacket'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, life_jacket: checked }))}
          />
          <RequiredEquipmentItem
            name="Yangın Söndürücü (2 kg)"
            checked={equipmentChecked['fire_ext_1'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, fire_ext_1: checked }))}
          />
          <RequiredEquipmentItem
            name="Çapa + Zincir/Halat"
            checked={equipmentChecked['anchor'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, anchor: checked }))}
          />
          <RequiredEquipmentItem
            name="Kürek (2 adet)"
            checked={equipmentChecked['oar'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, oar: checked }))}
          />
          <RequiredEquipmentItem
            name="Kova"
            checked={equipmentChecked['bucket'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, bucket: checked }))}
          />
          <RequiredEquipmentItem
            name="Düdük / Korna"
            checked={equipmentChecked['whistle'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, whistle: checked }))}
          />
          <RequiredEquipmentItem
            name="Seyir Fenerleri"
            checked={equipmentChecked['nav_lights'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, nav_lights: checked }))}
          />
          <RequiredEquipmentItem
            name="İlk Yardım Çantası"
            checked={equipmentChecked['first_aid'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, first_aid: checked }))}
          />
          <RequiredEquipmentItem
            name="Can Simidi + Halat"
            checked={equipmentChecked['life_ring'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, life_ring: checked }))}
          />
          <RequiredEquipmentItem
            name="El Meşalesi Kırmızı (3)"
            checked={equipmentChecked['flare_hand'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, flare_hand: checked }))}
          />
          <RequiredEquipmentItem
            name="Sintine Pompası"
            checked={equipmentChecked['bilge_pump'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, bilge_pump: checked }))}
          />
          <RequiredEquipmentItem
            name="Pusula"
            checked={equipmentChecked['compass'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, compass: checked }))}
          />
          <RequiredEquipmentItem
            name="VHF Telsiz (Kanal 16)"
            checked={equipmentChecked['vhf_radio'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, vhf_radio: checked }))}
          />
          <RequiredEquipmentItem
            name="Seyir Haritası"
            checked={equipmentChecked['nav_chart'] || false}
            onChange={(checked) => setEquipmentChecked(s => ({ ...s, nav_chart: checked }))}
          />
        </div>
      </AccordionSection>
    </div>
  )
}

function RequiredEquipmentItem({ name, checked, onChange }: { name: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-600 text-orange-500 focus:ring-offset-slate-900 cursor-pointer"
      />
      <label className="flex-1 text-slate-300 cursor-pointer">{name}</label>
    </div>
  )
}

function AccordionSection({
  title,
  expanded,
  onToggle,
  children,
  trailing,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors text-left"
      >
        <h3 className="text-orange-400 font-semibold text-sm tracking-wide">{title}</h3>
        <div className="flex items-center gap-3">
          {trailing && <span>{trailing}</span>}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
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

function StatBox({ value, label, color, textColor, isText = false }: { value: number | string; label: string; color: string; textColor: string; isText?: boolean }) {
  return (
    <div className={`px-4 py-3 rounded-lg border ${color}`}>
      <div className={`${isText ? 'text-lg' : 'text-2xl'} font-bold ${textColor}`}>{value}</div>
      <div className={`text-xs ${textColor} opacity-70`}>{label}</div>
    </div>
  )
}

function FilterChip({ label, value, active, onClick, color = 'from-slate-600 to-slate-700' }: { label: string; value: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
        active
          ? `bg-gradient-to-r ${color} text-white border border-white/30 shadow-lg`
          : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  )
}

function ItemCard({ item, moduleKey, config, onEdit, onDelete, onToggle, onView }: { item: ModuleItem; moduleKey: string; config: any; onEdit: () => void; onDelete: () => void; onToggle: () => void; onView?: () => void }) {
  const getStatusColor = (status: string) => {
    if (['open', 'planned', 'active'].includes(status)) return 'bg-orange-500/20 border-orange-500/50 text-orange-400'
    if (['closed', 'completed'].includes(status)) return 'bg-green-500/20 border-green-500/50 text-green-400'
    return 'bg-blue-500/20 border-blue-500/50 text-blue-400'
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-500/20 border-red-500/50 text-red-400'
    if (severity === 'medium') return 'bg-orange-500/20 border-orange-500/50 text-orange-400'
    return 'bg-blue-500/20 border-blue-500/50 text-blue-400'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'open': 'Açık',
      'closed': 'Kapalı',
      'active': 'Aktif',
      'planned': 'Planlandı',
      'completed': 'Tamamlandı',
      'in_progress': 'Devam Ediyor',
    }
    return labels[status] || status
  }

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = { 'high': 'Kritik', 'medium': 'Orta', 'low': 'Düşük' }
    return labels[severity] || severity
  }

  const getCardBorderColor = (moduleKey: string, severity?: string) => {
    if (moduleKey === 'arizalar' && severity) {
      if (severity === 'high') return 'border-red-500/40'
      if (severity === 'medium') return 'border-orange-500/40'
      return 'border-blue-500/40'
    }
    return 'border-white/20'
  }

  const title = item.title || item.name || item.item_name || item.document_name || item.certificate_name || `Öğe ${item.id.slice(0, 8)}`
  const isClosed = item.status === 'closed' || item.status === 'completed'

  return (
    <div
      onClick={() => moduleKey === 'ustalar' && onView?.()}
      className={`rounded-xl border p-4 transition-all ${
        isClosed
          ? 'bg-white/5 border-white/15'
          : `bg-white/10 ${getCardBorderColor(moduleKey, item.severity)}`
      } ${moduleKey === 'ustalar' ? 'cursor-pointer hover:border-orange-500/50 hover:bg-white/15' : ''}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {moduleKey === 'arizalar' && item.severity && (
              <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(item.severity)}`}>
                {getSeverityLabel(item.severity)}
              </span>
            )}
            {item.status && (
              <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(item.status)}`}>
                {getStatusLabel(item.status)}
              </span>
            )}
          </div>
          <span className="text-white/40 text-xs whitespace-nowrap">
            {item.date_time ? new Date(item.date_time).toLocaleDateString('tr-TR') : item.date ? new Date(item.date).toLocaleDateString('tr-TR') : item.created_at ? new Date(item.created_at).toLocaleDateString('tr-TR') : ''}
          </span>
        </div>

        <h4 className={`text-base font-semibold ${isClosed ? 'text-white/60' : 'text-white'}`}>{title}</h4>

        {moduleKey === 'ustalar' && (
          <div className="text-white/70 text-sm space-y-1">
            {item.specialty && <p>{item.specialty}</p>}
            <div className="flex items-center gap-3 flex-wrap">
              {item.phone && <span>📱 {item.phone}</span>}
              {item.email && <span>✉️ {item.email}</span>}
            </div>
            {item.is_global && item.avg_rating !== undefined && (
              <div className="flex items-center gap-2">
                <span>⭐ {item.avg_rating.toFixed(1)}</span>
                {item.review_count > 0 && <span className="text-white/50">({item.review_count} değerlendirme)</span>}
              </div>
            )}
          </div>
        )}

        {item.description && moduleKey !== 'ustalar' && (
          <p className="text-white/60 text-sm line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-white/40 space-x-3 flex flex-wrap gap-2">
            {item.location && <span>📍 {item.location}</span>}
            {item.cost && <span>₺ {item.cost}</span>}
            {item.amount && <span>₺ {item.amount}</span>}
            {item.quantity && <span>Miktar: {item.quantity}</span>}
          </div>
          <div className="flex gap-2">
            {(moduleKey === 'arizalar' || moduleKey === 'rota') && (
              <button onClick={onToggle} className="p-2 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white">
                {item.status === 'open' || item.status === 'active' ? '✓' : '↻'}
              </button>
            )}
            {moduleKey === 'ustalar' && item.is_global ? (
              <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${
                item.is_user_registered
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                  : 'text-orange-400 bg-orange-500/10 border border-orange-500/30'
              }`}>
                {item.is_user_registered ? '👤 Kullanıcı' : '🌍 Global'}
              </div>
            ) : (
              <>
                <button onClick={onEdit} className="p-2 hover:bg-white/10 rounded transition-colors text-orange-400 hover:text-orange-300">
                  <Edit2 size={16} />
                </button>
                <button onClick={onDelete} className="p-2 hover:bg-white/10 rounded transition-colors text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EditFormModal({ item, moduleKey, config, formData, onFormChange, onSave, onCancel, isSaving, boatId }: { item: ModuleItem | null; moduleKey: string; config: any; formData: Record<string, any>; onFormChange: (data: Record<string, any>) => void; onSave: () => void; onCancel: () => void; isSaving: boolean; boatId: string }) {
  const router = useRouter()
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [masters, setMasters] = useState<Array<{ name: string; id?: string }>>([])
  const [masterSearch, setMasterSearch] = useState('')
  const [showMasterModal, setShowMasterModal] = useState(false)
  const [masterModalSearch, setMasterModalSearch] = useState('')

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        console.log('Fetching masters for boat:', boatId)

        // Tekneye özel ustalar
        const { data: boatMasters, error: error1 } = await supabase
          .from('boat_masters')
          .select('name, id, specialty, phone, email')
          .eq('boat_id', boatId)
          .order('name', { ascending: true })

        // Global "Usta Bul" listesi (kayıtlı olan)
        const { data: globalMasters, error: error2 } = await supabase
          .from('master_profiles')
          .select('id, name, categories, phone, email, avg_rating, review_count')
          .or(`listed_publicly.eq.true,listed_publicly.is.null`)
          .order('name', { ascending: true })

        console.log('Boat masters:', boatMasters, 'Global masters:', globalMasters)

        if (error1) console.error('Boat masters error:', error1)
        if (error2) console.error('Global masters error:', error2)

        // Tekne ustalarını önce, sonra global listesini ekle (duplikasyonu önle)
        const transformedGlobal = (globalMasters || []).map((gm: any) => ({
          id: gm.id,
          name: gm.name,
          specialty: Array.isArray(gm.categories) ? gm.categories.join(', ') : gm.categories,
          phone: gm.phone,
          email: gm.email,
          avg_rating: gm.avg_rating,
          review_count: gm.review_count,
          is_global: true,
        }))

        const allMasters = [
          ...(boatMasters || []),
          ...transformedGlobal.filter(
            gm => !(boatMasters || []).some(bm => bm.name === gm.name)
          )
        ]

        setMasters(allMasters)
      } catch (err) {
        console.error('Usta listesi yükleme hatası:', err)
        setMasters([])
      }
    }

    if (boatId) {
      fetchMasters()
    }
  }, [boatId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingField(fieldKey)
    try {
      const file = files[0]
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')

      // Determine folder based on field and module
      let folder = 'boat_files'
      if (fieldKey === 'image_url' || moduleKey === 'fotograflar') {
        folder = 'boat_photos'
      } else if (fieldKey === 'file_url' || moduleKey === 'belgeler') {
        folder = 'boat_documents'
      } else if (moduleKey === 'crew' || moduleKey === 'ustalar') {
        folder = 'crew-masters'
      }

      const filePath = `${folder}/${moduleKey}/${timestamp}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('boat_images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('boat_images')
        .getPublicUrl(filePath)

      onFormChange({ ...formData, [fieldKey]: data.publicUrl })
    } catch (err) {
      alert('Dosya yükleme hatası: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'))
    } finally {
      setUploadingField(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/benim-teknelerim/${boatId}`)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Geri
            </button>
            <h2 className="text-2xl font-bold text-white">{item ? 'Düzenle' : 'Yeni Kayıt'}</h2>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-700 rounded transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {config.fields.map((field: any) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
              {field.type === 'file' ? (
                <div className="space-y-2">
                  {formData[field.key] && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-600">
                      <Image
                        src={formData[field.key]}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 cursor-pointer hover:border-orange-500 transition-colors text-sm">
                      {uploadingField === field.key ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-orange-500 rounded-full animate-spin" />
                          Yükleniyor...
                        </span>
                      ) : (
                        <span>Dosya Seç</span>
                      )}
                      <input
                        type="file"
                        accept={field.key === 'file_url' || moduleKey === 'belgeler' ? '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png' : 'image/*'}
                        onChange={(e) => handleFileUpload(e, field.key)}
                        className="hidden"
                        disabled={uploadingField !== null}
                      />
                    </label>
                    {formData[field.key] && (
                      <input
                        type="text"
                        value={formData[field.key]}
                        onChange={(e) => onFormChange({ ...formData, [field.key]: e.target.value })}
                        placeholder="veya URL girin"
                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm"
                      />
                    )}
                  </div>
                  {!formData[field.key] && (
                    <input
                      type="text"
                      value=""
                      onChange={(e) => onFormChange({ ...formData, [field.key]: e.target.value })}
                      placeholder="veya URL girin"
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm"
                    />
                  )}
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => onFormChange({ ...formData, [field.key]: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  rows={3}
                  placeholder={field.label}
                />
              ) : field.type === 'master_select' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={formData[field.key] ? formData[field.key] : 'Usta seçmek için tıkla...'}
                    value={formData[field.key] || ''}
                    onClick={() => setShowMasterModal(true)}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterModal(true)}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Usta Seç
                  </button>
                  {masters.length === 0 && (
                    <p className="text-xs text-slate-400">
                      Usta bulunamadı. Ustalar sekmesine giderek tekneye usta ekleyiniz.
                    </p>
                  )}
                </div>
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => onFormChange({ ...formData, [field.key]: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Seçiniz</option>
                  {field.key === 'status' && moduleKey === 'bilgiler' && [
                    { value: 'active', label: 'Aktif' },
                    { value: 'maintenance', label: 'Bakımda' },
                    { value: 'inactive', label: 'Pasif' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'severity' && [
                    { value: 'low', label: 'Düşük' },
                    { value: 'medium', label: 'Orta' },
                    { value: 'high', label: 'Yüksek' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'status' && moduleKey === 'arizalar' && [
                    { value: 'open', label: 'Açık' },
                    { value: 'in_progress', label: 'Devam Ediyor' },
                    { value: 'closed', label: 'Kapalı' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'status' && moduleKey === 'rota' && [
                    { value: 'planned', label: 'Planlandı' },
                    { value: 'active', label: 'Aktif' },
                    { value: 'completed', label: 'Tamamlandı' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'status' && moduleKey === 'bakim' && [
                    { value: 'pending', label: 'Beklemede' },
                    { value: 'done', label: 'Tamamlandı' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'category' && moduleKey === 'isler' && [
                    { value: 'hull_repair', label: 'Gövde Tamiri' },
                    { value: 'engine', label: 'Motor-Mekanik' },
                    { value: 'electrical', label: 'Elektrik' },
                    { value: 'paint', label: 'Boya & Pasta' },
                    { value: 'flooring', label: 'Döşeme & Branda' },
                    { value: 'deck', label: 'Güverte Donanım' },
                    { value: 'chrome', label: 'Krom İşleri' },
                    { value: 'furniture', label: 'Mobilya & İç' },
                    { value: 'sailing', label: 'Yelken & Arma' },
                    { value: 'land', label: 'Kara Bakımı' },
                    { value: 'turnkey', label: 'Anahtar Teslim' },
                    { value: 'other', label: 'Diğer' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'category' && moduleKey === 'harcamalar' && [
                    { value: 'maintenance', label: 'Bakım' },
                    { value: 'fuel', label: 'Yakıt' },
                    { value: 'marina', label: 'Marina' },
                    { value: 'insurance', label: 'Sigorta' },
                    { value: 'equipment', label: 'Ekipman' },
                    { value: 'repair', label: 'Tamir' },
                    { value: 'other', label: 'Diğer' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'role' && [
                    { value: 'captain', label: 'Kaptan' },
                    { value: 'first_officer', label: 'Yardımcı Kaptan' },
                    { value: 'deck_officer', label: 'Güverte Subayı' },
                    { value: 'crew', label: 'Mürettebat' },
                    { value: 'guest', label: 'Misafir' },
                    { value: 'other', label: 'Diğer' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'category' && moduleKey === 'ekipmanlar' && [
                    { value: 'navigation', label: 'Navigasyon' },
                    { value: 'safety', label: 'Emniyet' },
                    { value: 'engine', label: 'Motor' },
                    { value: 'electrical', label: 'Elektrik' },
                    { value: 'deck', label: 'Güverte' },
                    { value: 'communication', label: 'Haberleşme' },
                    { value: 'diving', label: 'Dalış' },
                    { value: 'other', label: 'Diğer' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'category' && moduleKey === 'envanter' && [
                    { value: 'safety', label: 'Emniyet' },
                    { value: 'fuel_oil', label: 'Yakıt & Yağ' },
                    { value: 'electrical', label: 'Elektrik' },
                    { value: 'tools', label: 'Takım' },
                    { value: 'cleaning', label: 'Temizlik' },
                    { value: 'food', label: 'Gıda' },
                    { value: 'first_aid', label: 'İlk Yardım' },
                    { value: 'parts', label: 'Parça' },
                    { value: 'other', label: 'Diğer' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'category' && moduleKey === 'belgeler' && [
                    { value: 'license', label: 'Ruhsat' },
                    { value: 'insurance', label: 'Sigorta' },
                    { value: 'warranty', label: 'Garanti' },
                    { value: 'invoice', label: 'Fatura' },
                    { value: 'technical', label: 'Teknik Belge' },
                    { value: 'contract', label: 'Sözleşme' },
                    { value: 'other', label: 'Diğer' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  {field.key === 'type' && moduleKey === 'adb' && [
                    { value: 'adb', label: 'ADB' },
                    { value: 'patent', label: 'Patent' },
                    { value: 'vhf', label: 'VHF' },
                    { value: 'cmas', label: 'CMAS (Dalış)' },
                    { value: 'other', label: 'Diğer' },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => onFormChange({ ...formData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder={field.label}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button onClick={onCancel} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
            İptal
          </button>
        </div>
      </div>

      {showMasterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800/95 border border-slate-700 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="border-b border-slate-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Usta Seç</h3>
                <button
                  onClick={() => {
                    setShowMasterModal(false)
                    setMasterModalSearch('')
                  }}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Usta ara..."
                value={masterModalSearch}
                onChange={(e) => setMasterModalSearch(e.target.value)}
                autoFocus
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>

            <div className="overflow-y-auto flex-1">
              {masters.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <p>Usta bulunamadı</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {masters
                    .filter(m => {
                      const query = masterModalSearch.toLowerCase()
                      const name = (m.name || '').toLowerCase()
                      const specialty = (m.specialty || '').toLowerCase()
                      const phone = (m.phone || '').toLowerCase()
                      return name.includes(query) || specialty.includes(query) || phone.includes(query)
                    })
                    .map(master => (
                      <button
                        key={master.id || master.name}
                        onClick={() => {
                          onFormChange({ ...formData, [config.fields.find(f => f.type === 'master_select').key]: master.name })
                          setShowMasterModal(false)
                          setMasterModalSearch('')
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-orange-500 text-white transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{master.name}</div>
                            {master.specialty && <div className="text-xs text-slate-400">{master.specialty}</div>}
                            {master.phone && <div className="text-xs text-slate-500">{master.phone}</div>}
                          </div>
                          {master.is_global && master.avg_rating !== undefined && (
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              <span className="text-xs text-orange-400">⭐</span>
                              <span className="text-xs text-orange-400 font-medium">{master.avg_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📭</div>
      <p className="text-slate-400 mb-6">Henüz kayıt bulunmamaktadır</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
      >
        <Plus size={18} />
        Yeni Kayıt Ekle
      </button>
    </div>
  )
}
