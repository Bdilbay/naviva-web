'use client'

import { useEffect, useState } from 'react'
import { Search, Trash2, Shield, Ship, ShoppingCart, MessageSquare } from 'lucide-react'

interface UserDetail {
  id: string
  email: string
  created_at: string
  boats_count: number
  listings_count: number
  conversations_count: number
  messages_count: number
  master_profiles_count: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'master' | 'super_admin' | 'moderator'>('all')

  useEffect(() => {
    fetchUsers()
  }, [filterRole])

  const fetchUsers = async () => {
    try {
      // Use server-side API instead of direct Supabase access
      const response = await fetch('/api/admin/get-users')

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users')
      }

      setUsers(result.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı KALICI olarak silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Silme başarısız')
      }

      setUsers(users.filter(u => u.id !== userId))
      alert('Kullanıcı ve tüm ilişkili veriler silindi')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`Kullanıcı silinirken hata oluştu: ${error}`)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} className="text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Kullanıcılar</h1>
        </div>
        <p className="text-slate-400">Platformdaki tüm kullanıcıları yönetin</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="E-posta ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tüm Roller</option>
          <option value="user">Kullanıcı</option>
          <option value="master">Usta</option>
          <option value="moderator">Moderatör</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-700/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">E-posta</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  <div className="flex items-center justify-center gap-1">
                    <Ship size={14} />
                    Tekneler
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  <div className="flex items-center justify-center gap-1">
                    <ShoppingCart size={14} />
                    İlanlar
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare size={14} />
                    Mesajlar
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Katılım</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Kullanıcı bulunamadı
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-slate-200">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-300 font-medium">{user.boats_count}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-300 font-medium">{user.listings_count}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-slate-300 font-medium">{user.messages_count}</span>
                        {user.conversations_count > 0 && (
                          <span className="text-xs text-slate-500">({user.conversations_count})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-600/30 text-red-400 hover:bg-red-600/50 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
