/**
 * GET /api/admin/get-web-users
 *
 * Web platform kullanıcılarını getir (auth.users)
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
    // Get all users from auth.users
    const usersResult = await supabase.auth.admin.listUsers()

    if (usersResult.error) {
      throw new Error(`Auth list error: ${usersResult.error.message}`)
    }

    if (!usersResult.data || !usersResult.data.users) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Format users
    const formattedUsers = usersResult.data.users.map(user => ({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || '',
      created_at: user.created_at,
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Web Users API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
