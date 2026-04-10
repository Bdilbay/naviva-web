'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertCircle, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react'

interface MessageReport {
  id: string
  message_id: string
  message_content: string
  reporter_email: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  action_taken?: string
  created_at: string
}

interface BlockedWord {
  id: string
  word: string
  replacement: string
  severity: 'low' | 'medium' | 'high'
  created_at: string
}

export default function ModerationPage() {
  const [reports, setReports] = useState<MessageReport[]>([])
  const [blockedWords, setBlockedWords] = useState<BlockedWord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'reports' | 'blocked-words'>('reports')
  const [reportStatus, setReportStatus] = useState<'pending' | 'all'>('pending')
  const [newWord, setNewWord] = useState('')
  const [newReplacement, setNewReplacement] = useState('[CENSORED]')
  const [newSeverity, setNewSeverity] = useState<'low' | 'medium' | 'high'>('medium')
  const [actionNote, setActionNote] = useState('')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
    fetchBlockedWords()
  }, [reportStatus])

  const fetchReports = async () => {
    try {
      let query = supabase
        .from('message_reports')
        .select(`
          id,
          message_id,
          reporter_id,
          reason,
          status,
          action_taken,
          created_at,
          messages(content, sender_id)
        `)

      if (reportStatus === 'pending') {
        query = query.eq('status', 'pending')
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const formattedReports = data?.map((report: any) => ({
        id: report.id,
        message_id: report.message_id,
        message_content: report.messages?.content || '[Silindi]',
        reporter_email: `User ${report.reporter_id.slice(0, 8)}`,
        reason: report.reason,
        status: report.status,
        action_taken: report.action_taken,
        created_at: report.created_at,
      })) || []

      setReports(formattedReports)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setLoading(false)
    }
  }

  const fetchBlockedWords = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_words')
        .select('id, word, replacement, severity, created_at')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      setBlockedWords(data || [])
    } catch (error) {
      console.error('Error fetching blocked words:', error)
    }
  }

  const handleReportAction = async (
    reportId: string,
    action: 'resolved' | 'dismissed',
    note: string
  ) => {
    if (!note.trim()) {
      alert('İşlem notu giriniz')
      return
    }

    try {
      const { error } = await supabase
        .from('message_reports')
        .update({
          status: action,
          action_taken: note,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId)

      if (error) throw error

      setReports(reports.map(r =>
        r.id === reportId ? { ...r, status: action, action_taken: note } : r
      ))
      setSelectedReport(null)
      setActionNote('')
    } catch (error) {
      console.error('Error updating report:', error)
      alert('Rapor güncellenirken hata oluştu')
    }
  }

  const handleAddBlockedWord = async () => {
    if (!newWord.trim()) {
      alert('Kelime giriniz')
      return
    }

    try {
      const { data, error } = await supabase
        .from('blocked_words')
        .insert({
          word: newWord.toLowerCase(),
          replacement: newReplacement,
          severity: newSeverity,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()

      if (error) throw error

      if (data) {
        setBlockedWords([data[0], ...blockedWords])
        setNewWord('')
        setNewReplacement('[CENSORED]')
        setNewSeverity('medium')
      }
    } catch (error) {
      console.error('Error adding blocked word:', error)
      alert('Kelime eklenirken hata oluştu')
    }
  }

  const handleDeleteBlockedWord = async (wordId: string) => {
    if (!confirm('Bu kelimeyi silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('blocked_words')
        .delete()
        .eq('id', wordId)

      if (error) throw error

      setBlockedWords(blockedWords.filter(w => w.id !== wordId))
    } catch (error) {
      console.error('Error deleting blocked word:', error)
      alert('Kelime silinirken hata oluştu')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle size={28} className="text-red-400" />
          <h1 className="text-3xl font-bold text-white">Denetim</h1>
        </div>
        <p className="text-slate-400">İçerik kurallarını yönetin ve raporlanan mesajları gözden geçirin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Raporlanan Mesajlar
        </button>
        <button
          onClick={() => setActiveTab('blocked-words')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'blocked-words'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Bloke Edilen Kelimeler
        </button>
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setReportStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportStatus === 'pending'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Beklemede ({reports.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setReportStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Tümü ({reports.length})
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-400">Yükleniyor...</p>
            ) : reports.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
                <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
                <p className="text-slate-400">Raporlanan mesaj yok</p>
              </div>
            ) : (
              reports.map(report => (
                <div
                  key={report.id}
                  className={`bg-slate-800/50 border-2 rounded-2xl p-6 transition-colors ${
                    report.status === 'pending'
                      ? 'border-red-500/30'
                      : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-400">
                          {report.reporter_email}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(report.status)}`}>
                          {report.status === 'pending' ? 'BEKLEMEDEhazır' : report.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">Sebep: {report.reason}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(report.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4 mb-4 border border-slate-600">
                    <p className="text-slate-300 text-sm break-words">{report.message_content}</p>
                  </div>

                  {report.status !== 'pending' && report.action_taken && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-400">İşlem: {report.action_taken}</p>
                    </div>
                  )}

                  {report.status === 'pending' && (
                    <>
                      {selectedReport === report.id ? (
                        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                          <p className="text-sm text-white mb-3">Yönetici notu:</p>
                          <textarea
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                            placeholder="İşlemi açıklayın..."
                            className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 mb-3"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReportAction(report.id, 'resolved', actionNote)}
                              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={16} />
                              Çözüldü
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'dismissed', actionNote)}
                              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <XCircle size={16} />
                              Reddedildi
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReport(null)
                                setActionNote('')
                              }}
                              className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedReport(report.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          İşlem Yap
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Blocked Words Tab */}
      {activeTab === 'blocked-words' && (
        <div>
          {/* Add New Word */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus size={20} />
              Yeni Kelime Ekle
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Kelime veya İfade
                </label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Ör: küfür, taciz..."
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Değiştirme Metni
                </label>
                <input
                  type="text"
                  value={newReplacement}
                  onChange={(e) => setNewReplacement(e.target.value)}
                  placeholder="[CENSORED]"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Önem Derecesi
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddBlockedWord}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Blocked Words List */}
          <div className="grid grid-cols-1 gap-4">
            {blockedWords.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
                <p className="text-slate-400">Bloke edilen kelime yok</p>
              </div>
            ) : (
              blockedWords.map(word => (
                <div
                  key={word.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center justify-between hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="px-3 py-1 bg-slate-700/50 rounded text-white font-mono text-sm">
                        {word.word}
                      </code>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(word.severity)}`}>
                        {word.severity === 'high'
                          ? 'YÜKSEK'
                          : word.severity === 'medium'
                          ? 'ORTA'
                          : 'DÜŞÜK'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Değiştirme: <code className="text-slate-300">{word.replacement}</code>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBlockedWord(word.id)}
                    className="text-red-400 hover:text-red-300 p-2 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
