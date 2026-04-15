'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Settings, User, Lock, LogOut, ArrowLeft } from 'lucide-react'

interface UserProfile {
  email: string
  full_name: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    full_name: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/giris?redirect=/ayarlar')
        return
      }

      setProfile({
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || '',
      })
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name },
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Profil güncellenirken hata oluştu' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!newPassword.trim()) {
      setMessage({ type: 'error', text: 'Yeni şifre giriniz' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır' })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi' })
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Şifre değiştirilirken hata oluştu' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return
    }

    if (!confirm('Tekrar onaylayın - hesabınız ve tüm verileri KALICI olarak silinecek')) {
      return
    }

    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user.id) {
        // Delete user data from public tables first
        await supabase.from('listings').delete().eq('user_id', session.user.id)
        await supabase.from('boats').delete().eq('user_id', session.user.id)
        await supabase.from('master_profiles').delete().eq('user_id', session.user.id)
      }

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(session?.user.id || '')

      if (error) throw error

      // Sign out and redirect
      await supabase.auth.signOut()
      router.push('/')
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Hesap silinirken hata oluştu' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center pt-16">
        <p className="text-slate-400">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-12" style={{ paddingTop: "104px" }}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={32} className="text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Ayarlarım</h1>
          </div>
          <p className="text-slate-400">Hesap ayarlarınızı yönetin</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Şifre
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'danger'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Güvenlik
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Email (Read-only) */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-2">E-posta değiştirilemez</p>
            </div>

            {/* Full Name */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Adınız Soyadınız"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Şifreyi Onayla
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifreyi tekrar giriniz"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Değiştiriliyorş...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'danger' && (
          <div className="space-y-6">
            {/* Logout */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Tüm Cihazlardan Çıkış</h3>
              <p className="text-slate-400 text-sm mb-4">Tüm aktif oturumlarınızı sonlandırır</p>
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Çıkış Yap
              </button>
            </div>

            {/* Delete Account */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Hesabı Sil</h3>
              <p className="text-slate-400 text-sm mb-4">
                Hesabınız ve tüm ilişkili veriler (tekneler, ilanlar, profil) kalıcı olarak silinecek. Bu işlem geri alınamaz.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={saving}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Siliniyor...' : 'Hesabı Kalıcı Olarak Sil'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
