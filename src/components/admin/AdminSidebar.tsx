'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, FileText, Award, MessageSquare, AlertCircle,
  BarChart3, Settings, LogOut, ChevronRight
} from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/listings', label: 'Listings', icon: FileText },
    { href: '/admin/masters', label: 'Masters', icon: Award },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { href: '/admin/moderation', label: 'Moderation', icon: AlertCircle },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col sticky top-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
            <span className="text-orange-400 font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-white">Naviva Admin</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mx-3 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-all mb-1 ${
                active
                  ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            // TODO: Handle logout
            window.location.href = '/giris'
          }}
          className="w-full px-4 py-2 rounded-lg flex items-center gap-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
