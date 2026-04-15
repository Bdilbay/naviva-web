'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ChevronRight, ChevronLeft, Loader2, Plus, X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { ERROR_MESSAGES, handleApiError } from '@/lib/errors'

const BOAT_TYPES = [
  'Motoryat', 'Yelkenli', 'Katamaran', 'Sürat Teknesi', 'Gulet',
  'Bot', 'Sandal', 'Balıkçı Teknesi', 'Jet Ski', 'RIB',
]

const FUEL_TYPES = ['Benzin', 'Dizel', 'Elektrik', 'Hibrit', 'Yelkenli (Motor Yok)']

const CITIES = [
  'İstanbul', 'İzmir', 'Muğla', 'Antalya', 'Balıkesir', 'Çanakkale',
  'Mersin', 'Adana', 'Bursa', 'Tekirdağ', 'Diğer',
]

const PRICE_UNITS = ['TRY', 'EUR', 'USD']

const isBoatCategory = (cat: string) => cat.startsWith('boat_')

export default function YeniIlanPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [photoInput, setPhotoInput] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    price: '',
    price_unit: 'TRY',
    price_period: '',
    boat_type: '',
    boat_year: '',
    boat_length_m: '',
    boat_beam_m: '',
    boat_engine_brand: '',
    boat_engine_hp: '',
    boat_fuel_type: '',
    boat_cabin_count: '',
    boat_berth_count: '',
    boat_flag: '',
    boat_is_swappable: false,
    boat_has_flybridge: false,
    boat_condition: '',
    location_city: '',
    location_district: '',
    location_marina: '',
    contact_phone: '',
    contact_email: '',
    photos: [] as string[],
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/giris?redirect=/market/yeni')
      } else {
        setUser(session.user)
      }
    })
  }, [router])

  const set = (key: string, value: string | boolean | string[]) =>
    setForm(f => ({ ...f, [key]: value }))

  const addPhoto = () => {
    setPhotoError('')
    const url = photoInput.trim()

    if (!url) {
      setPhotoError(ERROR_MESSAGES.PHOTO.URL_INVALID)
      return
    }

    if (form.photos.includes(url)) {
      setPhotoError(ERROR_MESSAGES.PHOTO.URL_ALREADY_ADDED)
      return
    }

    // Basic URL validation
    try {
      new URL(url)
      if (!url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        setPhotoError(ERROR_MESSAGES.PHOTO.INVALID_FILE_TYPE)
        return
      }
    } catch {
      setPhotoError(ERROR_MESSAGES.PHOTO.URL_INVALID)
      return
    }

    set('photos', [...form.photos, url])
    setPhotoInput('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files || files.length === 0) return
    if (!user) {
      setPhotoError('Bu işlem için giriş yapmanız gerekir.')
      return
    }

    setPhotoError('')
    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(ERROR_MESSAGES.PHOTO.INVALID_FILE_TYPE)
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(ERROR_MESSAGES.PHOTO.FILE_TOO_LARGE)
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.id)

      const response = await fetch('/api/uploads/photo', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || ERROR_MESSAGES.PHOTO.UPLOAD_FAILED)
      }

      return result.data.url
    })

    try {
      setUploading(true)
      const uploadedUrls = await Promise.all(uploadPromises)
      set('photos', [...form.photos, ...uploadedUrls])
      // Use ref instead of e.currentTarget to avoid null reference in async context
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setPhotoError(handleApiError(err, 'Fotoğraf Yükleme'))
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (url: string) =>
    set('photos', form.photos.filter(p => p !== url))

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    // Validation
    if (!form.category) {
      setError(ERROR_MESSAGES.LISTING.CATEGORY_REQUIRED)
      setSubmitting(false)
      return
    }

    if (!form.title.trim()) {
      setError(ERROR_MESSAGES.LISTING.TITLE_REQUIRED)
      setSubmitting(false)
      return
    }

    if (form.contact_email && !form.contact_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError(ERROR_MESSAGES.LISTING.CONTACT_EMAIL_INVALID)
      setSubmitting(false)
      return
    }

    if (form.contact_phone && !form.contact_phone.match(/^[0-9\s\-\+\(\)]+$/)) {
      setError(ERROR_MESSAGES.LISTING.CONTACT_PHONE_INVALID)
      setSubmitting(false)
      return
    }

    if (form.price && isNaN(parseFloat(form.price))) {
      setError(ERROR_MESSAGES.LISTING.PRICE_INVALID)
      setSubmitting(false)
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED)
      router.push('/giris?redirect=/market/yeni')
      return
    }

    const payload = {
      user_id: session.user.id,
      category: form.category,
      title: form.title,
      description: form.description || null,
      price: form.price ? parseFloat(form.price) : null,
      price_unit: form.price_unit,
      price_period: form.price_period || null,
      photos: form.photos,
      status: 'active',
      location_city: form.location_city || null,
      location_district: form.location_district || null,
      location_marina: form.location_marina || null,
      contact_phone: form.contact_phone || null,
      contact_email: form.contact_email || null,
      ...(isBoatCategory(form.category) ? {
        boat_type: form.boat_type || null,
        boat_year: form.boat_year ? parseInt(form.boat_year) : null,
        boat_length_m: form.boat_length_m ? parseFloat(form.boat_length_m) : null,
        boat_beam_m: form.boat_beam_m ? parseFloat(form.boat_beam_m) : null,
        boat_engine_brand: form.boat_engine_brand || null,
        boat_engine_hp: form.boat_engine_hp ? parseInt(form.boat_engine_hp) : null,
        boat_fuel_type: form.boat_fuel_type || null,
        boat_cabin_count: form.boat_cabin_count ? parseInt(form.boat_cabin_count) : null,
        boat_berth_count: form.boat_berth_count ? parseInt(form.boat_berth_count) : null,
        boat_flag: form.boat_flag || null,
        boat_is_swappable: form.boat_is_swappable,
        boat_has_flybridge: form.boat_has_flybridge,
        boat_condition: form.boat_condition || null,
      } : {}),
    }

    try {
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success && result.data?.id) {
        router.push(`/market/${result.data.id}`)
      } else {
        setError(handleApiError(result.error, 'İlan Oluşturma'))
      }
    } catch (err) {
      setError(handleApiError(err, 'İlan Oluşturma'))
    } finally {
      setSubmitting(false)
    }
  }

  const CATEGORIES = [
    { key: 'boat_sale', label: t.newListing.cat_boat_sale, emoji: '⚓' },
    { key: 'boat_rent_daily', label: t.newListing.cat_boat_rent, emoji: '🚤' },
    { key: 'boat_tour', label: t.newListing.cat_boat_tour, emoji: '🌊' },
    { key: 'equipment_sale', label: t.newListing.cat_equipment, emoji: '🔧' },
  ]

  const PRICE_PERIODS = [
    { key: '', label: t.newListing.period_once },
    { key: 'per_day', label: t.newListing.period_day },
    { key: 'per_hour', label: t.newListing.period_hour },
    { key: 'per_person', label: t.newListing.period_person },
  ]

  const totalSteps = isBoatCategory(form.category) ? 3 : 2
  const stepLabels = [t.newListing.step1, t.newListing.step2, t.newListing.step3]

  return (
    <div className="min-h-screen py-24 px-4" style={{ paddingTop: '104px' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">{t.newListing.title}</h1>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step > i + 1 ? 'bg-orange-500 text-white' :
                  step === i + 1 ? 'bg-orange-500 text-white ring-2 ring-orange-300' :
                  'bg-slate-700 text-slate-400'
                }`}>{i + 1}</div>
                {i < totalSteps - 1 && (
                  <div className={`h-0.5 w-12 transition-colors ${step > i + 1 ? 'bg-orange-500' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
            <span className="ml-2 text-sm text-slate-400">{stepLabels[step - 1]}</span>
          </div>
        </div>

        {/* Adım 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.newListing.category}</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <button key={cat.key} type="button" onClick={() => set('category', cat.key)}
                    className={`p-4 rounded-xl border-2 text-left transition-colors ${
                      form.category === cat.key ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'
                    }`}>
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="text-sm font-medium text-white">{cat.label}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.newListing.basics}</h2>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.titleLabel}</label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  placeholder={t.newListing.titlePlaceholder} />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.desc}</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none"
                  placeholder={t.newListing.descPlaceholder} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.price}</label>
                  <input type="number" min={0} value={form.price} onChange={e => set('price', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.currency}</label>
                  <select value={form.price_unit} onChange={e => set('price_unit', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                    {PRICE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.period}</label>
                  <select value={form.price_period} onChange={e => set('price_period', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                    {PRICE_PERIODS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button onClick={() => {
              if (!form.category) { setError(t.newListing.errCategory); return }
              if (!form.title.trim()) { setError(t.newListing.errTitle); return }
              setError(''); setStep(isBoatCategory(form.category) ? 2 : 3)
            }}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-colors">
              {t.newListing.next} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Adım 2 */}
        {step === 2 && isBoatCategory(form.category) && (
          <div className="space-y-6">
            <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.newListing.specs}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.boatType}</label>
                  <select value={form.boat_type} onChange={e => set('boat_type', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                    <option value="">{t.newListing.select}</option>
                    {BOAT_TYPES.map(t2 => <option key={t2} value={t2}>{t2}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.modelYear}</label>
                  <input type="number" min={1950} max={new Date().getFullYear() + 1} value={form.boat_year}
                    onChange={e => set('boat_year', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="2020" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.length}</label>
                  <input type="number" step={0.1} value={form.boat_length_m} onChange={e => set('boat_length_m', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="12.5" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.beam}</label>
                  <input type="number" step={0.1} value={form.boat_beam_m} onChange={e => set('boat_beam_m', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="4.2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.engineBrand}</label>
                  <input value={form.boat_engine_brand} onChange={e => set('boat_engine_brand', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    placeholder={t.newListing.engineBrandPlaceholder} />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.engineHp}</label>
                  <input type="number" value={form.boat_engine_hp} onChange={e => set('boat_engine_hp', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.fuelType}</label>
                  <select value={form.boat_fuel_type} onChange={e => set('boat_fuel_type', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                    <option value="">{t.newListing.select}</option>
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.flag}</label>
                  <input value={form.boat_flag} onChange={e => set('boat_flag', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    placeholder={t.newListing.flagPlaceholder} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.cabins}</label>
                  <input type="number" min={0} value={form.boat_cabin_count} onChange={e => set('boat_cabin_count', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="3" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.berths}</label>
                  <input type="number" min={0} value={form.boat_berth_count} onChange={e => set('boat_berth_count', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="6" />
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.boat_is_swappable}
                    onChange={e => set('boat_is_swappable', e.target.checked)} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-slate-300">{t.newListing.swappable}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.boat_has_flybridge}
                    onChange={e => set('boat_has_flybridge', e.target.checked)} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-slate-300">{t.newListing.flybridge}</span>
                </label>
              </div>
            </section>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-3 border border-slate-600 text-slate-300 hover:text-white rounded-xl text-sm transition-colors">
                <ChevronLeft className="w-4 h-4" /> {t.newListing.back}
              </button>
              <button onClick={() => { setError(''); setStep(3) }}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-colors">
                {t.newListing.next} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Adım 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.newListing.locationSection}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.city}</label>
                  <select value={form.location_city} onChange={e => set('location_city', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                    <option value="">{t.newListing.select}</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.district}</label>
                  <input value={form.location_district} onChange={e => set('location_district', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    placeholder={t.newListing.districtPlaceholder} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.marina}</label>
                <input value={form.location_marina} onChange={e => set('location_marina', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                  placeholder={t.newListing.marinaPlaceholder} />
              </div>
            </section>

            <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.newListing.contact}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.phone}</label>
                  <input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    placeholder={t.newListing.phonePlaceholder} />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{t.newListing.email}</label>
                  <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    placeholder={t.newListing.emailPlaceholder} />
                </div>
              </div>
            </section>

            <section className="bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.newListing.photos}</h2>
              <p className="text-xs text-slate-500">{t.newListing.photosHint}</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input type="url" value={photoInput} onChange={e => { setPhotoInput(e.target.value); setPhotoError('') }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPhoto() } }}
                    className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    placeholder="https://..." />
                  <button type="button" onClick={addPhoto}
                    className="px-3 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    className="w-full px-3 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-orange-400 border-r-transparent rounded-full animate-spin" />
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        📁 Bilgisayardan Seç
                      </>
                    )}
                  </button>
                </div>
                {photoError && (
                  <p className="text-red-400 text-xs">{photoError}</p>
                )}
              </div>
              {form.photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.photos.map((url, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 max-w-[200px]">
                      <span className="truncate">{url.split('/').pop()}</span>
                      <button type="button" onClick={() => removePhoto(url)} className="text-slate-500 hover:text-red-400 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(isBoatCategory(form.category) ? 2 : 1)}
                className="flex items-center gap-2 px-6 py-3 border border-slate-600 text-slate-300 hover:text-white rounded-xl text-sm transition-colors">
                <ChevronLeft className="w-4 h-4" /> {t.newListing.back}
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? t.newListing.publishing : t.newListing.publish}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
