'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Save, Loader2, Check } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const SPECIALTIES = [
  'Motor Bakım', 'Elektrik', 'Tekne Boyama', 'Döşeme', 'Yelken Tamiri',
  'Fibreglas', 'Ahşap İşleri', 'Pervane & Dümen', 'Seyir Elektroniği',
  'Klima & Soğutma', 'Yakıt Sistemi', 'Pis Su Sistemi', 'Güverte Ekipmanı',
  'Kılavuz Kaptanlık', 'Denizcilik Eğitimi',
]

const CITIES = [
  'İstanbul', 'İzmir', 'Muğla', 'Antalya', 'Balıkesir', 'Çanakkale',
  'Mersin', 'Adana', 'Bursa', 'Tekirdağ', 'Diğer',
]

export default function UstaDuzenlePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    title: '',
    bio: '',
    photo_url: '',
    location_city: '',
    phone: '',
    email: '',
    experience_years: '',
    specialties: [] as string[],
    listed_publicly: false,
  })

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/giris?redirect=/ustalar/duzenle')
        return
      }

      const { data: profile } = await supabase
        .from('master_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        setProfileId(profile.id)
        setForm({
          full_name: profile.full_name ?? '',
          title: profile.title ?? '',
          bio: profile.bio ?? '',
          photo_url: profile.photo_url ?? '',
          location_city: profile.location_city ?? '',
          phone: profile.phone ?? '',
          email: profile.email ?? '',
          experience_years: profile.experience_years?.toString() ?? '',
          specialties: profile.specialties ?? [],
          listed_publicly: profile.listed_publicly ?? false,
        })
      } else {
        const { data: newProfile } = await supabase
          .from('master_profiles')
          .insert({
            user_id: session.user.id,
            full_name: session.user.user_metadata?.full_name ?? '',
            specialties: [],
            listed_publicly: false,
          })
          .select('id, full_name')
          .single()

        if (newProfile) {
          setProfileId(newProfile.id)
          setForm(f => ({ ...f, full_name: newProfile.full_name ?? '' }))
        }
      }

      setLoading(false)
    }
    init()
  }, [router])

  const toggleSpecialty = (s: string) => {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter(x => x !== s)
        : [...f.specialties, s],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileId) return
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('master_profiles')
      .update({
        full_name: form.full_name,
        title: form.title || null,
        bio: form.bio || null,
        photo_url: form.photo_url || null,
        location_city: form.location_city || null,
        phone: form.phone || null,
        email: form.email || null,
        experience_years: form.experience_years ? parseInt(form.experience_years) : null,
        specialties: form.specialties,
        listed_publicly: form.listed_publicly,
      })
      .eq('id', profileId)

    setSaving(false)
    if (err) {
      setError(t.masterEdit.errSave)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-24 px-4" style={{ paddingTop: '104px' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">{t.masterEdit.title}</h1>
        <p className="text-slate-400 text-sm mb-8">{t.masterEdit.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.masterEdit.basics}</h2>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">{t.masterEdit.fullName}</label>
              <input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                placeholder="Ad Soyad" />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">{t.masterEdit.titleLabel}</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                placeholder={t.masterEdit.titlePlaceholder} />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">{t.masterEdit.bio}</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none"
                placeholder={t.masterEdit.bioPlaceholder} />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">{t.masterEdit.photoUrl}</label>
              <input type="url" value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                placeholder="https://..." />
            </div>
          </section>

          {/* Uzmanlıklar */}
          <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.masterEdit.specialties}</h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map(s => (
                <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    form.specialties.includes(s)
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-slate-600 text-slate-400 hover:border-slate-400'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Konum & Deneyim */}
          <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.masterEdit.locationExp}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t.masterEdit.city}</label>
                <select value={form.location_city} onChange={e => setForm(f => ({ ...f, location_city: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                  <option value="">{t.masterEdit.select}</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t.masterEdit.expYears}</label>
                <input type="number" min={0} max={60} value={form.experience_years}
                  onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="5" />
              </div>
            </div>
          </section>

          {/* İletişim */}
          <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.masterEdit.contact}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t.masterEdit.phone}</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  placeholder={t.masterEdit.phonePlaceholder} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t.masterEdit.email}</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  placeholder={t.masterEdit.emailPlaceholder} />
              </div>
            </div>
          </section>

          {/* Görünürlük */}
          <section className="bg-slate-800/50 rounded-xl p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setForm(f => ({ ...f, listed_publicly: !f.listed_publicly }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.listed_publicly ? 'bg-orange-500' : 'bg-slate-600'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${form.listed_publicly ? 'translate-x-5' : ''}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t.masterEdit.toggleLabel}</p>
                <p className="text-xs text-slate-400">{t.masterEdit.toggleSub}</p>
              </div>
            </label>
          </section>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t.masterEdit.saving : t.masterEdit.save}
            </button>
            {profileId && (
              <button type="button" onClick={() => router.push(`/ustalar/${profileId}`)}
                className="px-6 py-3 border border-slate-600 text-slate-300 hover:text-white rounded-xl text-sm transition-colors">
                {t.masterEdit.viewProfile}
              </button>
            )}
          </div>
        </form>

        {/* Success Modal */}
        {success && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-fade-in">
              <div
                onClick={() => setSuccess(false)}
                className="bg-slate-800/95 border border-orange-500/30 rounded-2xl p-8 w-80 text-center cursor-pointer hover:border-orange-500/50 transition-all shadow-2xl"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-orange-500/20 rounded-full p-4 animate-scale-in">
                    <Check size={48} className="text-orange-400" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-white mb-2">{t.masterEdit.successSave}</p>
                <p className="text-sm text-slate-400">Kapatmak için tıklayın</p>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          .animate-scale-in { animation: scaleIn 0.4s ease-out; }
        `}</style>
      </div>
    </div>
  )
}
