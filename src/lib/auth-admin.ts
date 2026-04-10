/**
 * Admin Authentication Functions
 * Supabase Auth'da kullanıcıları yönetmek için helper fonksiyonlar
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ Sadece server-side kullan!
)

/**
 * Tüm deactive kullanıcıları email verification olmadan aktif hale getir
 */
export async function activateAllUsers() {
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .update({
        email_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .is('email_confirmed_at', null)
      .is('deleted_at', null)
      .select()

    if (error) throw error

    console.log(`✓ ${data?.length || 0} kullanıcı aktif hale getirildi`)
    return { success: true, count: data?.length || 0 }
  } catch (error) {
    console.error('Kullanıcı aktivasyon hatası:', error)
    return { success: false, error }
  }
}

/**
 * Spesifik bir kullanıcıyı email verification olmadan aktif et
 */
export async function activateUser(email: string) {
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .update({
        email_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .is('deleted_at', null)
      .select()

    if (error) throw error

    if (data && data.length > 0) {
      console.log(`✓ ${email} aktif hale getirildi`)
      return { success: true, user: data[0] }
    } else {
      return { success: false, error: 'Kullanıcı bulunamadı' }
    }
  } catch (error) {
    console.error(`${email} aktivasyon hatası:`, error)
    return { success: false, error }
  }
}

/**
 * Kullanıcıya Magic Link (email linki) gönder
 * Kullanıcı linke tıkla magic link'ten şifre oluşturabilir
 */
export async function sendMagicLink(email: string, redirectTo?: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) throw error

    console.log(`✓ Magic link ${email}'e gönderildi`)
    return { success: true, data }
  } catch (error) {
    console.error(`Magic link gönderme hatası (${email}):`, error)
    return { success: false, error }
  }
}

/**
 * Tüm kullanıcılara bulk Magic Link gönder
 */
export async function sendMagicLinkToAll(userEmails: string[]) {
  const results = {
    successful: [] as string[],
    failed: [] as { email: string; error: string }[],
  }

  for (const email of userEmails) {
    const result = await sendMagicLink(email)
    if (result.success) {
      results.successful.push(email)
    } else {
      results.failed.push({
        email,
        error: String(result.error),
      })
    }
    // Rate limiting - API'ye çok hızlı istek gelmesini önle
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

/**
 * Admin ile yeni kullanıcı oluştur (email verification olmadan)
 */
export async function createUserAsAdmin(email: string, password?: string) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: password || Math.random().toString(36).slice(-12), // Random password
      email_confirm: true, // Email verification'ı bypass et
    })

    if (error) throw error

    console.log(`✓ Kullanıcı oluşturuldu: ${email}`)
    return { success: true, user: data.user }
  } catch (error) {
    console.error(`Kullanıcı oluşturma hatası (${email}):`, error)
    return { success: false, error }
  }
}

/**
 * Tüm kullanıcıları listele (admin view)
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) throw error

    return {
      success: true,
      count: data.users?.length || 0,
      users: data.users?.map(u => ({
        id: u.id,
        email: u.email,
        emailConfirmed: !!u.email_confirmed_at,
        createdAt: u.created_at,
      })),
    }
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error)
    return { success: false, error }
  }
}

/**
 * Kullanıcı şifresini admin olarak sıfırla
 */
export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) throw error

    console.log(`✓ Şifre sıfırlandı: ${data.user?.email}`)
    return { success: true, user: data.user }
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error)
    return { success: false, error }
  }
}

/**
 * API Endpoint Örneği (pages/api/admin/activate-users.ts)
 *
 * Bunu Next.js API route olarak kullan:
 */

// import { activateAllUsers, sendMagicLinkToAll } from '@/lib/auth-admin'
//
// export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
//
//   try {
//     // 1. Tüm kullanıcıları aktif et
//     const activation = await activateAllUsers()
//     if (!activation.success) {
//       return res.status(400).json({ error: activation.error })
//     }
//
//     // 2. Tüm kullanıcılara magic link gönder
//     // const userEmails = ['user1@example.com', 'user2@example.com']
//     // const magicLinks = await sendMagicLinkToAll(userEmails)
//
//     res.status(200).json({
//       message: 'Kullanıcılar aktif hale getirildi',
//       activated: activation.count,
//       // magicLinksSent: magicLinks.successful.length,
//     })
//   } catch (error) {
//     res.status(500).json({ error: String(error) })
//   }
// }
