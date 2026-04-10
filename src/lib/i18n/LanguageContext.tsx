'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { translations, Lang, Translations } from './index'

interface LangCtx {
  lang: Lang
  t: Translations
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LangCtx>({
  lang: 'tr',
  t: translations.tr,
  setLang: () => {},
})

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode
  initialLang: Lang
}) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const router = useRouter()

  // Sync with cookie on mount (in case client-side navigation changed it)
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(r => r.startsWith('naviva_lang='))
      ?.split('=')[1] as Lang | undefined
    if (cookie && (cookie === 'tr' || cookie === 'en')) {
      setLangState(cookie)
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    document.cookie = `naviva_lang=${l};path=/;max-age=31536000;SameSite=Lax`
    router.refresh()
  }

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
