import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Send,
  RefreshCw,
  X,
  DollarSign,
  RotateCcw,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const INITIAL_DISPUTES = {
  active: [
    {
      id: 'd1',
      orderId: '#PED-0089',
      client: 'Cliente #1012',
      optica: 'Centro Óptico Palermo',
      reason: 'El cliente reporta que los lentes entregados no coinciden con la receta prescripta.',
      openedAt: '9 mar 2026',
      messages: [
        {
          id: 1,
          sender: 'client',
          name: 'Cliente #1012',
          text: 'Los lentes que recibí tienen una graduación incorrecta. Tengo una receta de -2.50 y estos son -1.75.',
          time: '9 mar, 14:32',
        },
        {
          id: 2,
          sender: 'optica',
          name: 'Centro Óptico Palermo',
          text: 'Revisamos el pedido y los lentes fueron fabricados según la receta digital recibida. Pedimos al cliente que traiga la receta original para cotejo.',
          time: '9 mar, 15:10',
        },
        {
          id: 3,
          sender: 'admin',
          name: 'Soporte Lensia',
          text: 'Estamos revisando el caso. Solicitamos a ambas partes que proporcionen evidencia en las próximas 24 horas.',
          time: '10 mar, 09:00',
        },
      ],
    },
    {
      id: 'd2',
      orderId: '#PED-0084',
      client: 'Cliente #1001',
      optica: 'Óptica Floresta',
      reason: 'El armazón entregado presenta defecto de fabricación: bisagra rota al primer uso.',
      openedAt: '8 mar 2026',
      messages: [
        {
          id: 1,
          sender: 'client',
          name: 'Cliente #1001',
          text: 'Al abrir las gafas por primera vez la bisagra izquierda se rompió. Producto defectuoso.',
          time: '8 mar, 11:05',
        },
        {
          id: 2,
          sender: 'optica',
          name: 'Óptica Floresta',
          text: 'Lamentamos el inconveniente. Podemos enviar un armazón de reemplazo o realizar el reembolso correspondiente.',
          time: '8 mar, 12:30',
        },
      ],
    },
  ],
  resolved: [
    {
      id: 'd3',
      orderId: '#PED-0077',
      client: 'Cliente #0988',
      optica: 'Óptica Visión Norte',
      reason: 'Demora en entrega mayor a 15 días hábiles.',
      openedAt: '28 feb 2026',
      resolvedAt: '5 mar 2026',
      resolution: 'Pago liberado a óptica — cliente aceptó la demora como justificada.',
    },
    {
      id: 'd4',
      orderId: '#PED-0071',
      client: 'Cliente #0976',
      optica: 'Centro Óptico Palermo',
      reason: 'Reclamó armazón diferente al seleccionado.',
      openedAt: '20 feb 2026',
      resolvedAt: '25 feb 2026',
      resolution: 'Reembolso emitido al cliente.',
    },
    {
      id: 'd5',
      orderId: '#PED-0068',
      client: 'Cliente #0971',
      optica: 'Visión Palermo',
      reason: 'Error en precio cotizado vs cobrado.',
      openedAt: '14 feb 2026',
      resolvedAt: '18 feb 2026',
      resolution: 'Corrección solicitada — óptica emitió ajuste de precio.',
    },
  ],
}

const TABS = [
  { key: 'active', label: 'Activas' },
  { key: 'resolved', label: 'Resueltas' },
]

const msgColors = {
  client: 'bg-blue-50 border-blue-100',
  optica: 'bg-slate-50 border-slate-100',
  admin: 'bg-amber-50 border-amber-100',
}
const msgNameColors = {
  client: 'text-blue-700',
  optica: 'text-slate-700',
  admin: 'text-amber-700',
}

