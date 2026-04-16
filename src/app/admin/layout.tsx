'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Menu, X, LogOut, ArrowLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-full lg:w-64' : 'w-full lg:w-20'
      } bg-slate-800 border-r border-slate-700 lg:border-b lg:border-r transition-all duration-300 flex flex-row lg:flex-col`}>
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
        <nav className="flex-1 px-3 py-3 lg:py-6 space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-y-auto flex flex-row lg:flex-col">
          <Link
            href="/admin"
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            <span>📊</span>
            {sidebarOpen && <span className="font-medium hidden lg:inline">Dashboard</span>}
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            <span>👥</span>
            {sidebarOpen && <span className="font-medium hidden lg:inline">Users</span>}
          </Link>
          <Link
            href="/admin/listings"
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            <span>📋</span>
            {sidebarOpen && <span className="font-medium hidden lg:inline">Listings</span>}
          </Link>
          <Link
            href="/admin/masters"
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            <span>🏅</span>
            {sidebarOpen && <span className="font-medium hidden lg:inline">Masters</span>}
          </Link>

          {/* Divider */}
          {sidebarOpen && <div className="hidden lg:block my-2 h-px bg-slate-700 w-full"></div>}

          <Link
            href="/admin/messages"
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-slate-300 hover:bg-purple-500/10 hover:text-purple-400 transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            <span>💬</span>
            {sidebarOpen && <span className="font-medium hidden lg:inline">Messages</span>}
          </Link>
          <Link
            href="/admin/moderation"
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            <span>🚨</span>
            {sidebarOpen && <span className="font-medium hidden lg:inline">Moderation</span>}
          </Link>

          {/* Divider */}
          {sidebarOpen && <div className="hidden lg:block my-2 h-px bg-slate-700 w-full"></div>}

          <Link
            href="/admin/banners"
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            <span>📺</span>
            {sidebarOpen && <span className="font-medium hidden lg:inline">Reklam</span>}
          </Link>

          {/* Divider */}
          {sidebarOpen && <div className="hidden lg:block my-2 h-px bg-slate-700 w-full"></div>}

          <Link
            href="/admin/stats"
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            <span>📈</span>
            {sidebarOpen && <span className="font-medium hidden lg:inline">Reports</span>}
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            <span>⚙️</span>
            {sidebarOpen && <span className="font-medium hidden lg:inline">Settings</span>}
          </Link>
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-700 p-2 lg:p-3 hidden lg:block">
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
      <main className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="h-auto bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors font-medium text-sm"
              title="Mobil Uygulamaya Dön / Back to Mobile App"
            >
              <ArrowLeft size={18} />
              <span>Geri Dön</span>
            </button>
            <h1 className="text-white font-semibold text-lg">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-slate-400 text-sm hidden md:block">
              {user?.email} • {role === 'admin' ? 'Admin' : role === 'moderator' ? 'Moderatör' : 'Destek'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-slate-900 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
