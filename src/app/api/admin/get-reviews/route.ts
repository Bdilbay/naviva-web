/**
 * GET /api/admin/get-reviews
 *
 * Tüm yorumları getir
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
    // Get all reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, user_id, rating, comment, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (reviewsError) {
      throw new Error(`Reviews fetch error: ${reviewsError.message}`)
    }

    if (!reviewsData || reviewsData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      count: reviewsData.length,
      data: reviewsData,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Reviews API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
