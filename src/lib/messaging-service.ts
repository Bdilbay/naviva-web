import { supabase } from './supabase'
import { checkContentSeverity, filterContent } from './content-filter'

export interface ConversationParticipant {
  id: string
  email: string
  avatar_url?: string
}

export interface Conversation {
  id: string
  user_1_id: string
  user_2_id: string
  user_1: ConversationParticipant
  user_2: ConversationParticipant
  last_message_at: string
  created_at: string
  message_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_deleted: boolean
  deleted_reason?: string
  created_at: string
  edited_at?: string
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<{ conversation: Conversation; isNew: boolean }> {
  try {
    // Check if conversation exists
    const { data: existing, error: selectError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user_1_id.eq.${userId1},user_2_id.eq.${userId2}),and(user_1_id.eq.${userId2},user_2_id.eq.${userId1})`)
      .single()

    if (existing && !selectError) {
      // Fetch full conversation data
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          user_1_id,
          user_2_id,
          user_1:users!conversations_user_1_id_fkey(id, email, avatar_url),
          user_2:users!conversations_user_2_id_fkey(id, email, avatar_url),
          last_message_at,
          created_at
        `)
        .eq('id', existing.id)
        .single()

      if (error) throw error

      return {
        conversation: {
          ...data,
          user_1: Array.isArray(data.user_1) ? data.user_1[0] : data.user_1,
          user_2: Array.isArray(data.user_2) ? data.user_2[0] : data.user_2,
        } as Conversation,
        isNew: false,
      }
    }

    // Create new conversation
    const { data: newConv, error: insertError } = await supabase
      .from('conversations')
      .insert({
        user_1_id: userId1,
        user_2_id: userId2,
      })
      .select(`
        id,
        user_1_id,
        user_2_id,
        user_1:users!conversations_user_1_id_fkey(id, email, avatar_url),
        user_2:users!conversations_user_2_id_fkey(id, email, avatar_url),
        last_message_at,
        created_at
      `)
      .single()

    if (insertError) throw insertError

    return {
      conversation: {
        ...newConv,
        user_1: Array.isArray(newConv.user_1) ? newConv.user_1[0] : newConv.user_1,
        user_2: Array.isArray(newConv.user_2) ? newConv.user_2[0] : newConv.user_2,
      } as Conversation,
      isNew: true,
    }
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error)
    throw error
  }
}

/**
 * Send a message with content filtering
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ message: Message; flagged: boolean; severity?: string }> {
  try {
    // Check content for violations
    const contentCheck = await checkContentSeverity(content)

    // Filter content (replace blocked words)
    const filteredContent = await filterContent(content)

    // Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: filteredContent,
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation's last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    // If content has violations, auto-create a report for moderation
    if (contentCheck.hasBannedContent && contentCheck.severity === 'high') {
      await createAutoReport(data.id, senderId, contentCheck.blockedWords)
    }

    return {
      message: data,
      flagged: contentCheck.hasBannedContent,
      severity: contentCheck.severity || undefined,
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId: string, limit = 50): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw error
  }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(messageId: string, reason: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_reason: reason,
        deleted_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', messageId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting message:', error)
    throw error
  }
}

/**
 * Report a message
 */
export async function reportMessage(
  messageId: string,
  reporterId: string,
  reason: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('message_reports')
      .insert({
        message_id: messageId,
        reporter_id: reporterId,
        reason,
      })

    if (error) throw error
  } catch (error) {
    console.error('Error reporting message:', error)
    throw error
  }
}

/**
 * Auto-create a moderation report for high-severity violations
 */
async function createAutoReport(
  messageId: string,
  userId: string,
  blockedWords: string[]
): Promise<void> {
  try {
    await supabase
      .from('message_reports')
      .insert({
        message_id: messageId,
        reporter_id: userId,
        reason: `AUTO: Blocked words detected: ${blockedWords.join(', ')}`,
        status: 'pending',
      })
  } catch (error) {
    console.error('Error auto-reporting message:', error)
  }
}

/**
 * Get user's conversations
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        user_1_id,
        user_2_id,
        user_1:users!conversations_user_1_id_fkey(id, email, avatar_url),
        user_2:users!conversations_user_2_id_fkey(id, email, avatar_url),
        last_message_at,
        created_at,
        messages(id)
      `)
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (error) throw error

    const conversations = data?.map((conv: any) => ({
      ...conv,
      message_count: conv.messages?.length || 0,
    })) || []

    return conversations
  } catch (error) {
    console.error('Error fetching conversations:', error)
    throw error
  }
}

/**
 * Block a user
 */
export async function blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason,
      })

    if (error) throw error
  } catch (error) {
    console.error('Error blocking user:', error)
    throw error
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)

    if (error) throw error
  } catch (error) {
    console.error('Error unblocking user:', error)
    throw error
  }
}

/**
 * Check if user is blocked
 */
export async function isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .single()

    if (error && error.code === 'PGRST116') {
      return false // Not found
    }

    if (error) throw error

    return !!data
  } catch (error) {
    console.error('Error checking block status:', error)
    return false
  }
}
