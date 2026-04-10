/**
 * GET /api/admin/get-categories
 *
 * Tüm kategorileri getir
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
    // Get all categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, description, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (categoriesError) {
      throw new Error(`Categories fetch error: ${categoriesError.message}`)
    }

    if (!categoriesData || categoriesData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      count: categoriesData.length,
      data: categoriesData,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Categories API Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
