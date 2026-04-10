/**
 * GET /api/admin/get-alerts
 *
 * Tüm alarmları getir
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
    // Get all alerts
    const { data: alertsData, error: alertsError } = await supabase
      .from('alerts')
      .select('id, boat_id, name, type, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (alertsError) {
      throw new Error(`Alerts fetch error: ${alertsError.message}`)
    }

    if (!alertsData || alertsData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      count: alertsData.length,
      data: alertsData,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Alerts API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
