import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Store,
  ShoppingBag,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  DollarSign,
  TrendingUp,
  Wallet,
} from 'lucide-react'
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

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/admin/dashboard')
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-10"><p className="text-slate-500 dark:text-slate-400">Error al cargar datos.</p></div>
  }

  const usersByRole = {}
  ;(stats.usersByRole || []).forEach((r) => { usersByRole[r.role] = Number(r.count) })

  const KPIS = [
    { label: 'Usuarios activos', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', ring: 'ring-blue-100 dark:ring-blue-800' },
    { label: 'Ópticas registradas', value: usersByRole.optica || 0, icon: Store, color: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', ring: 'ring-violet-100 dark:ring-violet-800' },
    { label: 'Solicitudes abiertas', value: stats.openRequests || 0, icon: FileText, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-800' },
    { label: 'Disputas abiertas', value: stats.openDisputes, icon: AlertTriangle, color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400', ring: 'ring-red-100 dark:ring-red-800' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Panel de Administración</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Resumen general de la plataforma Lensia</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${kpi.color} ${kpi.ring}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{kpi.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{kpi.label}</p>
            </Card>
          )
        })}
      </div>

      {/* Commission summary */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Comisiones de Lensia</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-emerald-50 dark:from-emerald-900/30 to-white dark:to-slate-800 border-emerald-100 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wide">Cobrado</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              ${Number(stats.totalCommissionsEarned || 0).toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comisiones de pedidos completados</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-amber-50 dark:from-amber-900/30 to-white dark:to-slate-800 border-amber-100 dark:border-amber-800">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wide">Pendiente</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              ${Number(stats.pendingCommissions || 0).toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pedidos en proceso</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-white dark:to-slate-800 border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wide">Volumen</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              ${Number(stats.totalRevenueProcessed || 0).toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total procesado en la plataforma</p>
          </Card>
        </div>
      </div>

      {/* Alert banner for open requests */}
      {(stats.openRequests || 0) > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 flex items-center gap-4 text-white shadow-md">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              {stats.openRequests} solicitud{stats.openRequests !== 1 ? 'es' : ''} de presupuesto esperando respuesta de ópticas
            </p>
            <p className="text-amber-100 text-xs mt-0.5">Los clientes están esperando presupuestos.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 flex-shrink-0"
            onClick={() => navigate('/admin/solicitudes')}
          >
            Ver solicitudes
          </Button>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => navigate('/admin/aprobaciones')} className="gap-2">
          <ShieldCheck className="w-4 h-4" />
          Aprobaciones pendientes
          {stats.pendingApprovals > 0 && (
            <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {stats.pendingApprovals}
            </span>
          )}
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/disputas')}>
          <AlertTriangle className="w-4 h-4" /> Ver disputas ({stats.openDisputes})
        </Button>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Pedidos recientes</h2>
        {(stats.recentOrders || []).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm">No hay pedidos aún.</p>
          </Card>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cliente</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Monto</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Estado</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {stats.recentOrders.map((order) => {
                  const st = STATUS_MAP[order.status] || { label: order.status, variant: 'neutral' }
                  const date = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/40">
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">#{order.id.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-200">{order.client?.fullName || '—'}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">${Number(order.amount || 0).toLocaleString('es-AR')}</td>
                      <td className="px-5 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs">{date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}
