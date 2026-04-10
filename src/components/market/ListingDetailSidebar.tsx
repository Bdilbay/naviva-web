'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, Mail, Heart, Check, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Listing } from '@/types'
import type { Translations } from '@/lib/i18n'

interface ListingDetailSidebarProps {
  listing: Listing
  t: Translations
  lang: string
}

export default function ListingDetailSidebar({ listing, t, lang }: ListingDetailSidebarProps) {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messagingLoading, setMessagingLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleSendMessage = async () => {
    if (!user) {
      window.location.href = '/giris'
      return
    }

    if (user.id === listing.user_id) {
      setToast({ message: 'Kendi ilanınıza mesaj gönderemezsiniz', type: 'info' })
      return
    }

    setMessagingLoading(true)
    try {
      // Create or get conversation with listing owner
      const response = await fetch('/api/admin/create-listing-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: user.id,
          seller_id: listing.user_id,
          listing_id: listing.id,
          listing_title: listing.title,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setToast({ message: 'Mesaj penceresine yönlendiriliyorsunuz...', type: 'success' })
        setTimeout(() => router.push('/mesajlar'), 800)
      } else {
        setToast({ message: result.error || 'Hata oluştu', type: 'info' })
      }
    } catch (error) {
      console.error('Message error:', error)
      setToast({ message: 'Mesaj gönderilirken hata oluştu', type: 'info' })
    } finally {
      setMessagingLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      window.location.href = '/giris'
      return
    }

    setLoading(true)
    setToast({ message: t.market.addingToFavorites, type: 'info' })

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', listing.id)
          .eq('item_type', 'listing')
        setIsFavorited(false)
        setToast({ message: t.market.removedFromFavorites, type: 'success' })
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          item_id: listing.id,
          item_type: 'listing',
        })
        setIsFavorited(true)
        setToast({ message: t.market.addedToFavorites, type: 'success' })
      }
    } catch (error) {
      setToast({ message: t.market.errorFavoriting || 'Bir hata oluştu', type: 'success' })
    } finally {
      setLoading(false)
    }
  }

  const price = listing.price
    ? (() => {
        const sym = listing.price_unit === 'EUR' ? '€' : listing.price_unit === 'USD' ? '$' : '₺'
        const amt = listing.price % 1 === 0 ? listing.price.toLocaleString('tr-TR') : listing.price.toFixed(2)
        const periods: Record<string, string> = lang === 'en'
          ? { per_day: '/day', per_hour: '/hr', per_person: '/person' }
          : { per_day: '/gün', per_hour: '/saat', per_person: '/kişi' }
        return `${sym}${amt}${periods[listing.price_period] ?? ''}`
      })()
    : t.marketDetail.priceAsk

  const addedDate = new Date(listing.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'tr-TR')
  const memberDate = t.marketDetail.addedOn.replace('{date}', addedDate)

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 sticky top-20">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className="text-orange-400 text-3xl font-bold">{price}</p>
            {listing.boat_year && (
              <p className="text-slate-500 text-sm mt-1">{listing.boat_year} {t.marketDetail.model}</p>
            )}
          </div>
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="flex-shrink-0 p-2.5 rounded-lg hover:bg-slate-700/50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-orange-400 border-r-transparent rounded-full animate-spin" />
            ) : (
              <Heart className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            )}
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSendMessage}
            disabled={messagingLoading}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
            <MessageCircle className="w-4 h-4" />
            {messagingLoading ? 'Yönlendiriliyorsunuz...' : 'Mesaj Gönder'}
          </button>
          {listing.contact_phone && (
            <a href={`tel:${listing.contact_phone}`}
              className="flex items-center gap-3 w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
              <Phone className="w-4 h-4" />
              {listing.contact_phone}
            </a>
          )}
          {listing.contact_email && (
            <a href={`mailto:${listing.contact_email}`}
              className="flex items-center gap-3 w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
              <Mail className="w-4 h-4" />
              {t.marketDetail.sendEmail}
            </a>
          )}
          {!listing.contact_phone && !listing.contact_email && (
            <Link href="/giris"
              className="flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-3 rounded-xl transition-colors text-sm">
              {t.marketDetail.loginToContact}
            </Link>
          )}
        </div>

        {(listing.available_from || listing.available_to) && (
          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <p className="text-slate-500 text-xs mb-2">{t.marketDetail.availability}</p>
            <p className="text-slate-300 text-sm">
              {listing.available_from} — {listing.available_to ?? '...'}
            </p>
          </div>
        )}

        <p className="text-slate-600 text-xs mt-4 text-center">{memberDate}</p>
      </div>

      {toast && (
        <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-500/90' : 'bg-blue-500/90'
        } text-white text-sm font-medium shadow-lg z-50`}>
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-white border-r-transparent animate-spin" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  )
}
