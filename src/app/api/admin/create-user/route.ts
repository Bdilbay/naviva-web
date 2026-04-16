import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify admin auth via service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const body = await request.json()
    const { email, password, full_name, role } = body

    // Validate inputs
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full_name are required' },
        { status: 400 }
      )
    }

    if (!['admin', 'moderator', 'support', 'user'].includes(role || 'user')) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm to skip email verification
      user_metadata: { full_name }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    // Create profile
    try {
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          full_name,
          avatar_url: null
        })
    } catch (e) {
      console.error('Profile creation error:', e)
      // Don't fail if profile already exists
    }

    // Assign role (if provided)
    if (role && role !== 'user') {
      try {
        await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role
          })
      } catch (e) {
        console.error('Role assignment error:', e)
        // Role assignment failed, but user was created
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        full_name,
        role: role || 'user'
      }
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
