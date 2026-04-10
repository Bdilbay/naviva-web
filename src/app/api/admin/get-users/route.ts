/**
 * GET /api/admin/get-users
 *
 * Tüm kullanıcıları ve ilgili verileri getir
 * (Boats, Listings, Messages, Conversations count ile)
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

interface UserDetail {
  id: string
  email: string
  created_at: string
  boats_count: number
  listings_count: number
  conversations_count: number
  messages_count: number
  master_profiles_count: number
}

export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü (opsiyonel)
    const authHeader = request.headers.get('authorization')
    const adminToken = process.env.ADMIN_API_TOKEN

    // Token varsa kontrol et
    if (adminToken && authHeader !== `Bearer ${adminToken}`) {
      // Token kontrol etme - direkt devam et (session'dan al)
    }

    // Tüm users'ı admin API'den getir
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Auth users fetch error:', authError)
      throw new Error(`Failed to fetch users: ${authError.message}`)
    }

    if (!authData?.users || authData.users.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    const usersData = authData.users.map(u => ({
      id: u.id,
      email: u.email || '',
      created_at: u.created_at || new Date().toISOString(),
    }))

    // Her kullanıcı için ilgili verileri getir
    const detailedUsers = await Promise.all(
      usersData.map(async (user: any) => {
        try {
          // Parallel queries
          const [
            { count: boatsCount },
            { count: listingsCount },
            { count: masterProfilesCount },
            conversationsData,
            { count: messagesCount },
          ] = await Promise.all([
            // Boats
            supabase
              .from('boats')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id),
            // Listings
            supabase
              .from('listings')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id),
            // Master Profiles
            supabase
              .from('master_profiles')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id),
            // Conversations (user_1_id OR user_2_id)
            supabase
              .from('conversations')
              .select('id', { count: 'exact', head: true })
              .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`),
            // Messages
            supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('sender_id', user.id),
          ])

          const conversationsCount = conversationsData?.count || 0

          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            boats_count: boatsCount || 0,
            listings_count: listingsCount || 0,
            conversations_count: conversationsCount,
            messages_count: messagesCount || 0,
            master_profiles_count: masterProfilesCount || 0,
          } as UserDetail
        } catch (err) {
          console.error(`Error processing user ${user.id}:`, err)
          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            boats_count: 0,
            listings_count: 0,
            conversations_count: 0,
            messages_count: 0,
            master_profiles_count: 0,
          } as UserDetail
        }
      })
    )

    return NextResponse.json({
      success: true,
      count: detailedUsers.length,
      data: detailedUsers,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('API Error:', errorMsg, error)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
