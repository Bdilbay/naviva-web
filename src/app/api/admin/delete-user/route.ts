/**
 * DELETE /api/admin/delete-user
 *
 * Kullanıcıyı ve ilgili tüm verileri sil
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
    const body = await request.json()
    const userId = body.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      )
    }

    // Sil: boats, listings, master_profiles, conversations, messages
    await Promise.all([
      supabase.from('boats').delete().eq('user_id', userId),
      supabase.from('listings').delete().eq('user_id', userId),
      supabase.from('master_profiles').delete().eq('user_id', userId),
      supabase
        .from('conversations')
        .delete()
        .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`),
      supabase.from('messages').delete().eq('sender_id', userId),
    ])

    // Supabase Auth'dan sil (service role)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı ve tüm ilişkili veriler silindi',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    )
  }
}
