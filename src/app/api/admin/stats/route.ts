/**
 * GET /api/admin/stats
 *
 * Admin dashboard için tüm istatistikleri getir
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

export async function GET(request: NextRequest) {
  try {
    // Parallel stats fetch
    const [usersResult, allListingsResult, activeListingsResult, mastersResult, boatsResult, messagesResult, reportsResult, blockedWordsResult, conversationsResult] =
      await Promise.all([
        // Total users
        supabase.auth.admin.listUsers(),
        // All listings
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        // Active listings
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        // Master profiles
        supabase.from('master_profiles').select('id', { count: 'exact', head: true }),
        // Boats
        supabase.from('boats').select('id', { count: 'exact', head: true }),
        // Messages
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        // Pending reports
        supabase.from('message_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        // Blocked words
        supabase.from('blocked_words').select('id', { count: 'exact', head: true }),
        // Conversations
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
      ])

    // Handle auth.admin.listUsers() response
    let totalUsers = 0
    if (usersResult.data?.users) {
      totalUsers = usersResult.data.users.length
    } else if (usersResult.error) {
      console.error('Users fetch error:', usersResult.error)
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalListings: allListingsResult.count || 0,
        activeListings: activeListingsResult.count || 0,
        totalMasters: mastersResult.count || 0,
        totalBoats: boatsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        pendingReports: reportsResult.count || 0,
        blockedWords: blockedWordsResult.count || 0,
        conversations: conversationsResult.count || 0,
      },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Stats API Error:', errorMsg, error)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
