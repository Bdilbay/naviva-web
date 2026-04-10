'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Bell, Lock, Database, Trash2 } from 'lucide-react'

interface SystemSetting {
  id: string
  key: string
  value: string
  description: string
  type: 'text' | 'number' | 'boolean'
}

interface ContentPolicy {
  id: string
  title: string
  description: string
  enabled: boolean
  severity: 'low' | 'medium' | 'high'
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [policies, setPolicies] = useState<ContentPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'general' | 'policies' | 'database'>('general')
  const [newPolicyTitle, setNewPolicyTitle] = useState('')
  const [newPolicyDescription, setNewPolicyDescription] = useState('')

  useEffect(() => {
    fetchSettings()
    fetchPolicies()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')

      if (error) throw error

      setSettings(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setLoading(false)
    }
  }

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('content_policies')
        .select('*')

      if (error) throw error

      setPolicies(data || [])
    } catch (error) {
      console.error('Error fetching policies:', error)
    }
  }

  const handleUpdateSetting = async (settingId: string, newValue: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: newValue })
        .eq('id', settingId)

      if (error) throw error

      setSettings(settings.map(s =>
        s.id === settingId ? { ...s, value: newValue } : s
      ))
    } catch (error) {
      console.error('Error updating setting:', error)
      alert('Ayar güncellenirken hata oluştu')
    }
  }

  const handleTogglePolicy = async (policyId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('content_policies')
        .update({ enabled: !enabled })
        .eq('id', policyId)

      if (error) throw error

      setPolicies(policies.map(p =>
        p.id === policyId ? { ...p, enabled: !p.enabled } : p
      ))
    } catch (error) {
      console.error('Error updating policy:', error)
      alert('İlke güncellenirken hata oluştu')
    }
  }

  const handleAddPolicy = async () => {
    if (!newPolicyTitle.trim() || !newPolicyDescription.trim()) {
      alert('Başlık ve açıklamayı giriniz')
      return
    }

    try {
      const { data, error } = await supabase
        .from('content_policies')
        .insert({
          title: newPolicyTitle,
          description: newPolicyDescription,
          enabled: true,
          severity: 'medium',
        })
        .select()

      if (error) throw error

      if (data) {
        setPolicies([...policies, data[0]])
        setNewPolicyTitle('')
        setNewPolicyDescription('')
      }
    } catch (error) {
      console.error('Error adding policy:', error)
      alert('İlke eklenirken hata oluştu')
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Bu ilkeyi silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('content_policies')
        .delete()
        .eq('id', policyId)

      if (error) throw error

      setPolicies(policies.filter(p => p.id !== policyId))
    } catch (error) {
      console.error('Error deleting policy:', error)
      alert('İlke silinirken hata oluştu')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings size={28} className="text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Sistem Ayarları</h1>
        </div>
        <p className="text-slate-400">Platform genelindeki ayarları ve ilkeleri yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings size={18} />
          Genel Ayarlar
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock size={18} />
          İçerik İlkeleri
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'database'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database size={18} />
          Veritabanı
        </button>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {loading ? (
            <p className="text-slate-400">Yükleniyor...</p>
          ) : settings.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
              <p className="text-slate-400">Ayar bulunamadı</p>
            </div>
          ) : (
            settings.map(setting => (
              <div
                key={setting.id}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"
              >
                <label className="block text-sm font-semibold text-white mb-2">
                  {setting.key}
                </label>
                <p className="text-sm text-slate-400 mb-4">{setting.description}</p>

                {setting.type === 'boolean' ? (
                  <button
                    onClick={() =>
                      handleUpdateSetting(setting.id, setting.value === 'true' ? 'false' : 'true')
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      setting.value === 'true'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {setting.value === 'true' ? 'Açık' : 'Kapalı'}
                  </button>
                ) : (
                  <input
                    type={setting.type}
                    value={setting.value}
                    onChange={(e) => handleUpdateSetting(setting.id, e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Content Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-8">
          {/* Add New Policy */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Yeni İlke Ekle</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Başlık
                </label>
                <input
                  type="text"
                  value={newPolicyTitle}
                  onChange={(e) => setNewPolicyTitle(e.target.value)}
                  placeholder="Ör: Çocukları koruma..."
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={newPolicyDescription}
                  onChange={(e) => setNewPolicyDescription(e.target.value)}
                  placeholder="İlke açıklaması..."
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  rows={3}
                />
              </div>

              <button
                onClick={handleAddPolicy}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                İlke Ekle
              </button>
            </div>
          </div>

          {/* Policies List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Mevcut İlkeler</h2>

            {policies.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
                <p className="text-slate-400">İlke bulunamadı</p>
              </div>
            ) : (
              policies.map(policy => (
                <div
                  key={policy.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{policy.title}</h3>
                    <p className="text-slate-400 text-sm mb-3">{policy.description}</p>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        policy.severity === 'high'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : policy.severity === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {policy.severity === 'high' ? 'YÜKSEK' : policy.severity === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleTogglePolicy(policy.id, policy.enabled)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        policy.enabled
                          ? 'bg-green-600/30 text-green-400 hover:bg-green-600/50'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {policy.enabled ? 'Deaktif Et' : 'Aktif Et'}
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600/30 text-red-400 hover:bg-red-600/50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Veritabanı Yönetimi</h3>
                <p className="text-slate-400 text-sm">Sistem veritabanı işlemlerini yönetin</p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 rounded-lg font-medium transition-colors text-left">
                📊 Veritabanı İstatistikleri
              </button>

              <button className="w-full px-4 py-3 bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 rounded-lg font-medium transition-colors text-left">
                💾 Yedek Oluştur
              </button>

              <button className="w-full px-4 py-3 bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-600/30 rounded-lg font-medium transition-colors text-left">
                🔄 Temizlik Çalıştır
              </button>

              <button className="w-full px-4 py-3 bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 rounded-lg font-medium transition-colors text-left">
                🗑️ Silinmiş Verileri Temizle
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Son Aktivite</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>✓ Son yedek: 2 saat önce</p>
              <p>✓ Temizlik: Dün 23:45</p>
              <p>✓ Silinen veriler: 156 kayıt</p>
              <p>✓ Sistem sağlık: Normal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
