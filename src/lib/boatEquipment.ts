/**
 * 2026 Türkiye Amatör Denizcilik Yönetmeliğine Göre
 * Tekne Boyutuna Bağlı Zorunlu Ekipmanlar
 */

export interface Equipment {
  id: string
  name: string
  category: string
  required: boolean
}

export interface EquipmentRequirements {
  boatLengthMin: number
  boatLengthMax: number
  equipment: Equipment[]
}

// Tekne boyundan bağımsız - TÜM TEKNELERDE ZORUNLU
const UNIVERSAL_EQUIPMENT: Equipment[] = [
  { id: 'life-jacket', name: 'Can Yeleği (Kişi Sayısı Kadar)', category: 'Emniyet', required: true },
  { id: 'compass', name: 'Manyetik Pusula', category: 'Navigasyon', required: true },
  { id: 'navigation-lights', name: 'Seyir Fenerleri', category: 'Navigasyon', required: true },
  { id: 'radar-reflector', name: 'Radar Reflektörü', category: 'Navigasyon', required: true },
  { id: 'danger-flag', name: 'Tehlike Bayrağı', category: 'Sinyal', required: true },
  { id: 'hand-light', name: 'El Feneri', category: 'Sinyal', required: true },
  { id: 'gps', name: 'GPS Cihazı / Mobil Uygulama', category: 'Navigasyon', required: true },
  { id: 'binoculars', name: 'Dürbün', category: 'Gözlem', required: true },
  { id: 'thermometer', name: 'Termometre', category: 'Gözlem', required: true },
  { id: 'barometer', name: 'Barometre', category: 'Gözlem', required: true },
]

// 10 metreye kadar tekneler
const UNDER_10M_EQUIPMENT: Equipment[] = [
  ...UNIVERSAL_EQUIPMENT,
]

// 10-15 metre arası tekneler
const FROM_10_TO_15M_EQUIPMENT: Equipment[] = [
  ...UNIVERSAL_EQUIPMENT,
  { id: 'life-ring', name: 'Can Simidi (Hızı 7+ deniz mil ise)', category: 'Emniyet', required: true },
]

// 15 metreden fazla tekneler
const OVER_15M_EQUIPMENT: Equipment[] = [
  ...UNIVERSAL_EQUIPMENT,
  { id: 'life-ring', name: 'Can Simidi', category: 'Emniyet', required: true },
  { id: 'vhf-radio', name: 'VHF Telsiz Cihazı', category: 'Haberleşme', required: true },
  { id: 'ais-device', name: 'AIS Cihazı veya PLB (Kişisel Konum Belirleyici)', category: 'Haberleşme', required: true },
  { id: 'fire-extinguisher', name: 'Sertifikalı Yangın Söndürücü', category: 'Yangın Güvenliği', required: true },
  { id: 'fire-blanket', name: 'Yangın Battaniyesi', category: 'Yangın Güvenliği', required: true },
  { id: 'fire-axe', name: 'Yangın Baltası', category: 'Yangın Güvenliği', required: true },
]

// Makine dairesi olan tekneler için ilave
const ENGINE_ROOM_EQUIPMENT: Equipment[] = [
  { id: 'extra-fire-extinguisher', name: 'İlave Yangın Söndürücü (Makine Dairesi)', category: 'Yangın Güvenliği', required: true },
]

export const EQUIPMENT_REQUIREMENTS: EquipmentRequirements[] = [
  {
    boatLengthMin: 0,
    boatLengthMax: 10,
    equipment: UNDER_10M_EQUIPMENT,
  },
  {
    boatLengthMin: 10,
    boatLengthMax: 15,
    equipment: FROM_10_TO_15M_EQUIPMENT,
  },
  {
    boatLengthMin: 15,
    boatLengthMax: 300,
    equipment: OVER_15M_EQUIPMENT,
  },
]

/**
 * Verilen tekne boyutuna göre zorunlu ekipmanları döndür
 */
export function getRequiredEquipment(boatLengthM: number, hasEngineRoom: boolean = false): Equipment[] {
  const requirements = EQUIPMENT_REQUIREMENTS.find(
    req => boatLengthM >= req.boatLengthMin && boatLengthM < req.boatLengthMax
  )

  let equipment = requirements?.equipment || UNIVERSAL_EQUIPMENT

  // Makine dairesi varsa ilave ekipman ekle
  if (hasEngineRoom && boatLengthM > 15) {
    equipment = [...equipment, ...ENGINE_ROOM_EQUIPMENT]
  }

  return equipment
}

/**
 * Ekipmanları kategoriye göre grupla
 */
export function groupEquipmentByCategory(equipment: Equipment[]): Record<string, Equipment[]> {
  return equipment.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    groups[item.category].push(item)
    return groups
  }, {} as Record<string, Equipment[]>)
}
