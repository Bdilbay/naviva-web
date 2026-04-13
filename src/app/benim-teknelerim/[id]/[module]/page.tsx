'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, AlertCircle } from 'lucide-react'

interface Boat {
  id: string
  name: string
  boat_type: string
}

const MODULE_CONTENT: Record<string, { title: string; description: string; content: string }> = {
  bilgiler: {
    title: 'Genel Bilgiler',
    description: 'Teknenin temel özellikleri ve detayları',
    content: 'Tekne bilgileri modülü yakında gelecek.'
  },
  arizalar: {
    title: 'Arıza Kayıtları',
    description: 'Teknede oluşan arızalar ve sorunlar',
    content: 'Arıza kayıtları modülü yakında gelecek.'
  },
  gunluk: {
    title: 'Seyir Günlüğü',
    description: 'Yolculuk ve seyir notları',
    content: 'Seyir günlüğü modülü yakında gelecek.'
  },
  rota: {
    title: 'Rota & Harita',
    description: 'Seyir rotaları ve konumlar',
    content: 'Rota ve harita modülü yakında gelecek.'
  },
  bakim: {
    title: 'Bakım Planı',
    description: 'Periyodik bakım planı',
    content: 'Bakım planı modülü yakında gelecek.'
  },
  isler: {
    title: 'Yapılan İşler',
    description: 'Tamamlanan bakım ve onarım işleri',
    content: 'Yapılan işler modülü yakında gelecek.'
  },
  harcamalar: {
    title: 'Harcamalar',
    description: 'Bakım ve onarım giderleri',
    content: 'Harcamalar modülü yakında gelecek.'
  },
  kondisyon: {
    title: 'Kondisyon',
    description: 'Tekne durumu ve sağlık raporları',
    content: 'Kondisyon modülü yakında gelecek.'
  },
  crew: {
    title: 'Crew',
    description: 'Gemi mürettebatı ve roller',
    content: 'Crew modülü yakında gelecek.'
  },
  ustalar: {
    title: 'Ustalar',
    description: 'İlişkili ustalar ve servisler',
    content: 'Ustalar modülü yakında gelecek.'
  },
  ekipmanlar: {
    title: 'Ekipmanlar',
    description: 'Tekne ekipmanları ve sistemleri',
    content: 'Ekipmanlar modülü yakında gelecek.'
  },
  envanter: {
    title: 'Envanter',
    description: 'Tekne envanteri ve malzemeleri',
    content: 'Envanter modülü yakında gelecek.'
  },
  fotograflar: {
    title: 'Fotoğraflar',
    description: 'Tekne fotoğraf galerisi',
    content: 'Fotoğraf galerisi modülü yakında gelecek.'
  },
  belgeler: {
    title: 'Belgeler',
    description: 'Tekne belgeleri ve sertifikaları',
    content: 'Belgeler modülü yakında gelecek.'
  },
  adb: {
    title: 'ADB/Sertifikalar',
    description: 'ADB ve diğer sertifikalar',
    content: 'ADB/Sertifikalar modülü yakında gelecek.'
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

  const moduleInfo = MODULE_CONTENT[moduleKey] || {
    title: 'Bilinmeyen Modül',
    description: 'Bu modül bulunamadı',
    content: 'İstenen modül mevcut değil.'
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
          .select('id, name, boat_type')
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

          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{moduleInfo.title}</h1>
            <p className="text-slate-400 text-lg">{moduleInfo.description}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">🚀</div>
          <p className="text-slate-300 text-lg mb-6">
            {moduleInfo.content}
          </p>
          <p className="text-slate-400 text-sm">
            Bu modül zaman içinde uygulanacak ve tüm işlevler eklenecektir.
          </p>
        </div>

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
      </div>
    </div>
  )
}
