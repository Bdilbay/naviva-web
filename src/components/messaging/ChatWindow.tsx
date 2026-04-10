'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, AlertCircle, Trash2, Flag } from 'lucide-react'
import { getMessages, sendMessage, deleteMessage, reportMessage } from '@/lib/messaging-service'
import { Message } from '@/lib/messaging-service'
import { supabase } from '@/lib/supabase'

interface ChatWindowProps {
  conversationId: string
  currentUserId: string
  otherUserEmail: string
}

export function ChatWindow({ conversationId, currentUserId, otherUserEmail }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [flaggedWord, setFlaggedWord] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const msgs = await getMessages(conversationId)
      setMessages(msgs)
      setLoading(false)
    } catch (error) {
      console.error('Error loading messages:', error)
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    setSending(true)
    try {
      const { message, flagged, severity } = await sendMessage(
        conversationId,
        currentUserId,
        newMessage
      )

      setMessages(prev => [...prev, message])
      setNewMessage('')

      if (flagged && severity === 'high') {
        setFlaggedWord(severity)
        setTimeout(() => setFlaggedWord(null), 3000)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Mesaj gönderilemedi')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    const reason = prompt('Silme sebebi:')
    if (!reason) return

    try {
      await deleteMessage(messageId, reason)
      setMessages(msgs => msgs.map(m =>
        m.id === messageId ? { ...m, is_deleted: true, deleted_reason: reason } : m
      ))
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Mesaj silinirken hata oluştu')
    }
  }

  const handleReportMessage = async (messageId: string) => {
    const reason = prompt('Raporlama sebebi:')
    if (!reason) return

    try {
      await reportMessage(messageId, currentUserId, reason)
      alert('Mesaj bildirildi. Moderatörler bunu inceleyecek.')
    } catch (error) {
      console.error('Error reporting message:', error)
      alert('Mesaj bildirilirken hata oluştu')
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-800/50">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">Mesaj yok. Konuşmayı başlatın!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.sender_id === currentUserId
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                {msg.is_deleted ? (
                  <div className="flex items-center gap-2 text-sm italic opacity-70">
                    <AlertCircle size={14} />
                    <span>Silindi: {msg.deleted_reason}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm break-words mb-1">{msg.content}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.sender_id !== currentUserId && (
                        <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleReportMessage(msg.id)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Bildir"
                          >
                            <Flag size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {flaggedWord && (
        <div className="bg-yellow-500/20 border-t border-yellow-500/30 px-4 py-2 flex items-center gap-2 text-yellow-400 text-sm">
          <AlertCircle size={16} />
          <span>Mesajınız filtrelendi - uygunsuz içerik algılandı</span>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="border-t border-slate-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesaj yazın..."
            disabled={sending}
            className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
