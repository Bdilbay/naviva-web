/**
 * GET /api/admin/get-boat-logs
 *
 * Tüm tekne loglarını getir
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
    // Get all boat logs
    const { data: logsData, error: logsError } = await supabase
      .from('boat_logs')
      .select('id, boat_id, date, from_port, to_port, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (logsError) {
      throw new Error(`Boat logs fetch error: ${logsError.message}`)
    }

    if (!logsData || logsData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      count: logsData.length,
      data: logsData,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Boat Logs API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
