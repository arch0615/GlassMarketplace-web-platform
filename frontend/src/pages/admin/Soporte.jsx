import { useEffect, useRef, useState } from 'react'
import {
  Loader2,
  MessageCircle,
  Send,
  X,
  CheckCircle2,
  User as UserIcon,
  Store,
  Stethoscope,
  Mail,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { api } from '../../lib/api'

const POLL_MS = 15000

const ROLE_META = {
  cliente: { label: 'Cliente', icon: UserIcon, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  optica: { label: 'Óptica', icon: Store, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  medico: { label: 'Médico', icon: Stethoscope, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Soporte() {
  const [threads, setThreads] = useState([])
  const [filter, setFilter] = useState('open')
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedThread, setSelectedThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollerRef = useRef(null)

  const loadThreads = async () => {
    try {
      const data = await api(`/support/threads?status=${filter}`)
      setThreads(data || [])
    } catch (err) {
      toast.error(err.message || 'No se pudieron cargar las conversaciones')
    } finally {
      setLoadingThreads(false)
    }
  }

  useEffect(() => {
    setLoadingThreads(true)
    loadThreads()
    const id = setInterval(loadThreads, POLL_MS)
    return () => clearInterval(id)
  }, [filter])

  const loadThread = async (id) => {
    setLoadingThread(true)
    try {
      const data = await api(`/support/threads/${id}`)
      setSelectedThread(data.thread)
      setMessages(data.messages || [])
      // Refresh the inbox list so the unread counter drops to 0.
      loadThreads()
    } catch (err) {
      toast.error(err.message || 'No se pudo cargar la conversación')
    } finally {
      setLoadingThread(false)
    }
  }

  useEffect(() => {
    if (selectedId) loadThread(selectedId)
  }, [selectedId])

  // Poll the open thread while focused.
  useEffect(() => {
    if (!selectedId) return
    const id = setInterval(() => loadThread(selectedId), POLL_MS)
    return () => clearInterval(id)
  }, [selectedId])

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
    }
  }, [messages.length])

  const send = async () => {
    const body = draft.trim()
    if (!body || sending || !selectedId) return
    setSending(true)
    try {
      const msg = await api(`/support/threads/${selectedId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      })
      setMessages((m) => [...m, msg])
      setDraft('')
    } catch (err) {
      toast.error(err.message || 'No se pudo enviar')
    } finally {
      setSending(false)
    }
  }

  const closeThread = async () => {
    if (!selectedId) return
    try {
      await api(`/support/threads/${selectedId}/close`, { method: 'PATCH' })
      toast.success('Conversación cerrada')
      loadThreads()
      loadThread(selectedId)
    } catch (err) {
      toast.error(err.message || 'No se pudo cerrar')
    }
  }

  const TABS = [
    { id: 'open', label: 'Abiertas' },
    { id: 'closed', label: 'Cerradas' },
    { id: 'all', label: 'Todas' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Soporte</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Conversaciones con clientes, ópticas y médicos.
          </p>
        </div>
        <button
          onClick={loadThreads}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refrescar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[560px]">
        {/* Inbox list */}
        <Card className="p-0 lg:col-span-1 overflow-hidden flex flex-col">
          <div className="px-4 pt-3">
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg w-full">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setFilter(t.id); setSelectedId(null); setSelectedThread(null); setMessages([]) }}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    filter === t.id
                      ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 divide-y divide-slate-100 dark:divide-slate-700">
            {loadingThreads ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No hay conversaciones</p>
              </div>
            ) : (
              threads.map((t) => {
                const meta = ROLE_META[t.user?.role] || ROLE_META.cliente
                const Icon = meta.icon
                const active = selectedId === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      active ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {t.user?.fullName || t.user?.email || '—'}
                        </p>
                        {t.unreadForAdmin > 0 && (
                          <span className="text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-4 px-1.5 flex items-center justify-center flex-shrink-0">
                            {t.unreadForAdmin}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3" /> {t.user?.email}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {t.lastMessageAt ? formatTime(t.lastMessageAt) : 'Sin mensajes aún'}
                      </p>
                    </div>
                    {t.status === 'closed' && (
                      <Badge variant="neutral">Cerrada</Badge>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </Card>

        {/* Thread view */}
        <Card className="p-0 lg:col-span-2 overflow-hidden flex flex-col">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 text-slate-500 dark:text-slate-400">
              <MessageCircle className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Elegí una conversación</p>
              <p className="text-xs mt-1">Seleccioná un hilo del listado para leer y responder.</p>
            </div>
          ) : loadingThread && !messages.length ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedThread?.user?.role && (() => {
                    const meta = ROLE_META[selectedThread.user.role] || ROLE_META.cliente
                    const Icon = meta.icon
                    return (
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    )
                  })()}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {selectedThread?.user?.fullName || selectedThread?.user?.email}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {selectedThread?.user?.email} · {selectedThread?.user?.role}
                    </p>
                  </div>
                </div>
                {selectedThread?.status === 'open' ? (
                  <button
                    onClick={closeThread}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cerrar
                  </button>
                ) : (
                  <Badge variant="neutral">Cerrada</Badge>
                )}
              </div>

              {/* messages */}
              <div
                ref={scrollerRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50 dark:bg-slate-900/30"
              >
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 dark:text-slate-500 py-12">
                    Sin mensajes en este hilo todavía.
                  </div>
                ) : (
                  messages.map((m) => {
                    const fromAdmin = m.senderRole === 'admin'
                    return (
                      <div key={m.id} className={`flex ${fromAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                            fromAdmin
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-bl-sm'
                          }`}
                        >
                          {m.body}
                          <div className={`text-[10px] mt-1 ${fromAdmin ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                            {fromAdmin && m.sender?.fullName ? `${m.sender.fullName} · ` : ''}
                            {formatTime(m.createdAt)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* composer */}
              <div className="border-t border-slate-100 dark:border-slate-700 p-3 flex items-end gap-2 bg-white dark:bg-slate-800">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
                  }}
                  placeholder="Escribí tu respuesta..."
                  rows={2}
                  className="flex-1 resize-none px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500"
                />
                <button
                  onClick={send}
                  disabled={sending || !draft.trim()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    draft.trim() && !sending
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                  aria-label="Enviar"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
