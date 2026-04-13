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

    // Fetch user names for all users in conversations
    const userIds = new Set<string>()
    conversationsData.forEach((conv: any) => {
      userIds.add(conv.user_1_id)
      userIds.add(conv.user_2_id)
    })

    const userIdArray = Array.from(userIds)

    // First get existing profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIdArray)

    const userMap = new Map<string, string>()
    const foundUserIds = new Set<string>()

    // Add existing profiles
    (profilesData || []).forEach((u: any) => {
      if (u.full_name) {
        userMap.set(u.id, u.full_name)
        foundUserIds.add(u.id)
      }
    })

    // For missing users, fetch from auth and create profiles
    const missingUserIds = userIdArray.filter(id => !foundUserIds.has(id))
    if (missingUserIds.length > 0) {
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers()

        const authUserMap = new Map(
          authUsers?.users?.map(u => [
            u.id,
            (u.user_metadata?.full_name as string) || u.email || 'Unknown User',
          ]) || []
        )

        // Create missing profile entries
        const profilesToInsert = missingUserIds
          .map(id => ({
            id,
            full_name: authUserMap.get(id) || 'Unknown User',
            avatar_url: null,
          }))
          .filter(p => p.full_name && p.full_name !== 'Unknown User')

        if (profilesToInsert.length > 0) {
          await supabase.from('profiles').upsert(profilesToInsert)
        }

        // Add to map
        missingUserIds.forEach(id => {
          const name = authUserMap.get(id) || 'Unknown User'
          userMap.set(id, name)
        })
      } catch (err) {
        // Fallback: use Unknown User for missing users
        missingUserIds.forEach(id => {
          userMap.set(id, 'Unknown User')
        })
      }
    }

    // Format conversations
    const formattedConversations = conversationsData.map((conv: any) => ({
      id: conv.id,
      user_1_id: conv.user_1_id,
      user_2_id: conv.user_2_id,
      user_1_name: userMap.get(conv.user_1_id) || 'Unknown User',
      user_2_name: userMap.get(conv.user_2_id) || 'Unknown User',
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
