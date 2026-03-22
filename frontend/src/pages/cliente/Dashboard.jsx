import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  FileText,
  CheckCircle2,
  Plus,
  Eye,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
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

export default function ClientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/orders/mine')
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const activeOrders = orders.filter((o) =>
    ['payment_pending', 'payment_held', 'in_process', 'delivered'].includes(o.status)
  )
  const completedOrders = orders.filter((o) => o.status === 'completed')
  const recentOrders = orders.slice(0, 5)

  const stats = [
    {
      label: 'Pedidos activos',
      value: activeOrders.length,
      icon: ShoppingBag,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Presupuestos recibidos',
      value: orders.length,
      icon: FileText,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Pedidos completados',
      value: completedOrders.length,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  const firstName = user?.fullName?.split(' ')[0] || 'Usuario'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hola, {firstName}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Bienvenido a tu panel. Aquí podés gestionar tus pedidos de lentes.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/cliente/receta/nueva')}
        >
          <Plus className="w-4 h-4" />
          Nueva receta
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Promo banner */}
      {activeOrders.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-sky-500 p-5 flex items-center gap-4 text-white shadow-md">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Tenés {activeOrders.length} pedido{activeOrders.length !== 1 ? 's' : ''} activo{activeOrders.length !== 1 ? 's' : ''}</p>
            <p className="text-blue-100 text-xs mt-0.5">Revisá el estado de tus pedidos en curso.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 flex-shrink-0"
            onClick={() => navigate('/cliente/pedidos')}
          >
            Ver
          </Button>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Mis pedidos recientes
        </h2>
        {recentOrders.length === 0 ? (
          <Card className="p-10 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No tenés pedidos aún</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Subí tu receta para recibir presupuestos.</p>
          </Card>
        ) : (
          <Card>
            {/* Desktop header */}
            <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              <span className="w-16">Pedido</span>
              <span>Óptica</span>
              <span className="w-44">Estado</span>
              <span className="w-28">Fecha</span>
              <span className="w-24"></span>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentOrders.map((order) => {
                const st = STATUS_MAP[order.status] || { label: order.status, variant: 'neutral' }
                const date = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                const opticaName = order.optica?.businessName || 'Óptica'
                return (
                  <li key={order.id}>
                    {/* Mobile */}
                    <div className="sm:hidden px-5 py-4 flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{opticaName}</p>
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <Badge variant={st.variant}>{st.label}</Badge>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/cliente/pedidos/${order.id}`)}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-6 py-4">
                      <span className="w-16 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">{opticaName}</span>
                      <span className="w-44">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </span>
                      <span className="w-28 text-sm text-slate-400 dark:text-slate-500">{date}</span>
                      <span className="w-24 flex justify-end">
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

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 text-center">
              <Link
                to="/cliente/pedidos"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Ver todos mis pedidos →
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
