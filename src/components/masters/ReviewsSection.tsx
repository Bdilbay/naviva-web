'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Star, Edit2, Trash2 } from 'lucide-react'
import ReviewForm from './ReviewForm'

interface Review {
  id: string
  masterId: string
  reviewerId: string
  reviewerName: string
  rating: number
  comment: string | null
  workCategory: string | null
  workDate: string | null
  createdAt: string
}

interface ReviewsSectionProps {
  masterId: string
  masterName?: string
}

export default function ReviewsSection({ masterId, masterName = 'Usta' }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [userReviewed, setUserReviewed] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkUser()
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [masterId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/masters/${masterId}/reviews`)
      const data = await res.json()

      if (data.success) {
        setReviews(data.reviews)

        // Check if user already reviewed
        if (user) {
          const userReview = data.reviews.find((r: Review) => r.reviewerId === user.id)
          setUserReviewed(!!userReview)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmitted = () => {
    setShowForm(false)
    setEditingReviewId(null)
    setUserReviewed(true)
    fetchReviews()
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const res = await fetch(`/api/masters/${masterId}/reviews`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ reviewId }),
      })

      if (res.ok) {
        fetchReviews()
        setUserReviewed(false)
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating - 1]++
    }
  })
  const maxCount = Math.max(...ratingCounts, 1)

  return (
    <section className="py-12 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            Değerlendirmeler ({reviews.length})
          </h2>
          {user && !userReviewed && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Yorum Bırak
            </button>
          )}
        </div>

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <div className="mb-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-white font-semibold mb-4">Puan Dağılımı</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex gap-0.5 w-12">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    {Array.from({ length: 5 - stars }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-slate-600" />
                    ))}
                  </div>
                  <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all"
                      style={{
                        width: `${(ratingCounts[stars - 1] / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-8 text-right">
                    {ratingCounts[stars - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <ReviewForm
            masterId={masterId}
            masterName={masterName}
            onClose={() => {
              setShowForm(false)
              setEditingReviewId(null)
            }}
            onSuccess={handleReviewSubmitted}
            editingReview={editingReviewId ? reviews.find(r => r.id === editingReviewId) : undefined}
          />
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="text-center text-slate-400">Yorumlar yükleniyor...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Henüz yorum yok. İlk yorumu yazan siz olun!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400 font-bold text-sm">
                        {review.reviewerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {review.reviewerName}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      {Array.from({ length: 5 - review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-slate-600"
                        />
                      ))}
                    </div>
                    {user?.id === review.reviewerId && (
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => {
                            setEditingReviewId(review.id)
                            setShowForm(true)
                          }}
                          className="p-1 hover:bg-orange-500/20 rounded transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4 text-orange-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-slate-300 text-sm mb-2">{review.comment}</p>
                )}

                <div className="flex gap-4 text-xs text-slate-400">
                  {review.workCategory && (
                    <span>📌 {review.workCategory}</span>
                  )}
                  {review.workDate && (
                    <span>📅 {new Date(review.workDate).toLocaleDateString('tr-TR')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
