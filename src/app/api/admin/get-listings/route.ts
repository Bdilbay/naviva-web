/**
 * GET /api/admin/get-listings
 *
 * Tüm ilanları getir
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
    // Get all listings
    const { data: listingsData, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, category, status, price, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (listingsError) {
      throw new Error(`Listings fetch error: ${listingsError.message}`)
    }

    if (!listingsData || listingsData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      count: listingsData.length,
      data: listingsData,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Listings API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
