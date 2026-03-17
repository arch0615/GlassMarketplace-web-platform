import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  SendHorizonal,
  PackageCheck,
  DollarSign,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Circle,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const stats = [
  {
    label: 'Solicitudes nuevas',
    value: '3',
    icon: ClipboardList,
    color: 'bg-blue-50 text-blue-600',
    ring: 'ring-blue-100',
  },
  {
    label: 'Presupuestos enviados',
    value: '7',
    icon: SendHorizonal,
    color: 'bg-sky-50 text-sky-600',
    ring: 'ring-sky-100',
  },
  {
    label: 'Pedidos en proceso',
    value: '2',
    icon: PackageCheck,
    color: 'bg-amber-50 text-amber-600',
    ring: 'ring-amber-100',
  },
  {
    label: 'Ingresos este mes',
    value: '$230.000',
    icon: DollarSign,
    color: 'bg-emerald-50 text-emerald-600',
    ring: 'ring-emerald-100',
  },
]

const pendingRequests = [
  {
    id: '1024',
    client: 'Cliente #1024',
    lensType: 'Bifocales progresivos',
    priceRange: '$8.000 – $15.000',
    received: 'Hace 12 min',
    distance: '1.8 km',
  },
  {
    id: '1031',
    client: 'Cliente #1031',
    lensType: 'Monofocales (lejos)',
    priceRange: '$5.000 – $10.000',
    received: 'Hace 34 min',
    distance: '3.1 km',
  },
  {
    id: '1047',
    client: 'Cliente #1047',
    lensType: 'Lentes de contacto diarias',
    priceRange: '$3.000 – $7.000',
    received: 'Hace 1 h',
    distance: '2.5 km',
  },
]

const activeOrders = [
  {
    id: '#PED-0088',
    client: 'Cliente #1009',
    frame: 'Ray-Ban RB5154',
    status: 'En proceso',
    statusVariant: 'warning',
    date: '10 mar 2026',
  },
  {
    id: '#PED-0091',
    client: 'Cliente #1018',
    frame: 'Silhouette 5500',
    status: 'Pendiente pago',
    statusVariant: 'info',
    date: '11 mar 2026',
  },
  {
    id: '#PED-0095',
    client: 'Cliente #1023',
    frame: 'Oakley OX8046',
    status: 'Listo para entrega',
    statusVariant: 'success',
    date: '12 mar 2026',
  },
]

export default function OpticaDashboard() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Óptica — Visión Norte</h1>
          <p className="text-sm text-slate-500 mt-0.5">Resumen de actividad de hoy</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
          <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">En línea</span>
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
                  <p className="text-xs font-medium text-slate-500 leading-tight">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
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
            <h2 className="text-base font-semibold text-slate-800">Solicitudes pendientes</h2>
            <button
              onClick={() => navigate('/optica/solicitudes')}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{req.client}</span>
                      <Badge variant="info">{req.lensType}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {req.priceRange}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {req.distance}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {req.received}
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
            ))}
          </div>
        </div>

        {/* Active orders mini table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-800">Pedidos activos</h2>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    ID
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Armazón
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-slate-700">{order.frame}</p>
                      <p className="text-xs text-slate-400">{order.client}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.statusVariant}>{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  )
}
