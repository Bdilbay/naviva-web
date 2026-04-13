'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, AlertCircle, ChevronDown, Edit2, Save, X } from 'lucide-react'

interface Boat {
  id: string
  name: string
  type?: string
  registration_no?: string
  harbor_registration_no?: string
  image_url?: string
  year?: number
  length_m?: number
  beam_m?: number
  draft_m?: number
  engine_model?: string
  flag?: string
  status: string
  last_maintenance?: string
  home_port?: string
  captain_name?: string
  hull_material?: string
}

const MODULE_CONTENT: Record<string, { title: string; description: string }> = {
  bilgiler: {
    title: 'Genel Bilgiler',
    description: 'Teknenin temel özellikleri ve detayları'
  },
  arizalar: {
    title: 'Arıza Kayıtları',
    description: 'Teknede oluşan arızalar ve sorunlar'
  },
  gunluk: {
    title: 'Seyir Günlüğü',
    description: 'Yolculuk ve seyir notları'
  },
  rota: {
    title: 'Rota & Harita',
    description: 'Seyir rotaları ve konumlar'
  },
  bakim: {
    title: 'Bakım Planı',
    description: 'Periyodik bakım planı'
  },
  isler: {
    title: 'Yapılan İşler',
    description: 'Tamamlanan bakım ve onarım işleri'
  },
  harcamalar: {
    title: 'Harcamalar',
    description: 'Bakım ve onarım giderleri'
  },
  kondisyon: {
    title: 'Kondisyon',
    description: 'Tekne durumu ve sağlık raporları'
  },
  crew: {
    title: 'Crew',
    description: 'Gemi mürettebatı ve roller'
  },
  ustalar: {
    title: 'Ustalar',
    description: 'İlişkili ustalar ve servisler'
  },
  ekipmanlar: {
    title: 'Ekipmanlar',
    description: 'Tekne ekipmanları ve sistemleri'
  },
  envanter: {
    title: 'Envanter',
    description: 'Tekne envanteri ve malzemeleri'
  },
  fotograflar: {
    title: 'Fotoğraflar',
    description: 'Tekne fotoğraf galerisi'
  },
  belgeler: {
    title: 'Belgeler',
    description: 'Tekne belgeleri ve sertifikaları'
  },
  adb: {
    title: 'ADB/Sertifikalar',
    description: 'ADB ve diğer sertifikalar'
  },
}

export default function ModulePage() {
  const router = useRouter()
  const params = useParams()
  const boatId = params.id as string
  const moduleKey = params.module as string

  const [boat, setBoat] = useState<Boat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    identity: moduleKey === 'bilgiler',
    technical: false,
    connection: false,
  })

  const [editForm, setEditForm] = useState<Partial<Boat>>({})

  const moduleInfo = MODULE_CONTENT[moduleKey] || {
    title: 'Bilinmeyen Modül',
    description: 'Bu modül bulunamadı'
  }

  useEffect(() => {
    const fetchBoat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/giris?redirect=/benim-teknelerim')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('boats')
          .select('*')
          .eq('id', boatId)
          .eq('user_id', session.user.id)
          .single()

        if (fetchError) throw fetchError
        if (!data) throw new Error('Tekne bulunamadı')

        const boatData = data as Boat
        setBoat(boatData)
        setEditForm(boatData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Tekne yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchBoat()
  }, [boatId, router])

  const handleSave = async () => {
    if (!boat) return
    setIsSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Oturum bulunamadı')

      const { error: updateError } = await supabase
        .from('boats')
        .update(editForm)
        .eq('id', boatId)
        .eq('user_id', session.user.id)

      if (updateError) throw updateError

      setBoat(editForm as Boat)
      setIsEditing(false)
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    )
  }

  if (error || !boat) {
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
            <p className="text-red-400">{error || 'Tekne bulunamadı'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Render bilgiler (info) module with full edit support
  if (moduleKey === 'bilgiler') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/benim-teknelerim/${boatId}`}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
              <ArrowLeft size={20} />
              Tekneye Dön: {boat.name}
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{moduleInfo.title}</h1>
                <p className="text-slate-400 text-lg">{moduleInfo.description}</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
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

          {/* Boat Header Card */}
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
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {boat.year && <div><span className="text-slate-400">Yıl:</span> <span className="text-white font-semibold">{boat.year}</span></div>}
                  {boat.length_m && <div><span className="text-slate-400">Boy:</span> <span className="text-white font-semibold">{boat.length_m}m</span></div>}
                  <div><span className="text-slate-400">Durum:</span> <span className={`font-semibold ${boat.status === 'active' ? 'text-green-400' : boat.status === 'maintenance' ? 'text-orange-400' : 'text-red-400'}`}>{boat.status}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form or Display Mode */}
          {isEditing ? (
            <EditForm
              boat={editForm as Boat}
              onChange={setEditForm}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
              isSaving={isSaving}
            />
          ) : (
            <div className="space-y-4">
              {/* KİMLİK BİLGİLERİ */}
              <AccordionSection
                title="KİMLİK BİLGİLERİ"
                icon="📋"
                expanded={expandedSections.identity}
                onToggle={() => setExpandedSections(s => ({ ...s, identity: !s.identity }))}
              >
                <InfoRow icon="⛵" label="Tekne Adı" value={boat.name} />
                <InfoRow icon="🏷️" label="Tip" value={boat.type || '—'} />
                <InfoRow icon="🚩" label="Bayrak" value={boat.flag || '—'} />
                <InfoRow icon="📜" label="Ruhsat No" value={boat.registration_no || '—'} />
                <InfoRow icon="⚓" label="Liman Kayıt No" value={boat.harbor_registration_no || '—'} />
              </AccordionSection>

              {/* TEKNİK ÖZELLİKLER */}
              <AccordionSection
                title="TEKNİK ÖZELLİKLER"
                icon="⚙️"
                expanded={expandedSections.technical}
                onToggle={() => setExpandedSections(s => ({ ...s, technical: !s.technical }))}
              >
                <InfoRow icon="📅" label="Üretim Yılı" value={boat.year?.toString() || '—'} />
                <InfoRow icon="📏" label="Boy" value={boat.length_m ? `${boat.length_m}m` : '—'} />
                <InfoRow icon="↔️" label="En" value={boat.beam_m ? `${boat.beam_m}m` : '—'} />
                <InfoRow icon="💧" label="Su Kesimi" value={boat.draft_m ? `${boat.draft_m}m` : '—'} />
                <InfoRow icon="🔧" label="Gövde Malzeme" value={boat.hull_material || '—'} />
                <InfoRow icon="⚙️" label="Motor Modeli" value={boat.engine_model || '—'} />
              </AccordionSection>

              {/* BAĞLANTI */}
              <AccordionSection
                title="BAĞLANTI"
                icon="⚓"
                expanded={expandedSections.connection}
                onToggle={() => setExpandedSections(s => ({ ...s, connection: !s.connection }))}
              >
                <InfoRow icon="👤" label="Kaptan" value={boat.captain_name || '—'} />
                <InfoRow icon="⚓" label="Liman / Marina" value={boat.home_port || '—'} />
                <InfoRow icon="🔧" label="Son Bakım" value={boat.last_maintenance ? new Date(boat.last_maintenance).toLocaleDateString('tr-TR') : '—'} />
              </AccordionSection>
            </div>
          )}

          {/* Back Button */}
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
                  <p className="text-xl font-semibold text-white mb-2">Tekne bilgileri güncellendi</p>
                </div>
              </div>
            </div>
          )}

          {/* Global styles */}
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

  // All other modules - Coming Soon with edit button ready
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/benim-teknelerim/${boatId}`}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={20} />
          Tekneye Dön: {boat.name}
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">{moduleInfo.title}</h1>
        <p className="text-slate-400 text-lg mb-8">{moduleInfo.description}</p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🚀</div>
          <p className="text-slate-300 text-lg mb-6">Bu modül yakında gelecek</p>
          <p className="text-slate-400 text-sm mb-8">Mobil uygulamanızda tüm detayları görebilirsiniz.</p>
          <Link href={`/benim-teknelerim/${boatId}`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Modüllere Dön
          </Link>
        </div>
      </div>
    </div>
  )
}

