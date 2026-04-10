import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useFavorite(itemId: string, itemType: string, userId?: string) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return

    const checkFavorite = async () => {
      try {
        const { data } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userId)
          .eq('item_id', itemId)
          .eq('item_type', itemType)
          .single()

        setIsFavorited(!!data)
      } catch (error) {
        setIsFavorited(false)
      }
    }

    checkFavorite()
  }, [itemId, itemType, userId])

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!userId) {
        // Redirect to login if not authenticated
        window.location.href = '/giris'
        return
      }

      setLoading(true)
      try {
        if (isFavorited) {
          // Remove from favorites
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('item_id', itemId)
            .eq('item_type', itemType)

          setIsFavorited(false)
        } else {
          // Add to favorites
          await supabase.from('favorites').insert({
            user_id: userId,
            item_id: itemId,
            item_type: itemType,
          })

          setIsFavorited(true)
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
      } finally {
        setLoading(false)
      }
    },
    [itemId, itemType, userId, isFavorited]
  )

  return { isFavorited, toggle, loading }
}
