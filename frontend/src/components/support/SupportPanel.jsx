import { useEffect, useRef, useState } from 'react'
import { X, Send, Loader2, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'

const POLL_MS = 8000

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function SupportPanel({ open, onClose, onUnreadChange }) {
  const [messages, setMessages] = useState([])
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')
  const scrollerRef = useRef(null)

  const fetchThread = async () => {
    try {
      const data = await api('/support/me')
      setThread(data.thread)
      setMessages(data.messages || [])
      onUnreadChange?.(0)
    } catch (err) {
      console.warn('support fetch failed', err)
    }
  }

  // First load + polling while open.
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchThread().finally(() => setLoading(false))
    const id = setInterval(fetchThread, POLL_MS)
    return () => clearInterval(id)
  }, [open])

  // Auto-scroll on new messages.
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
    }
  }, [messages.length])

  const send = async () => {
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    try {
      const msg = await api('/support/me/messages', {
        method: 'POST',
        body: JSON.stringify({ body }),
      })
      setMessages((m) => [...m, msg])
      setDraft('')
    } catch (err) {
      toast.error(err.message || 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* backdrop only on mobile */}
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 right-0 left-0 sm:left-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 max-w-full
                   bg-white dark:bg-slate-800 sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700
                   flex flex-col"
        style={{ maxHeight: 'min(620px, 90vh)' }}
        role="dialog"
        aria-label="Chat de soporte"
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Soporte Lensia</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Solemos responder en horario comercial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center"
            aria-label="Cerrar chat"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* messages */}
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 dark:bg-slate-900/30"
        >
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mx-auto mb-3 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">¿En qué te podemos ayudar?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Escribinos tu consulta y te respondemos lo antes posible.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.senderRole === 'user'
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                      mine
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-bl-sm'
                    }`}
                  >
                    {m.body}
                    <div className={`text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
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
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Escribí tu mensaje..."
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
      </div>
    </>
  )
}
