'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Heart, MapPin, Trash2, Loader2 } from 'lucide-react'

interface Favorite {
  id: string
  item_id: string
  item_type: string
  item_data?: any
  created_at: string
}

export default function FavorinesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/giris?redirect=/favorilerim')
        return
      }

      setUser(session.user)
      await fetchFavorites(session.user.id)
    }

    checkAuth()
  }, [router])

  const fetchFavorites = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setFavorites(data || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (id: string) => {
    try {
      await supabase.from('favorites').delete().eq('id', id)
      setFavorites(favorites.filter(f => f.id !== id))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            Favorilerim
          </h1>
          <p className="text-slate-400">
            {loading ? 'Yükleniyor...' : `${favorites.length} öğe kaydedildi`}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-6">Henüz favori eklemedin</p>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Market'te Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(favorite => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                onRemove={() => removeFavorite(favorite.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FavoriteCard({
  favorite,
  onRemove,
}: {
  favorite: Favorite
  onRemove: () => void
}) {
  const [itemData, setItemData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        let data
        if (favorite.item_type === 'listing') {
          const { data: listingData } = await supabase
            .from('listings')
            .select('*')
            .eq('id', favorite.item_id)
            .single()
          data = listingData
        } else if (favorite.item_type === 'boat') {
          const { data: boatData } = await supabase
            .from('boats')
            .select('*')
            .eq('id', favorite.item_id)
            .single()
          data = boatData
        }
        setItemData(data)
      } catch (error) {
        console.error('Error fetching item:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItemData()
  }, [favorite])

  if (loading || !itemData) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-64 animate-pulse" />
    )
  }

  const photo = itemData.photos?.[0] || itemData.photo_url
  const title = itemData.title || itemData.name
  const price = itemData.price
  const location = itemData.location_city

  return (
    <div className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all">
      {/* Image */}
      <Link href={favorite.item_type === 'listing' ? `/market/${itemData.id}` : `#`}>
        <div className="h-40 bg-slate-700 relative overflow-hidden">
          {photo ? (
            <Image
              src={photo}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              📷
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={favorite.item_type === 'listing' ? `/market/${itemData.id}` : `#`}>
          <h3 className="text-white font-semibold line-clamp-2 hover:text-orange-400">
            {title}
          </h3>
        </Link>

        {location && (
          <p className="text-slate-400 text-sm flex items-center gap-1 mt-2">
            <MapPin className="w-3 h-3" />
            {location}
          </p>
        )}

        {price && (
          <p className="text-orange-400 font-bold text-sm mt-2">
            {typeof price === 'number' ? `₺${price.toLocaleString('tr-TR')}` : price}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
