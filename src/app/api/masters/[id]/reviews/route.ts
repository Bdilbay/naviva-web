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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const masterId = id
    console.log('GET /api/masters/[id]/reviews - masterId:', masterId)

    if (!masterId) {
      return NextResponse.json({ error: 'Master ID required' }, { status: 400 })
    }

    // Fetch reviews
    const { data: reviews, error } = await supabase
      .from('master_reviews')
      .select('*')
      .eq('master_id', masterId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format reviews - use reviewer_name from database
    const formattedReviews = reviews?.map((review: any) => {
      let reviewerName = 'Kullanıcı'

      if (review.is_anonymous) {
        reviewerName = 'Anonim'
      } else if (review.reviewer_name && review.reviewer_name.trim()) {
        reviewerName = review.reviewer_name
      }

      return {
        id: review.id,
        masterId: review.master_id,
        reviewerId: review.reviewer_id,
        reviewerName: reviewerName,
        rating: review.rating,
        comment: review.comment,
        workCategory: review.work_category,
        workDate: review.work_date,
        createdAt: review.created_at,
      }
    }) || []

    return NextResponse.json({ success: true, reviews: formattedReviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const masterId = id
    const body = await request.json()
    const { rating, comment, workCategory, workDate, isAnonymous } = body

    console.log('🔍 POST /api/masters/[id]/reviews:', {
      masterId,
      masterId_type: typeof masterId,
      masterId_length: masterId?.length,
      rating,
      rating_type: typeof rating,
      body,
    })

    // Convert rating to number
    let ratingNum = rating
    if (typeof rating === 'string') {
      ratingNum = parseInt(rating, 10)
    }

    console.log('📊 Rating conversion:', {
      original: rating,
      converted: ratingNum,
      isValid: ratingNum >= 1 && ratingNum <= 5
    })

    // Validation
    const isValidMasterId = masterId && masterId.length > 0
    const isValidRating = typeof ratingNum === 'number' && ratingNum >= 1 && ratingNum <= 5

    console.log('✅ Validation result:', {
      isValidMasterId,
      isValidRating,
      willPass: isValidMasterId && isValidRating
    })

    if (!isValidMasterId || !isValidRating) {
      console.log('❌ Validation FAILED')
      return NextResponse.json(
        { error: `Invalid request: masterId=${masterId}, rating=${rating}` },
        { status: 400 }
      )
    }
    console.log('✓ Validation PASSED')


    // Get session
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already reviewed
    const { data: existingReview } = await supabase
      .from('master_reviews')
      .select('id')
      .eq('master_id', masterId)
      .eq('reviewer_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'Zaten bu usta için yorum yazmışsınız' },
        { status: 400 }
      )
    }

    // Submit review
    const reviewerName = isAnonymous ? null : (user.user_metadata?.full_name || 'Kullanıcı')

    const { error } = await supabase.from('master_reviews').insert({
      master_id: masterId,
      reviewer_id: user.id,
      rating: ratingNum,
      comment,
      work_category: workCategory,
      work_date: workDate,
      is_anonymous: isAnonymous || false,
      reviewer_name: reviewerName,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Yorum başarıyla gönderildi',
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const masterId = id
    const body = await request.json()
    const { reviewId, rating, comment, workCategory, workDate, isAnonymous } = body

    // Get session
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the review belongs to this user
    const { data: review } = await supabase
      .from('master_reviews')
      .select('reviewer_id')
      .eq('id', reviewId)
      .eq('master_id', masterId)
      .single()

    if (!review || review.reviewer_id !== user.id) {
      return NextResponse.json(
        { error: 'Bu yorumu düzenlemek için yetkiniz yok' },
        { status: 403 }
      )
    }

    // Convert rating to number
    let ratingNum = rating
    if (typeof rating === 'string') {
      ratingNum = parseInt(rating, 10)
    }

    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Update review
    const reviewerName = isAnonymous ? null : (user.user_metadata?.full_name || 'Kullanıcı')

    const { error } = await supabase
      .from('master_reviews')
      .update({
        rating: ratingNum,
        comment,
        work_category: workCategory,
        work_date: workDate,
        is_anonymous: isAnonymous || false,
        reviewer_name: reviewerName,
      })
      .eq('id', reviewId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Yorum başarıyla güncellendi',
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const masterId = id
    const body = await request.json()
    const { reviewId } = body

    // Get session
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the review belongs to this user
    const { data: review } = await supabase
      .from('master_reviews')
      .select('reviewer_id')
      .eq('id', reviewId)
      .eq('master_id', masterId)
      .single()

    if (!review || review.reviewer_id !== user.id) {
      return NextResponse.json(
        { error: 'Bu yorumu silmek için yetkiniz yok' },
        { status: 403 }
      )
    }

    // Delete review
    const { error } = await supabase
      .from('master_reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Yorum başarıyla silindi',
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
