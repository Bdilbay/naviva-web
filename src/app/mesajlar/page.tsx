'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MessageSquare, Send, Search, Clock, User as UserIcon, Plus, X } from 'lucide-react'

const POLLING_INTERVAL = 30000 // 30 seconds

interface Conversation {
  id: string
  user_1_id: string
  user_2_id: string
  other_user_id: string
  other_user_name: string
  last_message_at: string
  created_at: string
  unread_count?: number
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_deleted: boolean
  created_at: string
}

interface UserOption {
  id: string
  full_name: string
}

export default function MessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([])
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null)
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({})
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/giris?redirect=/mesajlar')
        return
      }

      setUserId(session.user.id)
      fetchConversations(session.user.id)
    }

    checkAuth()
  }, [router])

  // Auto-focus search input when new conversation modal opens
  useEffect(() => {
    if (showNewConversation && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showNewConversation])

  // Poll for new unread messages every 30 seconds
  useEffect(() => {
    if (!userId || conversations.length === 0) return

    const interval = setInterval(() => {
      _calculateUnreadCount(conversations, userId)
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [userId, conversations])

  // Real-time subscription for new messages
  useEffect(() => {
    if (!userId) return

    // Unsubscribe from any existing channel first
    supabase.removeAllChannels()

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('New message event:', payload)
          // Recalculate unread count immediately when new message arrives
          _calculateUnreadCount(conversations, userId)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId, conversations])

  const fetchConversations = async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, user_1_id, user_2_id, last_message_at, created_at')
        .or(`user_1_id.eq.${currentUserId},user_2_id.eq.${currentUserId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Fetch user names for all conversation participants
      const userIds = Array.from(
        new Set(
          data?.flatMap((conv: any) => [conv.user_1_id, conv.user_2_id]) || []
        )
      )

      // Ensure user profiles exist and get their names via API
      try {
        const userNamesResponse = await fetch('/api/ensure-user-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds }),
        })

        if (userNamesResponse.ok) {
          const userNamesData = await userNamesResponse.json()
          const userMap = new Map(
            Object.entries(userNamesData.data || {}).map(([id, name]) => [id, name as string])
          )

          // Use API-fetched names
          const formattedConversations = data?.map((conv: any) => {
            const otherUserId = conv.user_1_id === currentUserId ? conv.user_2_id : conv.user_1_id
            return {
              id: conv.id,
              user_1_id: conv.user_1_id,
              user_2_id: conv.user_2_id,
              other_user_id: otherUserId,
              other_user_name: userMap.get(otherUserId) || 'Unknown User',
              last_message_at: conv.last_message_at,
              created_at: conv.created_at,
            }
          }) || []

          setConversations(formattedConversations)
          setLoading(false)
          _calculateUnreadCount(formattedConversations, currentUserId)
          return
        }
      } catch (err) {
        console.error('Error ensuring user profiles:', err)
      }

      // Fallback: fetch from profiles only (may show Unknown User)
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      const userMap = new Map((usersData || []).map(u => [u.id, u.full_name]))

      const formattedConversations = data?.map((conv: any) => {
        const otherUserId = conv.user_1_id === currentUserId ? conv.user_2_id : conv.user_1_id
        return {
          id: conv.id,
          user_1_id: conv.user_1_id,
          user_2_id: conv.user_2_id,
          other_user_id: otherUserId,
          other_user_name: userMap.get(otherUserId) || 'Unknown User',
          last_message_at: conv.last_message_at,
          created_at: conv.created_at,
        }
      }) || []

      setConversations(formattedConversations)
      setLoading(false)
      _calculateUnreadCount(formattedConversations, currentUserId)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, is_deleted, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const _calculateUnreadCount = async (convs: Conversation[], currentUserId: string) => {
    try {
      let total = 0
      const unreadMap: Record<string, number> = {}

      for (const conv of convs) {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('conversation_id', conv.id)
          .neq('sender_id', currentUserId)
          .eq('is_read', false)

        if (!error && messages) {
          const count = messages.length
          total += count
          unreadMap[conv.id] = count
        } else if (error) {
          console.error(`Error counting messages for conversation ${conv.id}:`, error)
          unreadMap[conv.id] = 0
        }
      }
      console.log('DEBUG: Total unread count:', total, 'By conversation:', unreadMap)
      setUnreadCount(total)
      setUnreadByConversation(unreadMap)
    } catch (error) {
      console.error('Error calculating unread count:', error)
    }
  }

  const handleSelectConversation = async (convId: string) => {
    setSelectedConvId(convId)
    fetchMessages(convId)
    // Mark messages as read
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', userId)

      if (!error) {
        // Recalculate unread count immediately after marking as read
        setTimeout(() => {
          _calculateUnreadCount(conversations, userId)
        }, 100)
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConvId) return

    setSending(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConvId,
          sender_id: userId,
          content: newMessage,
        })
        .select()

      if (error) throw error

      if (data) {
        setMessages([...messages, data[0]])
        setNewMessage('')

        // Update conversation's last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', selectedConvId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Mesaj gönderilemedi')
    } finally {
      setSending(false)
    }
  }

  const searchUsers = async (query: string) => {
    setSearchingUsers(true)
    try {
      // Basit test: tüm kullanıcıları getir
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .neq('id', userId)
        .limit(100)

      console.log('DEBUG: Got', data?.length, 'profiles, error:', error)

      if (error) throw error

      const allUsers = data || []
      console.log('DEBUG: All users:', allUsers.length)

      // Eğer query boşsa hepsini göster
      if (!query.trim()) {
        setAvailableUsers(allUsers.slice(0, 20))
        setSearchingUsers(false)
        return
      }

      // Query varsa filtrele - başında olanları önce (trim ile temizle)
      const lowerQuery = query.toLowerCase()

      const startsWith = allUsers.filter(u =>
        u.full_name?.trim().toLowerCase().startsWith(lowerQuery)
      )

      const contains = allUsers.filter(u => {
        const name = u.full_name?.trim().toLowerCase() || ''
        return name.includes(lowerQuery) && !name.startsWith(lowerQuery)
      })

      const filtered = [...startsWith, ...contains]
      console.log('DEBUG: Filtered results:', filtered.length)
      setAvailableUsers(filtered.slice(0, 10))
    } catch (error) {
      console.error('Error searching users:', error)
      setAvailableUsers([])
    } finally {
      setSearchingUsers(false)
    }
  }

  const handleCreateConversation = async () => {
    if (!selectedUser) return

    try {
      // Check if conversation already exists
      const { data: existing, error: selectError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user_1_id.eq.${userId},user_2_id.eq.${selectedUser.id}),and(user_1_id.eq.${selectedUser.id},user_2_id.eq.${userId})`)
        .single()

      if (existing) {
        // Conversation already exists
        handleSelectConversation(existing.id)
        setShowNewConversation(false)
        setSelectedUser(null)
        return
      }

      // Create new conversation
      const user1Id = userId < selectedUser.id ? userId : selectedUser.id
      const user2Id = userId < selectedUser.id ? selectedUser.id : userId

      const { data: newConv, error: insertError } = await supabase
        .from('conversations')
        .insert({
          user_1_id: user1Id,
          user_2_id: user2Id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newConversation: Conversation = {
        id: newConv.id,
        user_1_id: newConv.user_1_id,
        user_2_id: newConv.user_2_id,
        other_user_id: selectedUser.id,
        other_user_name: selectedUser.full_name,
        last_message_at: newConv.created_at,
        created_at: newConv.created_at,
      }

      setConversations([newConversation, ...conversations])
      handleSelectConversation(newConv.id)
      setShowNewConversation(false)
      setSelectedUser(null)
      setAvailableUsers([])
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pb-12" style={{ paddingTop: "104px" }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare size={32} className="text-pink-400" />
            <h1 className="text-4xl font-bold text-white">Mesajlarım</h1>
          </div>
          <p className="text-slate-400">Diğer kullanıcılarla iletişim kurun</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  title="Yeni konuşma başlat"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Yükleniyor...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400 text-center">
                    {conversations.length === 0
                      ? 'Henüz konuşmanız yok'
                      : 'Arama sonucu bulunamadı'}
                  </p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const unreadInConv = unreadByConversation[conv.id] || 0
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                        selectedConvId === conv.id ? 'bg-pink-500/20 border-l-2 border-l-pink-500' : ''
                      } ${unreadInConv > 0 ? 'bg-slate-700/30' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                          <UserIcon size={14} className="text-pink-400" />
                          {conv.other_user_name}
                          {unreadInConv > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 ml-auto text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
                              {unreadInConv}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {new Date(conv.last_message_at).toLocaleDateString('tr-TR')}
                        </span>
                        <Clock size={12} className="text-slate-500" />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Messages View */}
          {selectedConvId ? (
            <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400">Henüz mesaj yok</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          msg.sender_id === userId
                            ? 'bg-pink-600 text-white'
                            : 'bg-slate-700 text-slate-100'
                        }`}
                      >
                        {msg.is_deleted ? (
                          <p className="text-sm italic opacity-70">Silindi</p>
                        ) : (
                          <>
                            <p className="text-sm break-words mb-1">{msg.content}</p>
                            <span className="text-xs opacity-70">
                              {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-700 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesaj yazın..."
                    disabled={sending}
                    className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-center">
              <p className="text-slate-400">Konuşma seçiniz</p>
            </div>
          )}
        </div>

        {/* New Conversation Modal */}
        {showNewConversation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Yeni Konuşma</h2>
                <button
                  onClick={() => {
                    setShowNewConversation(false)
                    setSelectedUser(null)
                    setAvailableUsers([])
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* User Search */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kullanıcı Ara
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="E-posta ile ara..."
                      onChange={(e) => searchUsers(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Selected User */}
                {selectedUser && (
                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-pink-400">{selectedUser.full_name}</span>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-pink-400 hover:text-pink-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* User List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchingUsers ? (
                    <p className="text-sm text-slate-400 text-center py-4">Aranıyor...</p>
                  ) : availableUsers.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Kullanıcı bulunamadı
                    </p>
                  ) : (
                    availableUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedUser?.id === user.id
                            ? 'bg-pink-500/20 border-pink-500/50'
                            : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon size={16} className="text-slate-400" />
                          <span className="text-sm text-white">{user.full_name}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setShowNewConversation(false)
                      setSelectedUser(null)
                      setAvailableUsers([])
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleCreateConversation}
                    disabled={!selectedUser}
                    className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Başlat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
