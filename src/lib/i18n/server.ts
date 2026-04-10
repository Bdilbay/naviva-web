import { cookies } from 'next/headers'
import { translations, Lang, Translations } from './index'

export async function getTranslations(): Promise<{ t: Translations; lang: Lang }> {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('naviva_lang')?.value ?? 'tr') as Lang
  const validLang = lang === 'en' ? 'en' : 'tr'
  return { t: translations[validLang], lang: validLang }
}
