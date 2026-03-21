import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, ShoppingBag, Loader2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
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
  { label: 'Todos', value: 'all' },
  { label: 'En Proceso', value: 'in_process' },
  { label: 'Entregado', value: 'delivered' },
  { label: 'Completado', value: 'completed' },
  { label: 'Disputa', value: 'dispute' },
]

export default function MisPedidos() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    api('/orders/mine')
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    activeFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === activeFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mis pedidos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Historial completo de todos tus pedidos de lentes.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
              ${activeFilter === f.value
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            {f.label}
            {f.value === 'all' && (
              <span className="ml-1.5 text-xs opacity-70">({orders.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="font-semibold text-slate-600">No hay pedidos en este estado</p>
            <p className="text-sm text-slate-400 mt-1">
              Probá seleccionando otro filtro.
            </p>
          </div>
        </div>
      )}

      {/* Orders */}
      {filtered.length > 0 && (
        <Card>
          {/* Desktop header */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <span className="w-16">Pedido</span>
            <span>Óptica</span>
            <span className="w-36">Estado</span>
            <span className="w-28">Fecha</span>
            <span className="w-28"></span>
          </div>

          <ul className="divide-y divide-slate-100">
            {filtered.map((order) => {
              const st = STATUS_MAP[order.status] || { label: order.status, variant: 'neutral' }
              const date = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
              const opticaName = order.optica?.businessName || 'Óptica'
              const lensType = order.quote?.lensDescription || ''
              return (
                <li key={order.id}>
                  {/* Mobile */}
                  <div className="sm:hidden px-5 py-4 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-bold text-slate-700">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-500">{opticaName}</p>
                      {lensType && <p className="text-xs text-slate-400">{lensType}</p>}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <Badge variant={st.variant}>{st.label}</Badge>
                        <span className="text-xs text-slate-400">{date}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/cliente/pedidos/${order.id}`)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  </div>

                  {/* Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-6 py-4">
                    <span className="w-16 text-sm font-bold text-slate-700">
                      #{order.id.slice(0, 8)}
                    </span>
                    <div>
                      <p className="text-sm text-slate-700 font-medium">{opticaName}</p>
                      {lensType && <p className="text-xs text-slate-400">{lensType}</p>}
                    </div>
                    <span className="w-36">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </span>
                    <span className="w-28 text-sm text-slate-400">{date}</span>
                    <span className="w-28 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/cliente/pedidos/${order.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver detalle
                      </Button>
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
