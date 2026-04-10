/**
 * POST /api/admin/create-listing-conversation
 *
 * İlan tabanlı konuşma oluştur veya al
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
    const { buyer_id, seller_id, listing_id, listing_title } = await request.json()

    if (!buyer_id || !seller_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Ensure user_1_id < user_2_id (required by database constraint)
    const [user_1_id, user_2_id] = buyer_id < seller_id
      ? [buyer_id, seller_id]
      : [seller_id, buyer_id]

    // Check if conversation already exists
    const { data: existingConv, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_1_id', user_1_id)
      .eq('user_2_id', user_2_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Check error: ${checkError.message}`)
    }

    if (existingConv) {
      // Update last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', existingConv.id)

      return NextResponse.json({
        success: true,
        data: { conversation_id: existingConv.id },
      })
    }

    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        user_1_id: user_1_id,
        user_2_id: user_2_id,
        last_message_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (createError) {
      throw new Error(`Create error: ${createError.message}`)
    }

    return NextResponse.json({
      success: true,
      data: { conversation_id: newConv.id },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Create Listing Conversation Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
