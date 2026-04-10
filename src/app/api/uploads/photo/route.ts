/**
 * POST /api/uploads/photo
 *
 * Resim yükle ve URL döndür
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya yok' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID yok' },
        { status: 400 }
      )
    }

    // File size kontrolü (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu 10MB\'dan büyük' },
        { status: 400 }
      )
    }

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Sadece resim dosyaları kabul edilir' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `listings/${userId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('listing_photos')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      throw new Error(`Upload error: ${error.message}`)
    }

    const { data: publicUrl } = supabase.storage
      .from('listing_photos')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl.publicUrl,
        path: filePath,
      },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Photo Upload Error:', errorMsg)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
