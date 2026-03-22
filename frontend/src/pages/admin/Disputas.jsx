import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Send,
  DollarSign,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const TABS = [
  { key: 'open', label: 'Activas' },
  { key: 'resolved', label: 'Resueltas' },
]

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

function DisputeCard({ dispute, onResolve }) {
  const [expanded, setExpanded] = useState(false)
  const [newMsg, setNewMsg] = useState('')
  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [resolving, setResolving] = useState(false)

  const loadMessages = async () => {
    if (messages.length > 0) { setExpanded(!expanded); return }
    setLoadingMsgs(true)
    try {
      const data = await api(`/disputes/${dispute.id}`)
      setMessages(data.messages || [])
      setExpanded(true)
    } catch { }
    finally { setLoadingMsgs(false) }
  }

  const sendMessage = async () => {
    if (!newMsg.trim()) return
    setSending(true)
    try {
      const msg = await api(`/disputes/${dispute.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: newMsg.trim() }),
      })
      setMessages((prev) => [...prev, msg])
      setNewMsg('')
      toast.success('Mensaje enviado.')
    } catch (err) {
      toast.error(err.message || 'Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }

  const handleResolve = async (decision) => {
    setResolving(true)
    try {
      await api(`/disputes/${dispute.id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ decision, adminDecision: `Admin resolved: ${decision}` }),
      })
      toast.success(decision === 'release' ? 'Pago liberado a óptica.' : decision === 'refund' ? 'Reembolso emitido al cliente.' : 'Corrección solicitada.')
      onResolve?.()
    } catch (err) {
      toast.error(err.message || 'Error al resolver')
    } finally {
      setResolving(false)
    }
  }

  const date = new Date(dispute.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-bold text-slate-800 dark:text-slate-100">Pedido #{dispute.order?.id?.slice(0, 8) || '—'}</span>
              <Badge variant={dispute.status === 'open' ? 'danger' : 'success'}>
                {dispute.status === 'open' ? 'Activa' : 'Resuelta'}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{dispute.reason || dispute.comment}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Abierta el {date}</p>
          </div>
          <button onClick={loadMessages} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            {loadingMsgs ? <Loader2 className="w-5 h-5 animate-spin" /> : expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded messages + actions */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-4 space-y-4">
          {/* Messages */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.map((msg) => {
              const role = msg.senderRole || 'cliente'
              return (
                <div key={msg.id} className={`rounded-xl border p-3 ${msgColors[role] || 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${msgNameColors[role] || 'text-slate-700 dark:text-slate-300'}`}>
                      {msg.sender?.fullName || role}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(msg.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{msg.message}</p>
                </div>
              )
            })}
          </div>

          {/* Send message */}
          {dispute.status === 'open' && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Escribir mensaje como admin..."
                  className="flex-1 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button size="sm" onClick={sendMessage} disabled={sending}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Resolution actions */}
              <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-700">
                <Button size="sm" variant="success" onClick={() => handleResolve('release')} disabled={resolving}>
                  <DollarSign className="w-3.5 h-3.5" /> Liberar pago a óptica
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleResolve('refund')} disabled={resolving}>
                  <RotateCcw className="w-3.5 h-3.5" /> Reembolsar al cliente
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleResolve('correction')} disabled={resolving}>
                  Solicitar corrección
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}

export default function Disputas() {
  const [activeTab, setActiveTab] = useState('open')
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDisputes = () => {
    setLoading(true)
    api(`/admin/disputes?status=${activeTab}`)
      .then(setDisputes)
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDisputes() }, [activeTab])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Centro de Resolución</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Gestioná las disputas entre clientes y ópticas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : disputes.length === 0 ? (
        <Card className="p-10 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No hay disputas {activeTab === 'open' ? 'activas' : 'resueltas'}.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {disputes.map((dispute) => (
            <DisputeCard key={dispute.id} dispute={dispute} onResolve={loadDisputes} />
          ))}
        </div>
      )}
    </div>
  )
}