function ActiveDisputeCard({ dispute, onAction }) {
  const [expanded, setExpanded] = useState(false)
  const [newMsg, setNewMsg] = useState('')
  const [messages, setMessages] = useState(dispute.messages)
  const [confirmAction, setConfirmAction] = useState(null)

  const sendMessage = () => {
    if (!newMsg.trim()) return
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'admin',
        name: 'Soporte Lensia',
        text: newMsg.trim(),
        time: 'Ahora',
      },
    ])
    setNewMsg('')
    toast.success('Mensaje enviado.')
  }

  const ACTIONS = [
    {
      key: 'release',
      label: 'Liberar pago a óptica',
      icon: DollarSign,
      className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      confirmMsg: `¿Confirmás liberar el pago al comercio para el pedido ${dispute.orderId}? Esta acción es irreversible.`,
      successMsg: 'Pago liberado a la óptica.',
    },
    {
      key: 'refund',
      label: 'Reembolsar cliente',
      icon: RotateCcw,
      className: 'bg-red-600 hover:bg-red-700 text-white',
      confirmMsg: `¿Confirmás emitir el reembolso al cliente para el pedido ${dispute.orderId}?`,
      successMsg: 'Reembolso emitido al cliente.',
    },
    {
      key: 'correction',
      label: 'Solicitar corrección',
      icon: RefreshCw,
      className: 'bg-amber-500 hover:bg-amber-600 text-white',
      confirmMsg: `¿Confirmás solicitar una corrección a la óptica para el pedido ${dispute.orderId}?`,
      successMsg: 'Corrección solicitada a la óptica.',
    },
  ]

  const handleConfirm = () => {
    const action = ACTIONS.find((a) => a.key === confirmAction)
    if (action) {
      toast.success(action.successMsg)
      onAction(dispute.id)
    }
    setConfirmAction(null)
  }

  const pending = ACTIONS.find((a) => a.key === confirmAction)

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-bold text-slate-600">{dispute.orderId}</span>
                <Badge variant="danger">En disputa</Badge>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {dispute.client} vs. {dispute.optica}
              </p>
              <p className="text-sm text-slate-500 mt-1">{dispute.reason}</p>
              <p className="text-xs text-slate-400 mt-1">Abierta el {dispute.openedAt}</p>
            </div>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Centro de resolución
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-slate-100 p-5">
            {/* Message thread */}
            <div className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl border p-3 ${msgColors[msg.sender]}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${msgNameColors[msg.sender]}`}>
                      {msg.name}
                    </span>
                    <span className="text-xs text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-sm text-slate-700">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Admin message input */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribí un mensaje como admin..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="sm" onClick={sendMessage}>
                <Send className="w-3.5 h-3.5" /> Enviar
              </Button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.key}
                    onClick={() => setConfirmAction(action.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${action.className}`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {action.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Confirm modal */}
      {confirmAction && pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <Card className="w-full max-w-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800">Confirmar acción</h3>
              </div>
              <button onClick={() => setConfirmAction(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-5">{pending.confirmMsg}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

export default function Disputas() {
  const [activeTab, setActiveTab] = useState('active')
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES)

  const handleResolve = (id) => {
    const resolved = disputes.active.find((d) => d.id === id)
    if (!resolved) return
    setDisputes((prev) => ({
      active: prev.active.filter((d) => d.id !== id),
      resolved: [
        { ...resolved, resolvedAt: 'Hoy', resolution: 'Resuelta por el equipo de soporte.' },
        ...prev.resolved,
      ],
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Disputas</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gestión de conflictos entre clientes y ópticas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label }) => {
          const count = key === 'active' ? disputes.active.length : disputes.resolved.length
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  activeTab === key && key === 'active'
                    ? 'bg-red-500 text-white'
                    : activeTab === key
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active disputes */}
      {activeTab === 'active' && (
        <div className="flex flex-col gap-4">
          {disputes.active.length === 0 ? (
            <Card className="p-10 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No hay disputas activas.</p>
            </Card>
          ) : (
            disputes.active.map((dispute) => (
              <ActiveDisputeCard
                key={dispute.id}
                dispute={dispute}
                onAction={handleResolve}
              />
            ))
          )}
        </div>
      )}

      {/* Resolved disputes */}
      {activeTab === 'resolved' && (
        <div className="flex flex-col gap-3">
          {disputes.resolved.map((dispute) => (
            <Card key={dispute.id} className="p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-bold text-slate-600">
                      {dispute.orderId}
                    </span>
                    <Badge variant="success">Resuelta</Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {dispute.client} vs. {dispute.optica}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{dispute.reason}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-slate-400">Abierta: {dispute.openedAt}</span>
                    <span className="text-xs text-slate-400">Resuelta: {dispute.resolvedAt}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Resolución
                </p>
                <p className="text-sm text-slate-700">{dispute.resolution}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
