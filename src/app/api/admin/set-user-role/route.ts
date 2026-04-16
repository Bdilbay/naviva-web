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
    const { user_id, role, action } = body

    // Validate inputs
    if (!user_id || !role) {
      return NextResponse.json(
        { error: 'user_id and role are required' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'moderator', 'support', 'master_pro', 'listing_pro', 'business']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    if (action === 'remove') {
      // Remove a specific role
      const { error } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role', role)

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Role '${role}' removed from user`
      })

    } else {
      // Add a role (action === 'add' or default)
      const { error } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id,
          role
        })
        .select()

      if (error) {
        // Check if it's a unique constraint violation (role already assigned)
        if (error.message.includes('unique')) {
          return NextResponse.json(
            { error: `User already has role '${role}'` },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Role '${role}' assigned to user`
      })
    }

  } catch (error) {
    console.error('Set user role error:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
