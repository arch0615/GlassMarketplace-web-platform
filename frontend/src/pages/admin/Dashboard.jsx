import { useNavigate } from 'react-router-dom'
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  UserPlus,
  CheckCircle,
  MessageCircle,
  Banknote,
  Stethoscope,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const KPIS = [
  {
    label: 'Usuarios activos',
    value: '142',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
    ring: 'ring-blue-100',
    delta: '+12 este mes',
    deltaColor: 'text-emerald-600',
  },
  {
    label: 'Ópticas registradas',
    value: '28',
    icon: Store,
    color: 'bg-violet-50 text-violet-600',
    ring: 'ring-violet-100',
    delta: '+3 este mes',
    deltaColor: 'text-emerald-600',
  },
  {
    label: 'Pedidos totales',
    value: '89',
    icon: ShoppingBag,
    color: 'bg-amber-50 text-amber-600',
    ring: 'ring-amber-100',
    delta: '+17 este mes',
    deltaColor: 'text-emerald-600',
  },
  {
    label: 'Ingresos plataforma',
    value: '$45.000',
    icon: DollarSign,
    color: 'bg-emerald-50 text-emerald-600',
    ring: 'ring-emerald-100',
    delta: '+$8.200 este mes',
    deltaColor: 'text-emerald-600',
  },
]

const ACTIVITY = [
  {
    id: 1,
    icon: Store,
    iconBg: 'bg-blue-100 text-blue-600',
    text: 'Nueva óptica registrada: Óptica San Telmo',
    time: 'Hace 10 min',
  },
  {
    id: 2,
    icon: CheckCircle,
    iconBg: 'bg-emerald-100 text-emerald-600',
    text: 'Pedido #PED-0095 completado por Visión Norte',
    time: 'Hace 38 min',
  },
  {
    id: 3,
    icon: AlertTriangle,
    iconBg: 'bg-red-100 text-red-600',
    text: 'Disputa abierta en pedido #PED-0084',
    time: 'Hace 2 h',
  },
  {
    id: 4,
    icon: Banknote,
    iconBg: 'bg-green-100 text-green-600',
    text: 'Pago liberado a Óptica Centro Óptico Palermo',
    time: 'Hace 4 h',
  },
  {
    id: 5,
    icon: Stethoscope,
    iconBg: 'bg-purple-100 text-purple-600',
    text: 'Nuevo médico registrado: Dra. Valentina Rossi',
    time: 'Hace 6 h',
  },
]

// Bar chart data: monthly orders
const BAR_DATA = [
  { month: 'Oct', value: 34 },
  { month: 'Nov', value: 52 },
  { month: 'Dic', value: 41 },
  { month: 'Ene', value: 63 },
  { month: 'Feb', value: 78 },
  { month: 'Mar', value: 89 },
]
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
        <p className="font-semibold">{label}</p>
        <p>{payload[0].value} pedidos</p>
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${kpi.color} ${kpi.ring}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
              <p className={`text-xs font-semibold mt-1 ${kpi.deltaColor}`}>{kpi.delta}</p>
            </Card>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => navigate('/admin/aprobaciones')} className="gap-2">
          <ShieldCheck className="w-4 h-4" />
          Aprobaciones pendientes
          <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            3
          </span>
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/disputas')}>
          <AlertTriangle className="w-4 h-4" /> Ver disputas
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-800">Actividad reciente</h2>
          <Card className="divide-y divide-slate-50">
            {ACTIVITY.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="flex items-start gap-3 px-5 py-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${item.iconBg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{item.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              )
            })}
          </Card>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-800">Pedidos por mes</h2>
          <Card className="p-5 flex-1">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BAR_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="value" fill="#1E40AF" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">Últimos 6 meses</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
