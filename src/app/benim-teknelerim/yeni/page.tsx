'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react'
import Link from 'next/link'

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

export default function NewBoatPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

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

  const uploadImage = async (userId: string, boatId: string) => {
    if (!imageFile) return null

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

    return publicData?.publicUrl || null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/giris?redirect=/benim-teknelerim/yeni')
        return
      }

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Tekne adı gereklidir')
      }

      if (!formData.type.trim()) {
        throw new Error('Tekne türü gereklidir')
      }

      // Insert boat record
      const { data: boatData, error: boatError } = await supabase
        .from('boats')
        .insert([
          {
            user_id: session.user.id,
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
            image_url: null,
          }
        ])
        .select()
        .single()

      if (boatError) throw boatError

      // Upload image if provided
      if (imageFile && boatData) {
        const imageUrl = await uploadImage(session.user.id, boatData.id)

        if (imageUrl) {
          const { error: updateError } = await supabase
            .from('boats')
            .update({ image_url: imageUrl })
            .eq('id', boatData.id)

          if (updateError) {
            console.error('Image URL update error:', updateError)
          }
        }
      }

      router.push('/benim-teknelerim')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tekne oluşturulurken hata oluştu'
      setError(message)
      console.error('Error creating boat:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/benim-teknelerim"
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Geri Dön
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Yeni Tekne Oluştur</h1>
          <p className="text-slate-400">Sahip olduğunuz tekneyi sisteme kaydedin</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Info Section */}
          <div className="mb-8">
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
          <div className="mb-8">
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
          </div>

          {/* Details Section */}
          <div className="mb-8">
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
                  Kayıt No / Sicil No
                </label>
                <input
                  type="text"
                  value={formData.registrationNo}
                  onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                  placeholder="TUR-34-1234"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Liman Kaydı No
                </label>
                <input
                  type="text"
                  value={formData.harborRegistrationNo}
                  onChange={(e) => setFormData({ ...formData, harborRegistrationNo: e.target.value })}
                  placeholder="Liman kaydı numarası"
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
                  placeholder="Örn: Kalamış Marina, İstanbul"
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
                  placeholder="Kaptan adı (varsa)"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 pb-4 border-b border-slate-700">Tekne Fotoğrafı</h2>

            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8">
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview} alt="Önizleme" className="w-full h-64 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                    }}
                    className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors"
                  >
                    Fotoğrafı Kaldır
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload size={32} className="text-slate-500 mb-3" />
                  <span className="text-slate-300 font-medium">Fotoğraf Yükle</span>
                  <span className="text-slate-500 text-sm">PNG, JPG - maksimum 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'Tekneyi Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
