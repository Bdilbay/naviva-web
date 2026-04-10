/**
 * POST /api/listings/create
 *
 * Yeni ilan oluştur
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
    const payload = await request.json()

    // Validate required fields
    if (!payload.user_id || !payload.category || !payload.title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gerekli alanlar eksik',
        },
        { status: 400 }
      )
    }

    // Create listing
    const { data, error } = await supabase
      .from('listings')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      throw new Error(`Create error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
      },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Create Listing Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
