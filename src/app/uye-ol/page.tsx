'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, Anchor } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function UyeOlPage() {
  return <Suspense fallback={<div className="pt-16 min-h-screen bg-slate-900" />}><UyeOlContent /></Suspense>
}

function UyeOlContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()
  const isMaster = searchParams.get('usta') === '1'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [asMaster, setAsMaster] = useState(isMaster)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpErr) {
      setError(signUpErr.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create user profile entry
      try {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          avatar_url: null,
        })
      } catch (err) {
        console.error('Profile creation error:', err)
        // Don't fail signup if profile creation fails
      }

      // Create master profile if signing up as master
      if (asMaster) {
        try {
          await supabase.from('master_profiles').insert({
            user_id: data.user.id,
            full_name: fullName,
            specialties: [],
            listed_publicly: false,
          })
        } catch (err) {
          console.error('Master profile creation error:', err)
        }
      }
    }

    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="pt-16 min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <Anchor className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">{t.register.successTitle}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">{t.register.successMsg}</p>
          <Link href="/giris"
            className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            {t.register.loginLink}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/naviva-logo.png" alt="Naviva" width={140} height={46} className="h-11 w-auto" />
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8">
          <h1 className="text-white text-xl font-bold mb-1 text-center">{t.register.title}</h1>
          <p className="text-slate-500 text-sm text-center mb-6">{t.register.subtitle}</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t.register.fullName}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder={t.register.fullNamePlaceholder}
                  className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 text-sm rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t.register.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder={t.register.emailPlaceholder}
                  className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 text-sm rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t.register.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={t.register.passwordPlaceholder}
                  className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 text-sm rounded-xl pl-9 pr-10 py-3 focus:outline-none focus:border-orange-500"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div
              onClick={() => setAsMaster(!asMaster)}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                asMaster ? 'bg-orange-500/10 border-orange-500/40' : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 border-2 transition-colors flex items-center justify-center ${
                asMaster ? 'bg-orange-500 border-orange-500' : 'border-slate-500'
              }`}>
                {asMaster && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <div>
                <p className={`text-sm font-medium ${asMaster ? 'text-orange-400' : 'text-slate-300'}`}>
                  {t.register.masterToggle}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">{t.register.masterToggleSub}</p>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              {loading ? t.register.loadingText : t.register.submit}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            {t.register.hasAccount}{' '}
            <Link href="/giris" className="text-orange-400 hover:text-orange-300">
              {t.register.loginLink}
            </Link>
          </p>
        </div>

        <p className="text-slate-600 text-xs text-center mt-5 leading-relaxed">
          {t.register.termsText}{' '}
          <Link href="/gizlilik" className="hover:text-slate-500">{t.register.privacy}</Link>
          {' '}{t.register.and}{' '}
          <Link href="/kullanim" className="hover:text-slate-500">{t.register.terms}</Link>
          {t.register.termsAccept}
        </p>
      </div>
    </div>
  )
}
