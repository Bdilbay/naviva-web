/**
 * GET /api/admin/get-message-reports
 *
 * Tüm mesaj raporlarını getir
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
    // Get all message reports
    const { data: reportsData, error: reportsError } = await supabase
      .from('message_reports')
      .select('id, message_id, reporter_id, reason, status, reviewed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (reportsError) {
      throw new Error(`Reports fetch error: ${reportsError.message}`)
    }

    if (!reportsData || reportsData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Format reports
    const formattedReports = reportsData.map((report: any) => ({
      id: report.id,
      message_id: report.message_id?.slice(0, 8) + '...' || '-',
      reporter_id: report.reporter_id?.slice(0, 8) + '...' || '-',
      reason: report.reason,
      status: report.status,
      reviewed_at: report.reviewed_at,
      created_at: report.created_at,
    }))

    return NextResponse.json({
      success: true,
      count: formattedReports.length,
      data: formattedReports,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Message Reports API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
