import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  SendHorizonal,
  PackageCheck,
  DollarSign,
  Clock,
  ChevronRight,
  Sparkles,
  Circle,
  Loader2,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'

const STATUS_MAP = {
  payment_pending: { label: 'Pago pendiente', variant: 'warning' },
  payment_held: { label: 'Pago retenido', variant: 'info' },
  in_process: { label: 'En Proceso', variant: 'warning' },
  delivered: { label: 'Entregado', variant: 'success' },
  completed: { label: 'Completado', variant: 'success' },
  dispute: { label: 'Disputa', variant: 'danger' },
}

const LENS_LABELS = {
  monofocal: 'Monofocal', bifocal: 'Bifocal', progresivo: 'Progresivo',
  filtro_azul: 'Filtro azul', progressive: 'Progresivo', blue_filter: 'Filtro azul',
  no_se: 'Necesita asesoramiento',
}

export default function OpticaDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      api('/requests/assigned'),
      api('/orders/mine'),
    ]).then(([reqs, ords]) => {
      setRequests(reqs)
      setOrders(ords)
    }).catch(() => {
      setError(true)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Only count requests this óptica hasn't responded to yet. Filtering by
  // r.status === 'open' was wrong — that's the global request status, which
  // stays 'open' until the client accepts a quote. Per-óptica state lives in
  // the request_opticas junction (exposed as r.opticaStatus).
  const pendingRequests = requests.filter((r) => r.opticaStatus === 'pending')
  const activeOrders = orders.filter((o) => ['payment_pending', 'payment_held', 'in_process', 'delivered'].includes(o.status))
  const completedOrders = orders.filter((o) => o.status === 'completed')
  // Net revenue = total del pedido - comisión de Lensia (12%)
  const netRevenue = completedOrders.reduce((sum, o) => {
    const amount = Number(o.amount || 0)
    const commission = Number(o.commissionAmount || amount * 0.12)
    return sum + (amount - commission)
  }, 0)

  const stats = [
    { label: 'Solicitudes nuevas', value: pendingRequests.length, icon: ClipboardList, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', ring: 'ring-blue-100 dark:ring-blue-800' },
    { label: 'Presupuestos enviados', value: requests.filter((r) => r.status === 'filled').length, icon: SendHorizonal, color: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400', ring: 'ring-sky-100 dark:ring-sky-800' },
    { label: 'Pedidos en proceso', value: activeOrders.length, icon: PackageCheck, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-800' },
    { label: 'Ingresos netos', value: `$${netRevenue.toLocaleString('es-AR')}`, icon: DollarSign, color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-800' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Panel de Óptica</h1>
        </div>
        <ErrorState message="No se pudo cargar el panel. Verificá tu conexión e intentá de nuevo." onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Panel de Óptica</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Resumen de actividad</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1.5">
          <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">En línea</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${s.color} ${s.ring}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Value proposition banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-6 text-white flex items-center gap-5">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-lg leading-snug">
            Lensia te presenta clientes con receta lista para comprar.
          </p>
          <p className="text-sm text-blue-100 mt-0.5">Sin visitas sin intención.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pending requests */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Solicitudes pendientes</h2>
            <button
              onClick={() => navigate('/optica/solicitudes')}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-400 dark:text-slate-500 text-sm">No hay solicitudes pendientes.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingRequests.slice(0, 5).map((req) => {
                const timeAgo = new Date(req.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                return (
                  <Card key={req.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Solicitud #{req.id.slice(0, 8)}</span>
                          {req.lensType && <Badge variant={req.lensType === 'no_se' ? 'warning' : 'info'}>{LENS_LABELS[req.lensType] || req.lensType}</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          {req.priceRangeMin && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> ${Number(req.priceRangeMin).toLocaleString('es-AR')} – ${Number(req.priceRangeMax).toLocaleString('es-AR')}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeAgo}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/optica/solicitudes/${req.id}`)}
                      >
                        Ver solicitud
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Active orders */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Pedidos activos</h2>
          {activeOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-400 dark:text-slate-500 text-sm">No hay pedidos activos.</p>
            </Card>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">ID</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Armazón</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {activeOrders.slice(0, 5).map((order) => {
                    const st = STATUS_MAP[order.status] || { label: order.status, variant: 'neutral' }
                    const frame = order.selectedFrame ? `${order.selectedFrame.brand} ${order.selectedFrame.model}` : '—'
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">#{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-200">{frame}</td>
                        <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
