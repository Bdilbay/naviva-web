'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function GirisPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError(t.login.error)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/naviva-logo.png" alt="Naviva" width={140} height={46} className="h-11 w-auto" />
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8">
          <h1 className="text-white text-xl font-bold mb-1 text-center">{t.login.title}</h1>
          <p className="text-slate-500 text-sm text-center mb-6">{t.login.subtitle}</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t.login.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder={t.login.emailPlaceholder}
                  className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 text-sm rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t.login.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder={t.login.passwordPlaceholder}
                  className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 text-sm rounded-xl pl-9 pr-10 py-3 focus:outline-none focus:border-orange-500"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2">
              {loading ? t.login.loadingText : t.login.submit}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            {t.login.noAccount}{' '}
            <Link href="/uye-ol" className="text-orange-400 hover:text-orange-300">
              {t.login.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
