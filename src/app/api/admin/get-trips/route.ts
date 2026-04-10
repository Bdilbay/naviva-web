/**
 * GET /api/admin/get-trips
 *
 * Tüm seyahatları getir
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
    // Get all trips
    const { data: tripsData, error: tripsError } = await supabase
      .from('trips')
      .select('id, boat_id, start_at, end_at, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (tripsError) {
      throw new Error(`Trips fetch error: ${tripsError.message}`)
    }

    if (!tripsData || tripsData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      count: tripsData.length,
      data: tripsData,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Trips API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
