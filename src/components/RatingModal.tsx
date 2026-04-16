'use client'

import { useState, useEffect } from 'react'
import { Star, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface RatingModalProps {
  masterId: string
  masterName: string
  boatId: string
  onClose: () => void
  onSuccess: () => void
}

export function RatingModal({ masterId, masterName, boatId, onClose, onSuccess }: RatingModalProps) {
  const [rating, setRating] = useState(5)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  useEffect(() => {
    console.log('🎯 RatingModal opened for:', { masterId, masterName, boatId })
    return () => console.log('❌ RatingModal closed')
  }, [masterId, masterName, boatId])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        alert('Lütfen giriş yapın')
        return
      }

      console.log('💾 Saving rating:', { masterId, masterName, rating, boatId })

      // First try to find or create master profile
      let finalMasterId = masterId

      // If masterId is not a UUID (it's a name), look it up or create it
      if (!masterId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('🔍 Looking up master by name:', masterId)

        // Try to find existing master
        const { data: existingMaster } = await supabase
          .from('master_profiles')
          .select('id')
          .or(`full_name.ilike.%${masterId}%,name.ilike.%${masterId}%`)
          .limit(1)

        if (existingMaster && existingMaster.length > 0) {
          finalMasterId = existingMaster[0].id
          console.log('✅ Found existing master:', finalMasterId)
        } else {
          // Master not found - skip rating for unpublished masters
          console.log('⚠️ Master not in published list, skipping rating')
          alert(`"${masterName}" ainda não está na lista "Usta Bul".\n\nPara avaliar um usta, ele precisa estar publicado na lista.`)
          onClose()
          return
        }
      }

      // Now save the rating with valid master UUID
      const { error, data } = await supabase.from('master_ratings').upsert({
        master_id: finalMasterId,
        user_id: session.user.id,
        boat_id: boatId,
        rating,
        notes: notes || null,
      }, {
        onConflict: 'master_id,user_id,boat_id'
      })

      console.log('📊 Response:', { error, data })

      if (error) {
        console.error('❌ Rating save error:', error)
        throw new Error(`Puanlama kaydedilemedi: ${error.message || 'Bilinmeyen hata'}`)
      }

      console.log('✅ Rating saved successfully')
      alert('Puanlama kaydedildi! ⭐')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('❌ Rating error:', error)
      alert(error instanceof Error ? error.message : 'Puanlama kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-white font-bold">{masterName} Değerlendir</h3>
            <p className="text-slate-400 text-sm mt-1">İş kalitesini değerlendirin</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Star Rating */}
          <div className="mb-6">
            <label className="text-slate-300 text-sm font-semibold mb-3 block">Yıldız Değerlendirmesi</label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1
                const isFilled = starValue <= (hoveredRating ?? rating)
                return (
                  <button
                    key={i}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isFilled
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
            <p className="text-slate-500 text-xs mt-2">
              {rating === 5 && 'Mükemmel! ⭐⭐⭐⭐⭐'}
              {rating === 4 && 'Çok iyi 😊'}
              {rating === 3 && 'İyi'}
              {rating === 2 && 'Geliştirebilir'}
              {rating === 1 && 'Kötü 😟'}
            </p>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="text-slate-300 text-sm font-semibold mb-2 block">Yorum (İsteğe Bağlı)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="İş hakkında düşüncelerinizi paylaşın..."
              className="w-full bg-slate-700/50 border border-slate-600 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 placeholder-slate-500 resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {saving ? 'Kaydediliyor...' : 'Gönder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
