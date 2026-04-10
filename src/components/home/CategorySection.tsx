'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function CategorySection({ title, count, subcategories }: {
  title: string
  count: number
  subcategories: { name: string; count: number }[]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-3 rounded-lg hover:bg-slate-800/50 transition-colors text-left group">
        <div className="flex-1">
          <p className="text-slate-200 text-sm font-semibold group-hover:text-white transition-colors">{title}</p>
          <p className="text-slate-500 text-xs">{count} ilan</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="pl-4 space-y-1 border-l border-slate-700/50 ml-2">
          {subcategories.map(sub => (
            <Link key={sub.name} href={`/market?kategori=${sub.name.toLowerCase()}`}
              className="block py-2 px-3 rounded hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm hover:text-slate-200 transition-colors">{sub.name}</span>
                <span className="text-slate-600 text-xs">({sub.count})</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
