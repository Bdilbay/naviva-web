'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Loader2, Check, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { RequiredEquipmentDisplay } from '@/components/boat/RequiredEquipmentDisplay'

const BOAT_TYPES = [
  'Motorlu',
  'Yelkenli',
  'RIB',
  'Karavela',
  'Gulet',
  'Katamaran',
  'Trimaran',
  'Diğer'
]

const HULL_MATERIALS = [
  'Fiberglass',
  'Ahşap',
  'Alüminyum',
  'Çelik',
  'Diğer'
]

const FLAGS = [
  'TR',
  'DE',
  'NL',
  'FR',
  'IT',
  'ES',
  'PT',
  'UK',
  'US',
  'Other'
]

export default function EditBoatPage() {
  const router = useRouter()
  const params = useParams()
  const boatId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    type: 'Motorlu',
    year: '',
    lengthM: '',
    beamM: '',
    draftM: '',
    engineModel: '',
    flag: 'TR',
    homePort: '',
    captainName: '',
    hullMaterial: 'Fiberglass',
    registrationNo: '',
    harborRegistrationNo: '',
    status: 'active',
  })

  useEffect(() => {
    const fetchBoat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/giris?redirect=/benim-teknelerim')
          return
        }

        const { data: boat, error: fetchError } = await supabase
          .from('boats')
          .select('*')
          .eq('id', boatId)
          .eq('user_id', session.user.id)
          .single()

        if (fetchError || !boat) {
          setError('Tekne bulunamadı')
          return
        }

        setFormData({
          name: boat.name || '',
          type: boat.type || 'Motorlu',
          year: boat.year?.toString() || '',
          lengthM: boat.length_m?.toString() || '',
          beamM: boat.beam_m?.toString() || '',
          draftM: boat.draft_m?.toString() || '',
          engineModel: boat.engine_model || '',
          flag: boat.flag || 'TR',
          homePort: boat.home_port || '',
          captainName: boat.captain_name || '',
          hullMaterial: boat.hull_material || 'Fiberglass',
          registrationNo: boat.registration_no || '',
          harborRegistrationNo: boat.harbor_registration_no || '',
          status: boat.status || 'active',
        })

        setCurrentImageUrl(boat.image_url || '')
        setLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Tekne yüklenirken hata oluştu'
        setError(message)
        setLoading(false)
      }
    }

    fetchBoat()
  }, [boatId, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Resim boyutu 5MB\'dan küçük olmalıdır')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const uploadImage = async (userId: string): Promise<string> => {
    if (!imageFile) return currentImageUrl || ''

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `boat_${boatId}_${Date.now()}.${fileExt}`
    const filePath = `boat-images/${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('boat_images')
      .upload(filePath, imageFile)

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      throw new Error('Resim yüklemesi başarısız oldu')
    }

    const { data: publicData } = supabase.storage
      .from('boat_images')
      .getPublicUrl(filePath)

    return publicData?.publicUrl || currentImageUrl || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/giris?redirect=/benim-teknelerim')
        return
      }

      if (!formData.name.trim()) {
        throw new Error('Tekne adı gereklidir')
      }

      let imageUrl = currentImageUrl
      if (imageFile) {
        imageUrl = await uploadImage(session.user.id)
      }

      const { error: updateError } = await supabase
        .from('boats')
        .update({
          name: formData.name.trim(),
          type: formData.type,
          year: formData.year ? parseInt(formData.year) : null,
          length_m: formData.lengthM ? parseFloat(formData.lengthM) : null,
          beam_m: formData.beamM ? parseFloat(formData.beamM) : null,
          draft_m: formData.draftM ? parseFloat(formData.draftM) : null,
          engine_model: formData.engineModel || null,
          flag: formData.flag || null,
          home_port: formData.homePort || null,
          captain_name: formData.captainName || null,
          hull_material: formData.hullMaterial || null,
          registration_no: formData.registrationNo || null,
          harbor_registration_no: formData.harborRegistrationNo || null,
          status: formData.status,
          image_url: imageUrl,
        })
        .eq('id', boatId)
        .eq('user_id', session.user.id)

      if (updateError) throw updateError

      setShowSuccessModal(true)

      setTimeout(() => {
        router.push(`/benim-teknelerim/${boatId}`)
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tekne güncellenirken hata oluştu'
      setError(message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8" style={{ paddingTop: "104px" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link href={`/benim-teknelerim/${boatId}`}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors">
          <ArrowLeft size={20} />
          Geri Dön
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Tekneyi Düzenle</h1>
        <p className="text-slate-400 mb-8">Tekne bilgilerini güncelleyin</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 pb-4 border-b border-slate-700">Tekne Fotoğrafı</h2>

            <div className="space-y-4">
              {(imagePreview || currentImageUrl) && (
                <div className="relative w-full h-48 bg-slate-900 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview || currentImageUrl}
                    alt="Tekne fotoğrafı"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-300">Yeni fotoğraf yüklemek için tıklayın</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG (Max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 pb-4 border-b border-slate-700">Temel Bilgiler</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tekne Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Deniz Yıldızı"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tekne Türü *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {BOAT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Yapım Yılı
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ülke Bayrağı
                </label>
                <select
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {FLAGS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dimensions Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 pb-4 border-b border-slate-700">Boyutlar</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Uzunluk (m)
                </label>
                <input
                  type="number"
                  value={formData.lengthM}
                  onChange={(e) => setFormData({ ...formData, lengthM: e.target.value })}
                  placeholder="11.5"
                  step="0.1"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  En (m)
                </label>
                <input
                  type="number"
                  value={formData.beamM}
                  onChange={(e) => setFormData({ ...formData, beamM: e.target.value })}
                  placeholder="3.6"
                  step="0.1"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Su Kesimi (m)
                </label>
                <input
                  type="number"
                  value={formData.draftM}
                  onChange={(e) => setFormData({ ...formData, draftM: e.target.value })}
                  placeholder="1.9"
                  step="0.1"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Required Equipment Display */}
            <RequiredEquipmentDisplay
              boatLength={formData.lengthM}
              hasEngineRoom={true}
            />
          </div>

          {/* Details Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 pb-4 border-b border-slate-700">Tekne Detayları</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gövde Malzeme
                </label>
                <select
                  value={formData.hullMaterial}
                  onChange={(e) => setFormData({ ...formData, hullMaterial: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {HULL_MATERIALS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Motor/Engine Modeli
                </label>
                <input
                  type="text"
                  value={formData.engineModel}
                  onChange={(e) => setFormData({ ...formData, engineModel: e.target.value })}
                  placeholder="Örn: Volvo Penta D2-40"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kaptan Adı
                </label>
                <input
                  type="text"
                  value={formData.captainName}
                  onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                  placeholder="Kaptan adı"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ana Liman
                </label>
                <input
                  type="text"
                  value={formData.homePort}
                  onChange={(e) => setFormData({ ...formData, homePort: e.target.value })}
                  placeholder="İstanbul"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tescil No
                </label>
                <input
                  type="text"
                  value={formData.registrationNo}
                  onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                  placeholder="Tescil numarası"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Liman Tescil No
                </label>
                <input
                  type="text"
                  value={formData.harborRegistrationNo}
                  onChange={(e) => setFormData({ ...formData, harborRegistrationNo: e.target.value })}
                  placeholder="Liman tescil numarası"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Durum
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="maintenance">Bakım Yapılıyor</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <Link href={`/benim-teknelerim/${boatId}`}
              className="px-6 py-3 border border-slate-600 text-slate-300 hover:text-white rounded-xl text-sm transition-colors">
              İptal
            </Link>
          </div>
        </form>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-fade-in">
              <div
                onClick={() => setShowSuccessModal(false)}
                className="bg-slate-800/95 border border-blue-500/30 rounded-2xl p-8 w-80 text-center cursor-pointer hover:border-blue-500/50 transition-all shadow-2xl"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500/20 rounded-full p-4 animate-scale-in">
                    <Check size={48} className="text-blue-400" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-white mb-2">Tekne Güncellendi</p>
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
