import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Providers from '@/components/layout/Providers'
import type { Lang } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Naviva — Denizcilik Platformu',
  description: "Tekne ilanları, usta rehberi ve denizcilik topluluğu. Türkiye'nin denizcilik platformu.",
  keywords: 'tekne satılık, tekne kiralık, deniz ustası, marina, naviva',
  openGraph: {
    title: 'Naviva — Denizcilik Platformu',
    description: 'Tekne ilanları ve usta rehberi',
    url: 'https://naviva.com.tr',
    siteName: 'Naviva',
    locale: 'tr_TR',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang = ((cookieStore.get('naviva_lang')?.value ?? 'tr') === 'en' ? 'en' : 'tr') as Lang

  return (
    <html lang={lang} className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-[#07121C] text-white`}>
        <Providers initialLang={lang}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
