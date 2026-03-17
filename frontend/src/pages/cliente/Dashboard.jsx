import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  FileText,
  CheckCircle2,
  Plus,
  Eye,
  TrendingUp,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const stats = [
  {
    label: 'Pedidos activos',
    value: 2,
    icon: ShoppingBag,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Presupuestos recibidos',
    value: 3,
    icon: FileText,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Pedidos entregados',
    value: 5,
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
]

const recentOrders = [
  {
    id: '1234',
    optica: 'Óptica Visión Norte',
    status: 'En Proceso',
    statusVariant: 'info',
    date: '10 mar 2026',
  },
  {
    id: '1201',
    optica: 'Óptica Central',
    status: 'Esperando presupuestos',
    statusVariant: 'warning',
    date: '05 mar 2026',
  },
  {
    id: '1189',
    optica: 'Óptica La Plata',
    status: 'Entregado',
    statusVariant: 'success',
    date: '28 feb 2026',
  },
]

export default function ClientDashboard() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hola, María 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Bienvenida a tu panel. Aquí podés gestionar tus pedidos de lentes.
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
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}
              >
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Promo banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-sky-500 p-5 flex items-center gap-4 text-white shadow-md">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Recibiste 3 nuevos presupuestos</p>
          <p className="text-blue-100 text-xs mt-0.5">
            Comparalos y elegí la mejor opción para tus lentes.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="bg-white/20 text-white hover:bg-white/30 flex-shrink-0"
          onClick={() => navigate('/cliente/presupuestos/1234')}
        >
          Ver
        </Button>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Mis pedidos recientes
        </h2>
        <Card>
          {/* Desktop header */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <span className="w-16">Pedido</span>
            <span>Óptica</span>
            <span className="w-44">Estado</span>
            <span className="w-28">Fecha</span>
            <span className="w-24"></span>
          </div>

          <ul className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <li key={order.id}>
                {/* Mobile */}
                <div className="sm:hidden px-5 py-4 flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-semibold text-slate-700">#{order.id}</p>
                    <p className="text-xs text-slate-500">{order.optica}</p>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <Badge variant={order.statusVariant}>{order.status}</Badge>
                      <span className="text-xs text-slate-400">{order.date}</span>
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
                  <span className="w-16 text-sm font-semibold text-slate-700">
                    #{order.id}
                  </span>
                  <span className="text-sm text-slate-600">{order.optica}</span>
                  <span className="w-44">
                    <Badge variant={order.statusVariant}>{order.status}</Badge>
                  </span>
                  <span className="w-28 text-sm text-slate-400">{order.date}</span>
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
            ))}
          </ul>

          <div className="px-6 py-3 border-t border-slate-100 text-center">
            <Link
              to="/cliente/pedidos"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Ver todos mis pedidos →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
