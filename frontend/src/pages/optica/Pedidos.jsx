import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Package, Clock, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const STATUS_MAP = {
  payment_pending: { variant: 'info', label: 'Pendiente' },
  payment_held: { variant: 'info', label: 'Pago retenido' },
  in_process: { variant: 'warning', label: 'En proceso' },
  delivered: { variant: 'success', label: 'Entregado' },
  completed: { variant: 'success', label: 'Completado' },
  dispute: { variant: 'danger', label: 'Disputa' },
  refunded: { variant: 'neutral', label: 'Reembolsado' },
  cancelled: { variant: 'neutral', label: 'Cancelado' },
}

export default function OpticaPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    api('/orders/mine')
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const markDelivered = async (id) => {
    setActionLoading(true)
    try {
      const updated = await api(`/orders/${id}/deliver`, { method: 'PATCH' })
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
      toast.success('Pedido marcado como Entregado. El cliente tiene 48 h para confirmar.')
    } catch (err) {
      toast.error(err.message || 'Error al marcar como entregado')
    } finally {
      setActionLoading(false)
      setConfirmId(null)
    }
  }

  const confirmingOrder = orders.find((o) => o.id === confirmId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Seguí el estado de cada pedido activo y completado
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'En proceso', statuses: ['payment_pending', 'payment_held', 'in_process'], icon: Package, color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { label: 'Entregados', statuses: ['delivered'], icon: Clock, color: 'text-sky-600 bg-sky-50 border-sky-200' },
          { label: 'Completados', statuses: ['completed'], icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        ].map(({ label, statuses, icon: Icon, color }) => (
          <div
            key={label}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${color}`}
          >
            <Icon className="w-4 h-4" />
            {label}: {orders.filter((o) => statuses.includes(o.status)).length}
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No tenés pedidos aún.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Armazón</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => {
                const st = STATUS_MAP[order.status] || { variant: 'neutral', label: order.status }
                const date = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                const clientName = order.client?.fullName || 'Cliente'
                const frame = order.selectedFrame ? `${order.selectedFrame.brand} ${order.selectedFrame.model}` : '—'
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600">#{order.id.slice(0, 8)}</td>
                    <td className="px-5 py-4 text-slate-700">{clientName}</td>
                    <td className="px-5 py-4 text-slate-600">{frame}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{date}</td>
                    <td className="px-5 py-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-5 py-4">
                      {['payment_pending', 'payment_held', 'in_process'].includes(order.status) && (
                        <Button size="sm" variant="primary" onClick={() => setConfirmId(order.id)}>
                          <CheckCircle className="w-3.5 h-3.5" /> Marcar Entregado
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-sky-500" /> Esperando confirmación
                        </span>
                      )}
                      {order.status === 'completed' && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Completado
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Delivery confirmation modal */}
      {confirmId && confirmingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Confirmar entrega</h3>
              </div>
              <button onClick={() => setConfirmId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-amber-800 mb-1">Atención</p>
              <p className="text-sm text-amber-700">
                El cliente tendrá <strong>48 horas</strong> para confirmar la recepción. El pago quedará retenido durante ese período.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Pedido</span>
                <span className="font-mono font-semibold">#{confirmingOrder.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between text-slate-600 mt-1">
                <span>Cliente</span>
                <span className="font-medium">{confirmingOrder.client?.fullName || 'Cliente'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmId(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={() => markDelivered(confirmId)} disabled={actionLoading}>
                {actionLoading ? 'Procesando...' : 'Confirmar entrega'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
