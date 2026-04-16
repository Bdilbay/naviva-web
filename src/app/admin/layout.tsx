'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Menu, X, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/giris?redirect=/admin')
        return
      }

      // Check user roles from user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .in('role', ['admin', 'moderator', 'support'])

      // User must have at least one of: admin, moderator, or support role
      if (!roleData || roleData.length === 0) {
        router.push('/')
        return
      }

      // Get the first/primary role for display
      const userRole = roleData[0]?.role || 'user'

      setUser(session.user)
      setRole(userRole)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/giris')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        {/* Logo/Brand */}
        <div className="h-16 border-b border-slate-700 flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="text-white font-bold text-lg">Admin</div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-sm"
          >
            <span>📊</span>
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-sm"
          >
            <span>👥</span>
            {sidebarOpen && <span className="font-medium">Users</span>}
          </Link>
          <Link
            href="/admin/listings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-sm"
          >
            <span>📋</span>
            {sidebarOpen && <span className="font-medium">Listings</span>}
          </Link>
          <Link
            href="/admin/masters"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-sm"
          >
            <span>🏅</span>
            {sidebarOpen && <span className="font-medium">Masters</span>}
          </Link>

          {/* Divider */}
          {sidebarOpen && <div className="my-2 h-px bg-slate-700"></div>}

          <Link
            href="/admin/messages"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-purple-500/10 hover:text-purple-400 transition-colors text-sm"
          >
            <span>💬</span>
            {sidebarOpen && <span className="font-medium">Messages</span>}
          </Link>
          <Link
            href="/admin/moderation"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
          >
            <span>🚨</span>
            {sidebarOpen && <span className="font-medium">Moderation</span>}
          </Link>

          {/* Divider */}
          {sidebarOpen && <div className="my-2 h-px bg-slate-700"></div>}

          <Link
            href="/admin/banners"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-sm"
          >
            <span>📺</span>
            {sidebarOpen && <span className="font-medium">Reklam Alanları</span>}
          </Link>

          {/* Divider */}
          {sidebarOpen && <div className="my-2 h-px bg-slate-700"></div>}

          <Link
            href="/admin/stats"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-sm"
          >
            <span>📈</span>
            {sidebarOpen && <span className="font-medium">Reports</span>}
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-sm"
          >
            <span>⚙️</span>
            {sidebarOpen && <span className="font-medium">Settings</span>}
          </Link>
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-700 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={16} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          <h1 className="text-white font-semibold text-lg">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">
              {user?.email} • {role === 'admin' ? 'Admin' : role === 'moderator' ? 'Moderatör' : 'Destek'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-slate-900">
          {children}
        </div>
      </main>
    </div>
  )
}
