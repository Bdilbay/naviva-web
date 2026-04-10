/**
 * GET /api/auth/check-admin
 *
 * Kullanıcının admin rolünü kontrol et
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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID yok' },
        { status: 400 }
      )
    }

    const { data: userData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, isAdmin: false },
        { status: 200 }
      )
    }

    const isAdmin = userData?.role === 'super_admin' || userData?.role === 'moderator'

    return NextResponse.json({
      success: true,
      isAdmin,
    })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { success: false, isAdmin: false },
      { status: 200 }
    )
  }
}