// Accordion Section Component
function AccordionSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string
  icon: string
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
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-orange-400 font-semibold text-sm tracking-wide">{title}</h3>
        </div>
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

// Info Row Component
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 text-sm">
      <span className="text-lg">{icon}</span>
      <span className="text-slate-400 flex-1">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  )
}

// Edit Form Component
function EditForm({
  boat,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: {
  boat: Boat
  onChange: (data: any) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">KİMLİK BİLGİLERİ</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Tekne Adı</label>
            <input
              type="text"
              value={boat.name || ''}
              onChange={(e) => onChange({ ...boat, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Tip</label>
            <input
              type="text"
              value={boat.type || ''}
              onChange={(e) => onChange({ ...boat, type: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Bayrak</label>
            <input
              type="text"
              value={boat.flag || ''}
              onChange={(e) => onChange({ ...boat, flag: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Ruhsat No</label>
            <input
              type="text"
              value={boat.registration_no || ''}
              onChange={(e) => onChange({ ...boat, registration_no: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Liman Kayıt No</label>
            <input
              type="text"
              value={boat.harbor_registration_no || ''}
              onChange={(e) => onChange({ ...boat, harbor_registration_no: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">TEKNİK ÖZELLİKLER</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Üretim Yılı</label>
            <input
              type="number"
              value={boat.year || ''}
              onChange={(e) => onChange({ ...boat, year: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Boy (m)</label>
              <input
                type="number"
                step="0.1"
                value={boat.length_m || ''}
                onChange={(e) => onChange({ ...boat, length_m: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-2">En (m)</label>
              <input
                type="number"
                step="0.1"
                value={boat.beam_m || ''}
                onChange={(e) => onChange({ ...boat, beam_m: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-2">Su Kesimi (m)</label>
              <input
                type="number"
                step="0.1"
                value={boat.draft_m || ''}
                onChange={(e) => onChange({ ...boat, draft_m: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Gövde Malzeme</label>
            <input
              type="text"
              value={boat.hull_material || ''}
              onChange={(e) => onChange({ ...boat, hull_material: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Motor Modeli</label>
            <input
              type="text"
              value={boat.engine_model || ''}
              onChange={(e) => onChange({ ...boat, engine_model: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">BAĞLANTI</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Kaptan</label>
            <input
              type="text"
              value={boat.captain_name || ''}
              onChange={(e) => onChange({ ...boat, captain_name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Liman / Marina</label>
            <input
              type="text"
              value={boat.home_port || ''}
              onChange={(e) => onChange({ ...boat, home_port: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onSave}
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
          onClick={onCancel}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <X size={20} />
          İptal
        </button>
      </div>
    </div>
  )
}
