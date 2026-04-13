'use client'

import Link from 'next/link'
import { Anchor } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import BannerSlot from '@/components/BannerSlot'

export default function Footer() {
  const { t } = useLanguage()

  const platformLinks = [
    { href: '/market', label: t.footer.listings },
    { href: '/ustalar', label: t.footer.masterGuide },
    { href: '/market?kategori=satilik', label: t.footer.saleBoats },
    { href: '/market?kategori=kiralik', label: t.footer.rentalBoats },
  ]

  const accountLinks = [
    { href: '/giris', label: t.nav.login },
    { href: '/uye-ol', label: t.nav.register },
    { href: '/uye-ol?usta=1', label: t.footer.masterReg },
  ]

  return (
    <footer className="border-t border-white/10 bg-[#0D1E2D] mt-auto">
      {/* Banner Slot - Footer */}
      <div className="border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BannerSlot position="footer" className="h-40" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#E67E22] flex items-center justify-center">
                <Anchor className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-xl">Naviva</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">{t.footer.platform}</h4>
            <ul className="space-y-2.5">
              {platformLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">{t.footer.account}</h4>
            <ul className="space-y-2.5">
              {accountLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            {t.footer.rights.replace('{year}', String(new Date().getFullYear()))}
          </p>
          <p className="text-white/30 text-xs">naviva.com.tr</p>
        </div>
      </div>
    </footer>
  )
}
