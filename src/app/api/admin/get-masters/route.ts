/**
 * GET /api/admin/get-masters
 *
 * Tüm usta profillerini getir
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
    // Get all master profiles
    const { data: mastersData, error: mastersError } = await supabase
      .from('master_profiles')
      .select('id, user_id, name, categories, city, region, rating, verified, created_at')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (mastersError) {
      throw new Error(`Masters fetch error: ${mastersError.message}`)
    }

    if (!mastersData || mastersData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Format masters
    const detailedMasters = mastersData.map(master => ({
      id: master.id,
      user_id: master.user_id,
      user_email: `User ${master.user_id?.slice(0, 8) || 'unknown'}`,
      title: master.name || '',
      category: Array.isArray(master.categories) ? master.categories[0] || '' : '',
      location: master.city || master.region || 'Unknown',
      rating: master.rating || 0,
      review_count: 0,
      is_verified: master.verified || false,
      is_active: true,
      created_at: master.created_at,
    }))

    return NextResponse.json({
      success: true,
      count: detailedMasters.length,
      data: detailedMasters,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Masters API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
