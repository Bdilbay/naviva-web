export interface Listing {
  id: string
  user_id: string
  category: string
  title: string
  description?: string
  price?: number
  price_unit: string
  price_period: string
  location_city?: string
  location_district?: string
  location_marina?: string
  photos: string[]
  status: string
  boat_type?: string
  boat_year?: number
  boat_length_m?: number
  boat_beam_m?: number
  boat_hull_material?: string
  boat_capacity?: number
  boat_cabin_count?: number
  boat_berth_count?: number
  boat_engine_brand?: string
  boat_engine_count?: number
  boat_engine_hp?: number
  boat_fuel_type?: string
  boat_engine_hours?: number
  boat_has_flybridge: boolean
  boat_flag?: string
  boat_condition?: string
  boat_is_swappable: boolean
  equipment_brand?: string
  equipment_condition?: string
  contact_phone?: string
  contact_email?: string
  available_from?: string
  available_to?: string
  created_at: string
}

export interface MasterProfile {
  id: string
  user_id: string
  name: string
  title?: string
  bio?: string
  city?: string
  phone?: string
  email?: string
  specialties: string[]
  categories?: string[]
  experience_years?: number
  photo_url?: string
  work_photo_urls?: string[]
  avg_rating?: number
  review_count?: number
  verified?: boolean
  region?: string
  listed_publicly: boolean
  created_at: string
}

export const CATEGORY_LABELS: Record<string, string> = {
  boat_sale: 'Satılık Tekne',
  boat_rent_daily: 'Günlük Kiralık',
  boat_rent_hourly: 'Saatlik Kiralık',
  boat_tour: 'Tur Teknesi',
  boat_fishing: 'Balık Teknesi',
  equipment_sale: 'Ekipman Satış',
  equipment_rent: 'Ekipman Kiralık',
}

export const CATEGORY_GROUPS = [
  {
    key: 'satilik',
    label: 'Satılık Tekne',
    categories: ['boat_sale'],
    boatTypes: ['Motoryat', 'Yelkenli', 'Katamaran', 'Sürat Teknesi', 'Gulet', 'Bot', 'Sandal', 'Balıkçı Teknesi', 'Jet Ski', 'RIB'],
  },
  {
    key: 'kiralik',
    label: 'Kiralık Tekne',
    categories: ['boat_rent_daily', 'boat_rent_hourly'],
    boatTypes: ['Motoryat', 'Yelkenli', 'Gulet', 'Sürat Teknesi', 'Bot'],
  },
  {
    key: 'tur',
    label: 'Tur / Charter',
    categories: ['boat_tour', 'boat_fishing'],
    boatTypes: ['Tur Teknesi', 'Gulet', 'Motoryat', 'Balıkçı Teknesi'],
  },
  {
    key: 'ekipman',
    label: 'Ekipman',
    categories: ['equipment_sale', 'equipment_rent'],
    boatTypes: [],
  },
]

export function formatPrice(listing: Listing): string {
  if (!listing.price) return 'Fiyat Sor'
  const symbol = listing.price_unit === 'EUR' ? '€' : listing.price_unit === 'USD' ? '$' : '₺'
  const amount = listing.price % 1 === 0
    ? listing.price.toLocaleString('tr-TR')
    : listing.price.toFixed(2)
  const periods: Record<string, string> = { per_day: '/gün', per_hour: '/saat', per_person: '/kişi' }
  const period = periods[listing.price_period] ?? ''
  return `${symbol}${amount}${period}`
}
