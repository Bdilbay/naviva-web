'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, AlertCircle, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Boat {
  id: string
  name: string
  type: string
  year?: number
  length_m?: number
  image_url?: string
  status: string
}

interface Module {
  key: string
  name: string
  icon: string
  description: string
  section: 'fixed' | 'maintenance' | 'equipment'
}

function getModules(t: any): Module[] {
  const m = t.boats.modules
  return [
    // Fixed top row
    { key: 'bilgiler', icon: '📋', section: 'fixed', ...m.bilgiler },
    { key: 'arizalar', icon: '⚠️', section: 'fixed', ...m.arizalar },
    { key: 'gunluk', icon: '📖', section: 'fixed', ...m.gunluk },
    { key: 'rota', icon: '🗺️', section: 'fixed', ...m.rota },
    // Bakım & Servis section
    { key: 'bakim', icon: '🛠️', section: 'maintenance', ...m.bakim },
    { key: 'isler', icon: '✅', section: 'maintenance', ...m.isler },
    { key: 'harcamalar', icon: '💰', section: 'maintenance', ...m.harcamalar },
    { key: 'kondisyon', icon: '📊', section: 'maintenance', ...m.kondisyon },
    // Tekne & Donanım section
    { key: 'crew', icon: '👥', section: 'equipment', ...m.crew },
    { key: 'ustalar', icon: '🔧', section: 'equipment', ...m.ustalar },
    { key: 'ekipmanlar', icon: '⚙️', section: 'equipment', ...m.ekipmanlar },
    { key: 'envanter', icon: '📦', section: 'equipment', ...m.envanter },
    { key: 'fotograflar', icon: '📸', section: 'equipment', ...m.fotograflar },
    { key: 'belgeler', icon: '📄', section: 'equipment', ...m.belgeler },
    { key: 'adb', icon: '🎖️', section: 'equipment', ...m.adb },
  ]
}

export default function BoatDetailPage() {
  const router = useRouter()
  const params = useParams()
  const boatId = params.id as string
  const { t } = useLanguage()

  const [boat, setBoat] = useState<Boat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [maintenanceOpen, setMaintenanceOpen] = useState(false)
  const [equipmentOpen, setEquipmentOpen] = useState(true)

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
          .select('id, name, type, year, length_m, image_url, status')
          .eq('id', boatId)
          .eq('user_id', session.user.id)
          .single()

        if (fetchError) throw fetchError
        if (!data) throw new Error('Tekne bulunamadı')

        setBoat(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Tekne yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchBoat()
  }, [boatId, router])

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
        <div className="max-w-6xl mx-auto">
          <Link href="/benim-teknelerim"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors mb-4">
            <ArrowLeft size={18} />
            ← Teknelerime Dön
          </Link>
          <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error || 'Tekne bulunamadı'}</p>
          </div>
        </div>
      </div>
    )
  }

  const modules = getModules(t)
  const fixedModules = modules.filter(m => m.section === 'fixed')
  const maintenanceModules = modules.filter(m => m.section === 'maintenance')
  const equipmentModules = modules.filter(m => m.section === 'equipment')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8" style={{ paddingTop: '104px' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <Link href="/benim-teknelerim"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
              <ArrowLeft size={18} />
              Teknelerime Dön
            </Link>
            <button
              onClick={() => router.push(`/benim-teknelerim/${boatId}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
              <Edit2 size={18} />
              {t.boats.editButtonHeader}
            </button>
          </div>

          {/* Boat Banner */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
              {/* Boat Image */}
              <div className="md:col-span-1">
                {boat.image_url ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={boat.image_url}
                      alt={boat.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">⛵</span>
                  </div>
                )}
              </div>

              {/* Boat Info */}
              <div className="md:col-span-2">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-white mb-2">{boat.name}</h1>
                  <p className="text-slate-400 text-lg">{boat.type}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {boat.year && (
                    <div>
                      <p className="text-slate-400 text-sm">Yapım Yılı</p>
                      <p className="text-white font-semibold">{boat.year}</p>
                    </div>
                  )}
                  {boat.length_m && (
                    <div>
                      <p className="text-slate-400 text-sm">Uzunluk</p>
                      <p className="text-white font-semibold">{boat.length_m}m</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-400 text-sm">Durum</p>
                    <p className="text-white font-semibold capitalize">
                      {boat.status === 'active' ? '✅ Aktif' : boat.status === 'maintenance' ? '🔧 Bakım Yapılıyor' : '❌ Pasif'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Modules Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">{t.boats.basicModules}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fixedModules.map(module => (
              <Link
                key={module.key}
                href={`/benim-teknelerim/${boatId}/${module.key}`}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
              >
                <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">
                  {module.icon}
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{module.name}</h3>
                <p className="text-sm text-slate-400">{module.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Maintenance & Service Section */}
        <div className="mb-8">
          <button
            onClick={() => setMaintenanceOpen(!maintenanceOpen)}
            className="w-full flex items-center justify-between p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all mb-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛠️</span>
              <h2 className="text-2xl font-bold text-white">{t.boats.maintenanceService}</h2>
            </div>
            {maintenanceOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {maintenanceOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {maintenanceModules.map(module => (
                <Link
                  key={module.key}
                  href={`/benim-teknelerim/${boatId}/${module.key}`}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 hover:bg-slate-800 transition-all group"
                >
                  <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">
                    {module.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">{module.name}</h3>
                  <p className="text-sm text-slate-400">{module.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Equipment & Documentation Section */}
        <div className="mb-8">
          <button
            onClick={() => setEquipmentOpen(!equipmentOpen)}
            className="w-full flex items-center justify-between p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all mb-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-2xl font-bold text-white">{t.boats.boatEquipment}</h2>
            </div>
            {equipmentOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {equipmentOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {equipmentModules.map(module => (
                <Link
                  key={module.key}
                  href={`/benim-teknelerim/${boatId}/${module.key}`}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 hover:bg-slate-800 transition-all group"
                >
                  <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">
                    {module.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-1 group-hover:text-green-400 transition-colors">{module.name}</h3>
                  <p className="text-sm text-slate-400">{module.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
