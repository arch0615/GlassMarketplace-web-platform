import { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const STATUS_MAP = {
  payment_pending: { label: 'Pago pendiente', variant: 'warning' },
  payment_held: { label: 'Pago retenido', variant: 'info' },
  in_process: { label: 'En Proceso', variant: 'info' },
  delivered: { label: 'Entregado', variant: 'success' },
  completed: { label: 'Completado', variant: 'success' },
  dispute: { label: 'Disputa', variant: 'danger' },
  refunded: { label: 'Reembolsado', variant: 'neutral' },
  cancelled: { label: 'Cancelado', variant: 'neutral' },
}

const FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'En Proceso', value: 'in_process' },
  { label: 'Entregado', value: 'delivered' },
  { label: 'Completado', value: 'completed' },
  { label: 'Disputa', value: 'dispute' },
]

export default function AdminPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const url = filter ? `/admin/orders?status=${filter}` : '/admin/orders'
    setLoading(true)
    api(url)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [filter])

  const filtered = search
    ? orders.filter((o) =>
        (o.client?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.optica?.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase())
      )
    : orders

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
        <h1 className="text-2xl font-bold text-slate-800">Gestión de pedidos</h1>
        <p className="text-sm text-slate-500 mt-0.5">Todos los pedidos de la plataforma</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, óptica o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filter === f.value
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-400 text-sm">No se encontraron pedidos.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Óptica</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Monto</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((order) => {
                const st = STATUS_MAP[order.status] || { label: order.status, variant: 'neutral' }
                const date = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600">#{order.id.slice(0, 8)}</td>
                    <td className="px-5 py-4 text-slate-700">{order.client?.fullName || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{order.optica?.businessName || '—'}</td>
                    <td className="px-5 py-4 font-semibold">${Number(order.amount || 0).toLocaleString('es-AR')}</td>
                    <td className="px-5 py-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
