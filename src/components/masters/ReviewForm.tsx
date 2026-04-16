'use client'

import { useState } from 'react'
import { X, Star, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Review {
  id: string
  rating: number
  comment: string | null
  workCategory: string | null
  workDate: string | null
}

interface ReviewFormProps {
  masterId: string
  masterName: string
  onClose: () => void
  onSuccess: () => void
  editingReview?: Review
}

export default function ReviewForm({
  masterId,
  masterName,
  onClose,
  onSuccess,
  editingReview,
}: ReviewFormProps) {
  const [rating, setRating] = useState(editingReview?.rating || 0)
  const [comment, setComment] = useState(editingReview?.comment || '')
  const [category, setCategory] = useState(editingReview?.workCategory || '')
  const [workDate, setWorkDate] = useState(editingReview?.workDate || '')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEditing = !!editingReview

  const categories = [
    'Motor/Mekanik',
    'Elektrik',
    'Tekne İşleri',
    'Boya/Kaplama',
    'Diğer',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Lütfen puan seçin')
      return
    }

    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError('Yorum yazmak için giriş yapmalısınız')
        setLoading(false)
        return
      }

      const payload = isEditing
        ? {
            reviewId: editingReview.id,
            rating,
            comment: comment.trim() || null,
            workCategory: category || null,
            workDate: workDate || null,
            isAnonymous,
          }
        : {
            rating,
            comment: comment.trim() || null,
            workCategory: category || null,
            workDate: workDate || null,
            isAnonymous,
          }

      console.log('Submitting review:', { masterId, payload, method: isEditing ? 'PUT' : 'POST' })

      const res = await fetch(`/api/masters/${masterId}/reviews`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      console.log('API Response:', { status: res.status, data })

      if (!res.ok) {
        setError(data.error || 'Yorum gönderilemedi')
        return
      }

      onSuccess()
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">
            {isEditing ? `${masterName} - Yorumu Düzenle` : `${masterName} için Yorum`}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error message */}
          {error && (
            <div className="flex gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-white font-medium text-sm mb-3">
              Puan
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      i <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-white font-medium text-sm mb-2">
              Yorum (opsiyonel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Deneyiminizi anlatın..."
              maxLength={500}
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <p className="text-slate-500 text-xs mt-1">
              {comment.length} / 500
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-white font-medium text-sm mb-2">
              İş Kategorisi (opsiyonel)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Kategori seçin</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Work Date */}
          <div>
            <label className="block text-white font-medium text-sm mb-2">
              İş Tarihi (opsiyonel)
            </label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Anonymous */}
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="anonymous" className="text-white text-sm cursor-pointer">
              Anonim yorum yap (adınız gösterilmeyecek)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading
                ? isEditing
                  ? 'Güncelleniyor...'
                  : 'Gönderiliyor...'
                : isEditing
                ? 'Yorumu Güncelle'
                : 'Yorumu Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
