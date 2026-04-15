'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

interface UserInfo {
  id: string
  email: string
  verified: boolean
  createdAt: string
}

interface StatsInfo {
  total: number
  verified: number
  unverified: number
  users: UserInfo[]
}

export default function AuthSetupPage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<StatsInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Admin token'ı .env'den al (güvenlik amaçlı hardcode yapma)
  const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || ''

  const fetchUserStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/activate-users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Hata oluştu')
      }

      setStats(data.stats)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const activateAllUsers = async () => {
    if (!confirm('Tüm deactive kullanıcıları aktif hale getirmek istediğinizden emin misiniz?')) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/activate-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          sendMagicLinks: false,
          userEmails: [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Aktivasyon başarısız')
      }

      setSuccess(`✓ ${data.activated} kullanıcı aktif hale getirildi`)
      await fetchUserStats()
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" style={{ paddingTop: "104px" }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Authentication Setup</h1>
        <p className="text-slate-400">Kullanıcı kimlik doğrulaması ayarları</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-red-400">Hata</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-green-400">Başarılı</p>
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-0.5 rounded-xl">
            <div className="bg-slate-800 rounded-xl p-6">
              <p className="text-slate-400 text-sm mb-2">Toplam Kullanıcılar</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
          </div>

          {/* Verified */}
          <div className="bg-gradient-to-br from-green-600 to-green-400 p-0.5 rounded-xl">
            <div className="bg-slate-800 rounded-xl p-6">
              <p className="text-slate-400 text-sm mb-2">Doğrulanmış</p>
              <p className="text-3xl font-bold text-white">{stats.verified}</p>
            </div>
          </div>

          {/* Unverified */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-400 p-0.5 rounded-xl">
            <div className="bg-slate-800 rounded-xl p-6">
              <p className="text-slate-400 text-sm mb-2">Doğrulanmamış</p>
              <p className="text-3xl font-bold text-white">{stats.unverified}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex gap-4 mb-12">
        <button
          onClick={fetchUserStats}
          disabled={loading}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading && <Loader className="inline mr-2 animate-spin" size={16} />}
          İstatistikleri Yenile
        </button>

        <button
          onClick={activateAllUsers}
          disabled={loading}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading && <Loader className="inline mr-2 animate-spin" size={16} />}
          Tüm Kullanıcıları Aktif Et
        </button>
      </div>

      {/* Users Table */}
      {stats && stats.users && stats.users.length > 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">E-posta</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Durum</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map(user => (
                  <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-slate-200">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.verified
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {user.verified ? '✓ Doğrulandı' : 'Beklemede'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Instructions */}
      {!stats && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-slate-500" size={32} />
          <p className="text-slate-400 mb-6">Kullanıcı istatistiklerini görmek için aşağıdaki butona tıkla</p>
          <button
            onClick={fetchUserStats}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
          >
            İstatistikleri Yükle
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-12 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3">Nasıl Çalışır?</h3>
        <ul className="text-blue-300 text-sm space-y-2">
          <li>✓ "Tüm Kullanıcıları Aktif Et" butonuna tıkla</li>
          <li>✓ Doğrulanmamış kullanıcılar email verification olmadan aktif hale gelir</li>
          <li>✓ Kullanıcılar artık email/password veya magic link ile giriş yapabilir</li>
          <li>✓ İstatistikleri görmek için "İstatistikleri Yenile" butonunu kullan</li>
        </ul>
      </div>
    </div>
  )
}
