/**
 * Standardized Error Messages in Turkish
 */

export const ERROR_MESSAGES = {
  // Auth errors
  AUTH: {
    SIGN_IN_FAILED: 'Giriş başarısız. E-posta veya şifre hatalı.',
    SIGN_UP_FAILED: 'Kayıt başarısız. Lütfen tekrar deneyin.',
    EMAIL_ALREADY_EXISTS: 'Bu e-posta adresi zaten kayıtlı.',
    INVALID_EMAIL: 'Geçerli bir e-posta adresi girin.',
    WEAK_PASSWORD: 'Şifre en az 6 karakter olmalıdır.',
    EMAIL_NOT_CONFIRMED: 'E-postanız henüz onaylanmamış. Lütfen onay linkini tıklayın.',
    UNAUTHORIZED: 'Bu işlemi yapmak için yetkiniz yok.',
    SESSION_EXPIRED: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.',
  },

  // Listing errors
  LISTING: {
    CREATE_FAILED: 'İlan oluşturulamadı. Lütfen tekrar deneyin.',
    UPDATE_FAILED: 'İlan güncellenemedi. Lütfen tekrar deneyin.',
    DELETE_FAILED: 'İlan silinemedi. Lütfen tekrar deneyin.',
    NOT_FOUND: 'İlan bulunamadı.',
    LOAD_FAILED: 'İlanlar yüklenenemedi. İnternet bağlantınızı kontrol edin.',
    TITLE_REQUIRED: 'İlan başlığı zorunludur.',
    DESCRIPTION_REQUIRED: 'İlan açıklaması zorunludur.',
    PRICE_REQUIRED: 'Fiyat zorunludur.',
    PRICE_INVALID: 'Geçerli bir fiyat girin.',
    CATEGORY_REQUIRED: 'Kategori seçimi zorunludur.',
    INVALID_CATEGORY: 'Geçerli olmayan kategori.',
    CONTACT_EMAIL_INVALID: 'Geçerli bir e-posta adresi girin.',
    CONTACT_PHONE_INVALID: 'Geçerli bir telefon numarası girin.',
  },

  // Photo upload errors
  PHOTO: {
    UPLOAD_FAILED: 'Fotoğraf yüklenemedi. Tekrar deneyin.',
    INVALID_FILE_TYPE: 'Sadece resim dosyaları (.jpg, .png, .gif) kabul edilir.',
    FILE_TOO_LARGE: 'Dosya boyutu 10MB\'dan büyük olamaz.',
    UPLOAD_TIMEOUT: 'Yükleme zaman aşımına uğradı. Lütfen tekrar deneyin.',
    NO_FILE_SELECTED: 'Lütfen bir dosya seçin.',
    URL_INVALID: 'Geçerli bir resim URL\'si girin.',
    URL_ALREADY_ADDED: 'Bu fotoğraf zaten eklenmiş.',
  },

  // Message errors
  MESSAGE: {
    SEND_FAILED: 'Mesaj gönderilemedi. Tekrar deneyin.',
    LOAD_FAILED: 'Mesajlar yüklenemedi.',
    DELETE_FAILED: 'Mesaj silinemedi.',
    EMPTY_MESSAGE: 'Boş mesaj gönderemezsiniz.',
    CONVERSATION_NOT_FOUND: 'Konuşma bulunamadı.',
  },

  // User errors
  USER: {
    NOT_LOGGED_IN: 'Bu işlem için giriş yapmanız gerekir.',
    PROFILE_LOAD_FAILED: 'Profil yüklenemedi.',
    PROFILE_UPDATE_FAILED: 'Profil güncellenemedi.',
    PERMISSION_DENIED: 'Bu işlemi yapmak için izniniz yok.',
  },

  // Network errors
  NETWORK: {
    NO_CONNECTION: 'İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.',
    REQUEST_TIMEOUT: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
    SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    BAD_REQUEST: 'Geçersiz istek. Verilerinizi kontrol edin.',
    NOT_FOUND: 'Aradığınız içerik bulunamadı.',
  },

  // Generic errors
  GENERIC: {
    UNEXPECTED: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
    TRY_AGAIN: 'Lütfen tekrar deneyin.',
    CONTACT_SUPPORT: 'Sorun devam ederse lütfen destek ekibimizle iletişime geçin.',
  },
} as const

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function getErrorMessage(error: any): string {
  // If it's already an AppError, return its message
  if (error instanceof AppError) {
    return error.message
  }

  // If it's a Supabase error
  if (error?.message) {
    const msg = error.message.toLowerCase()

    if (msg.includes('email')) {
      if (msg.includes('already')) return ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS
      return ERROR_MESSAGES.AUTH.INVALID_EMAIL
    }

    if (msg.includes('password')) {
      if (msg.includes('should be')) return ERROR_MESSAGES.AUTH.WEAK_PASSWORD
      return 'Şifre hatalı.'
    }

    if (msg.includes('not confirmed')) {
      return ERROR_MESSAGES.AUTH.EMAIL_NOT_CONFIRMED
    }

    if (msg.includes('invalid login')) {
      return ERROR_MESSAGES.AUTH.SIGN_IN_FAILED
    }

    if (msg.includes('timeout')) {
      return ERROR_MESSAGES.NETWORK.REQUEST_TIMEOUT
    }

    if (msg.includes('network') || msg.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK.NO_CONNECTION
    }
  }

  // If it's a string, return it
  if (typeof error === 'string') {
    return error
  }

  // Default
  return ERROR_MESSAGES.GENERIC.UNEXPECTED
}

export function handleApiError(error: any, context?: string): string {
  const message = getErrorMessage(error)
  console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  return message
}
