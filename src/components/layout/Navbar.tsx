'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, Heart, Settings, MessageSquare, Ship, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { t, lang, setLang } = useLanguage()
  const router = useRouter()

  const loadUnreadCount = async (userId: string) => {
    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)

      if (!conversations) {
        setUnreadCount(0)
        return
      }

      let total = 0
      for (const conv of conversations) {
        const { data: messages } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .eq('is_read', false)

        if (messages) {
          total += messages.length
        }
      }
      setUnreadCount(total)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      try {
        const res = await fetch('/api/auth/check-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
        const result = await res.json()
        setIsAdmin(result.isAdmin ?? false)
      } catch (error) {
        console.error('Failed to check admin status:', error)
        setIsAdmin(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user?.id) {
        checkAdminStatus(session.user.id)
        loadUnreadCount(session.user.id)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.id) {
        checkAdminStatus(session.user.id)
        loadUnreadCount(session.user.id)
      } else {
        setIsAdmin(false)
        setUnreadCount(0)
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Polling for unread count when user is logged in
  useEffect(() => {
    if (!user?.id) return

    // Load immediately
    loadUnreadCount(user.id)

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      loadUnreadCount(user.id)
    }, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [user?.id])

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user?.id) return

    // Unsubscribe from any existing channel first
    supabase.removeAllChannels()

    const channel = supabase
      .channel('messages-navbar')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('New message received:', payload)
          // Recalculate unread count immediately
          loadUnreadCount(user.id)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || t.nav.myProfile

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - 2x larger */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/naviva-logo.png" alt="Naviva" width={220} height={72} className="h-16 w-auto" priority />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop nav - all items on the right */}
          <nav className="hidden md:flex items-center gap-3 ml-auto">
            {/* Browse & Explore */}
            <Link href="/market"
              className="text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 transition-colors">
              İlanları İncele
            </Link>
            <Link href="/#carousel"
              className="text-slate-300 hover:text-orange-400 text-sm font-medium px-3 py-1.5 transition-colors">
              Güvenilir Ustalar
            </Link>
            <Link href="/ustalar"
              className="text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 transition-colors">
              Usta Bul
            </Link>

            {/* Separator - before user links */}
            {user && <div className="w-px h-4 bg-slate-700" />}

            {/* My Listings & Boats */}
            {user && (
              <>
                <Link href="/benim-ilanlarim"
                  className="text-slate-300 hover:text-orange-400 text-sm font-medium px-3 py-1.5 transition-colors">
                  İlanlarım
                </Link>
                <Link href="/benim-teknelerim"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 text-sm font-medium px-3 py-1.5 transition-colors">
                  <Ship className="w-4 h-4" />
                  Teknelerim
                </Link>
              </>
            )}

            {/* Separator 1 */}
            <div className="w-px h-4 bg-slate-700" />

            {/* Favorites & Messages - only if logged in */}
            {user && (
              <>
                <Link href="/favorilerim"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-red-400 text-sm font-medium px-3 py-1.5 transition-colors">
                  <Heart className="w-4 h-4" />
                  Favorilerim
                </Link>
                <Link href="/duyurular"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-yellow-400 text-sm font-medium px-3 py-1.5 transition-colors">
                  <Bell className="w-4 h-4" />
                  Duyurular
                </Link>
                <Link href="/mesajlar"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-pink-400 text-sm font-medium px-3 py-1.5 transition-colors relative">
                  <MessageSquare className="w-4 h-4" />
                  Mesajlar
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 transition-colors">
                    <User className="w-4 h-4" />
                    {displayName}
                  </button>
                  <div className="absolute right-0 mt-0 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                    {isAdmin && (
                      <>
                        <Link href="/admin"
                          className="flex items-center gap-2 text-slate-300 hover:text-orange-400 text-sm px-4 py-2 transition-colors hover:bg-slate-700/50 w-full">
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Link>
                        <div className="border-t border-slate-700/50 my-1" />
                      </>
                    )}
                    <Link href="/ayarlar"
                      className="flex items-center gap-2 text-slate-300 hover:text-white text-sm px-4 py-2 transition-colors hover:bg-slate-700/50 w-full">
                      <Settings className="w-4 h-4" />
                      Ayarlarım
                    </Link>
                    <button onClick={handleSignOut}
                      className="flex items-center gap-2 text-slate-400 hover:text-orange-400 text-sm px-4 py-2 transition-colors hover:bg-slate-700/50 w-full text-left">
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Auth Links - only if NOT logged in */}
            {!user && (
              <>
                <Link href="/giris" className="text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 transition-colors">
                  {t.nav.login}
                </Link>
                <Link href="/uye-ol"
                  className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  {t.nav.register}
                </Link>
              </>
            )}

            {/* Separator 2 */}
            <div className="w-px h-4 bg-slate-700" />

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
              title={lang === 'tr' ? 'Switch to English' : "Türkçe'ye geç"}
            >
              {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-slate-300 hover:text-white ml-4">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900">
          <div className="px-4 py-4 space-y-1">
            {/* Browse & Explore */}
            <Link href="/market" onClick={() => setOpen(false)}
              className="block text-slate-300 hover:text-white text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-slate-800">
              İlanları İncele
            </Link>
            <Link href="/#carousel" onClick={() => setOpen(false)}
              className="block text-slate-300 hover:text-orange-400 text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-slate-800">
              Güvenilir Ustalar
            </Link>
            <Link href="/ustalar" onClick={() => setOpen(false)}
              className="block text-slate-300 hover:text-white text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-slate-800">
              Usta Bul
            </Link>

            {/* Separator - before user links */}
            {user && <div className="my-2 h-px bg-slate-700" />}

            {/* User Links - only if logged in */}
            {user && (
              <>
                <Link href="/benim-ilanlarim" onClick={() => setOpen(false)}
                  className="block text-slate-300 hover:text-orange-400 text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-slate-800">
                  İlanlarım
                </Link>
                <Link href="/benim-teknelerim" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-slate-300 text-sm py-2 px-2 hover:text-blue-400">
                  <Ship className="w-4 h-4" />
                  Teknelerim
                </Link>

                {/* Separator 2 */}
                <div className="my-2 h-px bg-slate-700" />

                <Link href="/favorilerim" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-slate-300 text-sm py-2 px-2 hover:text-red-400">
                  <Heart className="w-4 h-4" />
                  Favorilerim
                </Link>
                <Link href="/mesajlar" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-slate-300 text-sm py-2 px-2 hover:text-pink-400 relative">
                  <MessageSquare className="w-4 h-4" />
                  Mesajlar
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full ml-auto">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="border-t border-slate-700/50 my-2 pt-2">
                  {isAdmin && (
                    <>
                      <Link href="/admin" onClick={() => setOpen(false)}
                        className="flex items-center gap-2 text-slate-300 text-sm py-2 px-2 hover:text-orange-400">
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                      <div className="border-t border-slate-700/50 my-1" />
                    </>
                  )}
                  <Link href="/ayarlar" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-slate-300 text-sm py-2 px-2 hover:bg-slate-700/50 rounded-lg">
                    <Settings className="w-4 h-4" />
                    Ayarlarım
                  </Link>
                  <button onClick={() => { handleSignOut(); setOpen(false) }}
                    className="flex items-center gap-2 text-slate-400 hover:text-orange-400 text-sm py-2 px-2 text-left w-full hover:bg-slate-700/50 rounded-lg">
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </button>
                </div>
              </>
            )}

            {/* Auth Links - only if NOT logged in */}
            {!user && (
              <>
                <Link href="/giris" onClick={() => setOpen(false)} className="block text-slate-300 text-sm py-2.5 px-2 rounded-lg hover:bg-slate-800">
                  {t.nav.login}
                </Link>
                <Link href="/uye-ol" onClick={() => setOpen(false)}
                  className="block bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center">
                  {t.nav.register}
                </Link>
              </>
            )}

            {/* Separator 3 + Language toggle */}
            <div className="pt-2 mt-2 border-t border-slate-700/50">
              <button
                onClick={() => { setLang(lang === 'tr' ? 'en' : 'tr'); setOpen(false) }}
                className="flex items-center gap-2 text-slate-400 text-sm py-2 px-2 w-full hover:text-white">
                {lang === 'tr' ? '🇬🇧 English' : '🇹🇷 Türkçe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
