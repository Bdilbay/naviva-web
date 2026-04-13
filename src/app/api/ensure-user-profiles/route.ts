/**
 * POST /api/ensure-user-profiles
 *
 * Ensures profile entries exist for users and returns their names
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
    const { userIds } = await request.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {},
      })
    }

    // Fetch existing profiles
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)

    const profileMap = new Map(
      (existingProfiles || []).map(p => [p.id, p.full_name]).filter(([_, name]) => name)
    )

    // Find missing users
    const missingUserIds = userIds.filter(id => !profileMap.has(id))

    if (missingUserIds.length > 0) {
      // Fetch auth users to get their names
      const { data: authUsers } = await supabase.auth.admin.listUsers()

      const authUserMap = new Map(
        authUsers?.users?.map(u => [
          u.id,
          (u.user_metadata?.full_name as string) || u.email || 'Unknown User',
        ]) || []
      )

      // Create missing profile entries
      const profilesToInsert = missingUserIds.map(id => ({
        id,
        full_name: authUserMap.get(id) || 'Unknown User',
        avatar_url: null,
      }))

      if (profilesToInsert.length > 0) {
        await supabase.from('profiles').upsert(profilesToInsert)
      }

      // Add to map
      missingUserIds.forEach(id => {
        const name = authUserMap.get(id)
        if (name) {
          profileMap.set(id, name)
        } else {
          profileMap.set(id, 'Unknown User')
        }
      })
    }

    // Ensure all user IDs have a name
    const result: Record<string, string> = {}
    userIds.forEach(id => {
      result[id] = profileMap.get(id) || 'Unknown User'
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Ensure User Profiles Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
