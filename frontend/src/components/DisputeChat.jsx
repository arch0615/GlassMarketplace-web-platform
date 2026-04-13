import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const msgColors = {
  cliente: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
  optica: 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600',
  admin: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
}
const msgNameColors = {
  cliente: 'text-blue-700 dark:text-blue-400',
  optica: 'text-slate-700 dark:text-slate-300',
  admin: 'text-amber-700 dark:text-amber-400',
}
const roleLabels = {
  cliente: 'Cliente',
  optica: 'Óptica',
  admin: 'Administrador',
}

const STATUS_MAP = {
  open: { variant: 'danger', label: 'Abierta' },
  resolved: { variant: 'success', label: 'Resuelta' },
  refunded: { variant: 'neutral', label: 'Reembolsada' },
  correction: { variant: 'warning', label: 'En corrección por óptica' },
  correction_done: { variant: 'info', label: 'Corrección lista — esperando cliente' },
}

const REASON_LABELS = {
  wrong_prescription: 'Graduación incorrecta',
  damage: 'Producto dañado',
  mismatch: 'No coincide con lo solicitado',
  not_received: 'No recibí el pedido',
  other: 'Otro motivo',
}

/**
 * Shared dispute chat component for client, optica, and admin.
 * Fetches dispute(s) for the given order ID and shows the chat + messages.
 */
export default function DisputeChat({ orderId }) {
  const { user } = useAuth()
  const [dispute, setDispute] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const scrollRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const full = await api(`/disputes/by-order/${orderId}`)
      if (full && full.id) {
        setDispute(full)
        setMessages(full.messages || [])
      }
    } catch {
      // silent — no dispute for this order
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => { load() }, [load])

  // Poll for new messages every 10 seconds while dispute is active
  useEffect(() => {
    if (!dispute || ['resolved', 'refunded'].includes(dispute.status)) return
    const interval = setInterval(async () => {
      try {
        const full = await api(`/disputes/by-order/${orderId}`)
        if (full) {
          setDispute(full)
          setMessages(full.messages || [])
        }
      } catch { }
    }, 10000)
    return () => clearInterval(interval)
  }, [dispute, orderId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!newMsg.trim() || !dispute) return
    setSending(true)
    try {
      const msg = await api(`/disputes/${dispute.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: newMsg.trim() }),
      })
      setMessages((prev) => [...prev, msg])
      setNewMsg('')
    } catch (err) {
      toast.error(err.message || 'Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }

  const handleMarkCorrected = async () => {
    if (!confirm('¿Confirmás que ya realizaste la corrección? El cliente recibirá un aviso para verificarla.')) return
    setActionLoading(true)
    try {
      const updated = await api(`/disputes/${dispute.id}/mark-corrected`, { method: 'PATCH' })
      setDispute({ ...dispute, ...updated })
      // Reload messages
      const full = await api(`/disputes/by-order/${orderId}`)
      if (full) { setDispute(full); setMessages(full.messages || []) }
      toast.success('Corrección marcada. Esperando confirmación del cliente.')
    } catch (err) {
      toast.error(err.message || 'Error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmCorrection = async () => {
    if (!confirm('¿Confirmás que la corrección está correcta? Esto cerrará la disputa y liberará el pago a la óptica.')) return
    setActionLoading(true)
    try {
      const updated = await api(`/disputes/${dispute.id}/confirm-correction`, { method: 'PATCH' })
      setDispute({ ...dispute, ...updated })
      const full = await api(`/disputes/by-order/${orderId}`)
      if (full) { setDispute(full); setMessages(full.messages || []) }
      toast.success('Corrección confirmada. Disputa cerrada.')
    } catch (err) {
      toast.error(err.message || 'Error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectCorrection = async () => {
    const reason = prompt('¿Por qué rechazás la corrección? (opcional)')
    if (reason === null) return
    setActionLoading(true)
    try {
      const updated = await api(`/disputes/${dispute.id}/reject-correction`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      })
      setDispute({ ...dispute, ...updated })
      const full = await api(`/disputes/by-order/${orderId}`)
      if (full) { setDispute(full); setMessages(full.messages || []) }
      toast.success('Corrección rechazada. La disputa sigue abierta.')
    } catch (err) {
      toast.error(err.message || 'Error')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando disputa...
        </div>
      </Card>
    )
  }

  if (!dispute) return null

  const st = STATUS_MAP[dispute.status] || { variant: 'neutral', label: dispute.status }

  return (
    <Card className="p-5 border-2 border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Centro de resolución de disputa
        </h2>
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>

      {/* Dispute info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500 dark:text-slate-400">Motivo</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{REASON_LABELS[dispute.reason] || dispute.reason}</span>
        </div>
        {dispute.comment && (
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Descripción del cliente: </span>
            <span className="whitespace-pre-line">{dispute.comment}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="max-h-80 overflow-y-auto mb-3 pr-1">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
            No hay mensajes todavía. Iniciá la conversación.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border p-2.5 ${msgColors[m.senderRole] || 'bg-slate-50 dark:bg-slate-700/50'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${msgNameColors[m.senderRole] || 'text-slate-600'}`}>
                    {roleLabels[m.senderRole] || m.senderRole} · {m.sender?.fullName || ''}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(m.createdAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message input — available in any non-final state */}
      {!['resolved', 'refunded'].includes(dispute.status) && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !sending && sendMessage()}
            placeholder="Escribí un mensaje..."
            disabled={sending}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
          <Button onClick={sendMessage} disabled={sending || !newMsg.trim()} size="md">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {/* Optica action: mark correction as done */}
      {user?.role === 'optica' && dispute.status === 'correction' && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-300 mb-2">
            El administrador solicitó una corrección. Cuando termines el trabajo, marcá la corrección como completada.
          </p>
          <Button onClick={handleMarkCorrected} disabled={actionLoading} size="sm" className="gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Marcar corrección como realizada
          </Button>
        </div>
      )}

      {/* Client actions: confirm or reject correction */}
      {user?.role === 'cliente' && dispute.status === 'correction_done' && (
        <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
            La óptica marcó la corrección como completada. ¿La revisaste? Confirmá si está correcta o rechazala si todavía hay problemas.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleConfirmCorrection} disabled={actionLoading} size="sm" className="gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Confirmar corrección
            </Button>
            <Button onClick={handleRejectCorrection} disabled={actionLoading} size="sm" variant="danger" className="gap-1.5">
              <XCircle className="w-4 h-4" /> Rechazar corrección
            </Button>
          </div>
        </div>
      )}

      {/* Waiting messages for the other party */}
      {user?.role === 'cliente' && dispute.status === 'correction' && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 text-center">
          Esperando que la óptica realice la corrección solicitada por el administrador.
        </p>
      )}
      {user?.role === 'optica' && dispute.status === 'correction_done' && (
        <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 text-center">
          Esperando que el cliente verifique y confirme la corrección realizada.
        </p>
      )}

      {dispute.adminDecision && (
        <div className="mt-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200">
          <span className="font-bold">Decisión del administrador: </span>
          {dispute.adminDecision}
        </div>
      )}
    </Card>
  )
}
