'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, MessageSquare, Trash2, AlertCircle, Clock } from 'lucide-react'

interface Conversation {
  id: string
  user_1_id: string
  user_2_id: string
  user_1_name: string
  user_2_name: string
  message_count: number
  last_message_at: string
  created_at: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  content: string
  is_deleted: boolean
  deleted_reason?: string
  created_at: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      // First ensure user profiles exist
      const response = await fetch('/api/admin/get-conversations')

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch conversations')
      }

      // The API endpoint now ensures profiles are created, so names should be populated
      setConversations(result.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          is_deleted,
          deleted_reason,
          created_at
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Fetch sender names from profiles
      const senderIds = new Set((data || []).map(msg => msg.sender_id))
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(senderIds))

      const senderMap = new Map((profilesData || []).map(p => [p.id, p.full_name]))

      const formattedMessages = data?.map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_name: senderMap.get(msg.sender_id) || 'Unknown User',
        content: msg.content,
        is_deleted: msg.is_deleted,
        deleted_reason: msg.deleted_reason,
        created_at: msg.created_at,
      })) || []

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId)
    fetchMessages(conversationId)
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!deleteReason.trim()) {
      alert('Silme sebebini giriniz')
      return
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          deleted_reason: deleteReason,
          deleted_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', messageId)

      if (error) throw error

      setMessages(messages.map(m =>
        m.id === messageId ? { ...m, is_deleted: true, deleted_reason: deleteReason } : m
      ))
      setSelectedMessage(null)
      setDeleteReason('')
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Mesaj silinirken hata oluştu')
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user_1_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user_2_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={28} className="text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Mesajlar</h1>
        </div>
        <p className="text-slate-400">Kullanıcı konuşmalarını yönetin ve zararlı içeriği silin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversations List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400">Yükleniyor...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400">Konuşma bulunamadı</p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                    selectedConversation === conv.id ? 'bg-blue-500/20 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{conv.user_1_name}</span>
                    <span className="text-xs text-slate-400">{conv.message_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">→ {conv.user_2_name}</span>
                    <Clock size={12} className="text-slate-500" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages View */}
        {selectedConversation && (
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Mesaj yok</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-blue-400">{msg.sender_name}</span>
                        <span className="text-xs text-slate-400 ml-2">
                          {new Date(msg.created_at).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      {!msg.is_deleted && (
                        <button
                          onClick={() => setSelectedMessage(msg.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {msg.is_deleted ? (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={14} />
                        <span>SİLİNDİ: {msg.deleted_reason}</span>
                      </div>
                    ) : (
                      <p className="text-slate-200 text-sm break-words">{msg.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Delete Confirmation */}
            {selectedMessage && (
              <div className="border-t border-slate-700 p-4 bg-red-500/10 border-t-red-500/30">
                <p className="text-sm text-white mb-3">Mesajı silmek için sebebi giriniz:</p>
                <div className="flex gap-2">
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Ör: Küfür, Taciz, Spam..."
                    className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-red-500"
                    rows={2}
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Sil
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMessage(null)
                        setDeleteReason('')
                      }}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedConversation && (
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-center h-[600px]">
            <p className="text-slate-400">Konuşma seçiniz</p>
          </div>
        )}
      </div>
    </div>
  )
}
