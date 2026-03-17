import { useState } from 'react'
import toast from 'react-hot-toast'
import { Package, Clock, CheckCircle, AlertCircle, X } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const INITIAL_ORDERS = [
  {
    id: '#PED-0088',
    client: 'Cliente #1009',
    frame: 'Ray-Ban RB5154',
    date: '10 mar 2026',
    status: 'pendiente',
  },
  {
    id: '#PED-0091',
    client: 'Cliente #1018',
    frame: 'Silhouette 5500',
    date: '11 mar 2026',
    status: 'en_proceso',
  },
  {
    id: '#PED-0095',
    client: 'Cliente #1023',
    frame: 'Oakley OX8046',
    date: '12 mar 2026',
    status: 'en_proceso',
  },
  {
    id: '#PED-0082',
    client: 'Cliente #0997',
    frame: 'Lindberg Air 4481',
    date: '8 mar 2026',
    status: 'entregado',
  },
  {
    id: '#PED-0079',
    client: 'Cliente #0991',
    frame: 'Prada PR 06ZV',
    date: '6 mar 2026',
    status: 'entregado',
  },
]

const statusConfig = {
  pendiente: { variant: 'info', label: 'Pendiente' },
  en_proceso: { variant: 'warning', label: 'En proceso' },
  entregado: { variant: 'success', label: 'Entregado' },
}

export default function OpticaPedidos() {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [confirmId, setConfirmId] = useState(null)

  const markInProcess = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'en_proceso' } : o))
    )
    toast.success('Pedido marcado como En Proceso.')
  }

  const markDelivered = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'entregado' } : o))
    )
    toast.success('Pedido marcado como Entregado. El cliente tiene 48 h para confirmar.')
    setConfirmId(null)
  }

  const confirmingOrder = orders.find((o) => o.id === confirmId)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Seguí el estado de cada pedido activo y completado
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Pendientes', status: 'pendiente', icon: Clock, color: 'text-sky-600 bg-sky-50 border-sky-200' },
          { label: 'En proceso', status: 'en_proceso', icon: Package, color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { label: 'Entregados', status: 'entregado', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        ].map(({ label, status, icon: Icon, color }) => (
          <div
            key={status}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${color}`}
          >
            <Icon className="w-4 h-4" />
            {label}: {orders.filter((o) => o.status === status).length}
          </div>
        ))}
      </div>

      {/* Orders table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                ID Pedido
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Cliente
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Armazón
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Fecha
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Estado
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => {
              const sc = statusConfig[order.status]
              return (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600">
                    {order.id}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{order.client}</td>
                  <td className="px-5 py-4 text-slate-600">{order.frame}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{order.date}</td>
                  <td className="px-5 py-4">
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    {order.status === 'pendiente' && (
                      <Button size="sm" variant="secondary" onClick={() => markInProcess(order.id)}>
                        Marcar En Proceso
                      </Button>
                    )}
                    {order.status === 'en_proceso' && (
                      <Button size="sm" variant="primary" onClick={() => setConfirmId(order.id)}>
                        <CheckCircle className="w-3.5 h-3.5" /> Marcar Entregado
                      </Button>
                    )}
                    {order.status === 'entregado' && (
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
              <button
                onClick={() => setConfirmId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-amber-800 mb-1">Atención</p>
              <p className="text-sm text-amber-700">
                El cliente tendrá <strong>48 horas</strong> para confirmar la recepción. El pago
                quedará retenido durante ese período.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Pedido</span>
                <span className="font-mono font-semibold">{confirmingOrder.id}</span>
              </div>
              <div className="flex justify-between text-slate-600 mt-1">
                <span>Cliente</span>
                <span className="font-medium">{confirmingOrder.client}</span>
              </div>
              <div className="flex justify-between text-slate-600 mt-1">
                <span>Armazón</span>
                <span className="font-medium">{confirmingOrder.frame}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmId(null)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={() => markDelivered(confirmId)}>
                Confirmar entrega
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
