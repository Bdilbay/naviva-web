'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, Heart, Settings, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { t, lang, setLang } = useLanguage()
  const router = useRouter()

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
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.id) {
        checkAdminStatus(session.user.id)
      } else {
        setIsAdmin(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || t.nav.myProfile

  const navLinks = [
    { href: '/market', label: t.nav.listings },
    { href: '/ustalar', label: t.nav.masters },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/naviva-logo.png" alt="Naviva" width={110} height={36} className="h-9 w-auto" priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth + Lang toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
              title={lang === 'tr' ? 'Switch to English' : "Türkçe'ye geç"}
            >
              {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </button>

            {user ? (
              <>
                <Link href="/favorilerim"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-red-400 text-sm font-medium px-3 py-1.5 transition-colors">
                  <Heart className="w-4 h-4" />
                  Favorilerim
                </Link>
                <Link href="/mesajlar"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-pink-400 text-sm font-medium px-3 py-1.5 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Mesajlar
                </Link>
                <Link href="/benim-ilanlarim"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-orange-400 text-sm font-medium px-3 py-1.5 transition-colors">
                  Benim İlanlarım
                </Link>
                <div className="w-px h-4 bg-slate-700" />
                <div className="relative group">
                  <button
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 transition-colors">
                    <User className="w-4 h-4" />
                    {displayName}
                  </button>
                  <div className="absolute right-0 mt-0 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
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
            ) : (
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

            {/* Admin Link */}
            {user && isAdmin && (
              <Link href="/admin"
                className="flex items-center gap-1.5 text-slate-300 hover:text-orange-400 text-sm font-medium px-3 py-1.5 transition-colors border border-slate-700 hover:border-orange-500 rounded-lg">
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-slate-300 hover:text-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block text-slate-300 hover:text-white text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-slate-800">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-700/50 flex flex-col gap-2 mt-2">
              {/* Language toggle mobile */}
              <button
                onClick={() => { setLang(lang === 'tr' ? 'en' : 'tr'); setOpen(false) }}
                className="flex items-center gap-2 text-slate-400 text-sm py-2 px-2"
              >
                {lang === 'tr' ? '🇬🇧 Switch to English' : '🇹🇷 Türkçeye Geç'}
              </button>
              {user ? (
                <>
                  <Link href="/favorilerim" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-slate-300 text-sm py-2 px-2 hover:text-red-400">
                    <Heart className="w-4 h-4" />
                    Favorilerim
                  </Link>
                  <Link href="/mesajlar" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-slate-300 text-sm py-2 px-2 hover:text-pink-400">
                    <MessageSquare className="w-4 h-4" />
                    Mesajlar
                  </Link>
                  <Link href="/benim-ilanlarim" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-slate-300 text-sm py-2 px-2 hover:text-orange-400">
                    Benim İlanlarım
                  </Link>
                  <div className="border-t border-slate-700/50 my-2 pt-2 mt-2">
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
              ) : (
                <>
                  <Link href="/giris" onClick={() => setOpen(false)} className="text-slate-300 text-sm py-2 px-2">
                    {t.nav.login}
                  </Link>
                  <Link href="/uye-ol" onClick={() => setOpen(false)}
                    className="bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center">
                    {t.nav.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
