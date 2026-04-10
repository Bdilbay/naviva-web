/**
 * GET /api/masters/list
 *
 * Herkese açık ustaları listele
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
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const specialty = searchParams.get('specialty')
    const city = searchParams.get('city')

    let query = supabase
      .from('master_profiles')
      .select('*')
      .eq('listed_publicly', true)

    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }

    if (specialty) {
      query = query.contains('categories', [specialty])
    }

    if (city) {
      query = query.eq('city', city)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(60)

    if (error) {
      throw new Error(`Fetch error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Masters List Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
