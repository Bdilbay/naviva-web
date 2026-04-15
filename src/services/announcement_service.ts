import { createClient } from '@supabase/supabase-js'

export interface Announcement {
  id: string
  title: string
  content?: string
  image_url?: string
  link_url?: string
  category: string
  is_active: boolean
  starts_at?: string
  ends_at?: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function getAnnouncements(category: string = 'adb'): Promise<Announcement[]> {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching announcements:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export async function getFeaturedAnnouncement(category: string = 'adb'): Promise<Announcement | null> {
  const announcements = await getAnnouncements(category)
  return announcements.length > 0 ? announcements[0] : null
}
