/**
 * GET /api/admin/get-conversations
 *
 * Tüm konuşmaları getir
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
    // Get all conversations with message counts
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        user_1_id,
        user_2_id,
        last_message_at,
        created_at,
        messages(id)
      `)
      .order('last_message_at', { ascending: false })
      .limit(100)

    if (conversationsError) {
      throw new Error(`Conversations fetch error: ${conversationsError.message}`)
    }

    if (!conversationsData || conversationsData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Format conversations
    const formattedConversations = conversationsData.map((conv: any) => ({
      id: conv.id,
      user_1_id: conv.user_1_id,
      user_2_id: conv.user_2_id,
      user_1_email: `User ${conv.user_1_id?.slice(0, 8) || 'unknown'}`,
      user_2_email: `User ${conv.user_2_id?.slice(0, 8) || 'unknown'}`,
      message_count: conv.messages?.length || 0,
      last_message_at: conv.last_message_at,
      created_at: conv.created_at,
    }))

    return NextResponse.json({
      success: true,
      count: formattedConversations.length,
      data: formattedConversations,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Conversations API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
