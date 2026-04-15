'use client'

import { useMemo } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { getRequiredEquipment, groupEquipmentByCategory } from '@/lib/boatEquipment'

interface RequiredEquipmentDisplayProps {
  boatLength?: number | string
  hasEngineRoom?: boolean
}

export function RequiredEquipmentDisplay({ boatLength, hasEngineRoom = false }: RequiredEquipmentDisplayProps) {
  const length = typeof boatLength === 'string' ? parseFloat(boatLength) : boatLength || 0

  const equipment = useMemo(() => {
    if (!length || length <= 0) return []
    return getRequiredEquipment(length, hasEngineRoom)
  }, [length, hasEngineRoom])

  const groupedEquipment = useMemo(() => {
    return groupEquipmentByCategory(equipment)
  }, [equipment])

  if (!length || length <= 0) {
    return null
  }

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Emniyet': 'bg-red-500/10 border-red-500/30 text-red-300',
      'Navigasyon': 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      'Sinyal': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
      'Gözlem': 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      'Haberleşme': 'bg-orange-500/10 border-orange-500/30 text-orange-300',
      'Yangın Güvenliği': 'bg-red-600/10 border-red-600/30 text-red-300',
    }
    return colors[category] || 'bg-slate-700/20 border-slate-600/30 text-slate-300'
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 mt-8">
      <div className="flex items-start gap-3 mb-6">
        <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-white font-semibold mb-1">
            {length.toFixed(1)} Metre Tekne - Zorunlu Ekipmanlar (2026)
          </h3>
          <p className="text-slate-400 text-sm">
            2026 Türkiye Amatör Denizcilik Yönetmeliğine göre bulundurulması zorunlu ekipmanlar
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedEquipment).map(([category, items]) => (
          <div key={category}>
            <div className={`px-3 py-2 rounded-lg border mb-3 ${getCategoryColor(category)}`}>
              <h4 className="font-semibold text-sm">{category}</h4>
            </div>

            <div className="space-y-2 ml-2">
              {items.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-300 text-xs">
          ⚠️ <strong>Ceza:</strong> Her bir metre için 1.000 TL idari para cezası uygulanır.
          {length.toFixed(0)} metrelik bir teknede ekipman eksikliği halinde {(parseFloat(length.toFixed(0)) * 1000).toLocaleString('tr-TR')} TL ceza uygulanabilir.
        </p>
      </div>
    </div>
  )
}
