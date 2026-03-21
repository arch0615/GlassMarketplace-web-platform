import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Loader2,
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
    return <div className="text-center py-10"><p className="text-slate-500">Error al cargar datos.</p></div>
  }

  const usersByRole = {}
  ;(stats.usersByRole || []).forEach((r) => { usersByRole[r.role] = Number(r.count) })

  const KPIS = [
    { label: 'Usuarios activos', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', ring: 'ring-blue-100' },
    { label: 'Ópticas registradas', value: usersByRole.optica || 0, icon: Store, color: 'bg-violet-50 text-violet-600', ring: 'ring-violet-100' },
    { label: 'Pedidos totales', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-amber-50 text-amber-600', ring: 'ring-amber-100' },
    { label: 'Disputas abiertas', value: stats.openDisputes, icon: AlertTriangle, color: 'bg-red-50 text-red-600', ring: 'ring-red-100' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel de Administración</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen general de la plataforma Lensia</p>
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
              <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </Card>
          )
        })}
      </div>

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
        <h2 className="text-base font-semibold text-slate-800 mb-4">Pedidos recientes</h2>
        {(stats.recentOrders || []).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-400 text-sm">No hay pedidos aún.</p>
          </Card>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Monto</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentOrders.map((order) => {
                  const st = STATUS_MAP[order.status] || { label: order.status, variant: 'neutral' }
                  const date = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-slate-700">{order.client?.fullName || '—'}</td>
                      <td className="px-5 py-3 font-semibold">${Number(order.amount || 0).toLocaleString('es-AR')}</td>
                      <td className="px-5 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{date}</td>
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
