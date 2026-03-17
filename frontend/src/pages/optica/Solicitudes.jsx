import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, ChevronRight } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const ALL_REQUESTS = [
  {
    id: '1024',
    client: 'Cliente #1024',
    lensType: 'Bifocales progresivos',
    priceRange: '$8.000 – $15.000',
    distance: '1.8 km',
    received: 'Hace 12 min',
    status: 'nueva',
  },
  {
    id: '1031',
    client: 'Cliente #1031',
    lensType: 'Monofocales (lejos)',
    priceRange: '$5.000 – $10.000',
    distance: '3.1 km',
    received: 'Hace 34 min',
    status: 'nueva',
  },
  {
    id: '1008',
    client: 'Cliente #1008',
    lensType: 'Lentes de contacto mensuales',
    priceRange: '$4.000 – $9.000',
    distance: '0.9 km',
    received: 'Hace 2 h',
    status: 'respondida',
  },
  {
    id: '0998',
    client: 'Cliente #0998',
    lensType: 'Bifocales progresivos',
    priceRange: '$10.000 – $20.000',
    distance: '4.2 km',
    received: 'Hace 5 h',
    status: 'respondida',
  },
  {
    id: '0975',
    client: 'Cliente #0975',
    lensType: 'Monofocales (cerca)',
    priceRange: '$3.000 – $6.000',
    distance: '2.3 km',
    received: 'Hace 2 días',
    status: 'expirada',
  },
]

const TABS = [
  { key: 'nueva', label: 'Nuevas' },
  { key: 'respondida', label: 'Respondidas' },
  { key: 'expirada', label: 'Expiradas' },
]

const statusConfig = {
  nueva: { variant: 'info', label: 'Nueva' },
  respondida: { variant: 'success', label: 'Respondida' },
  expirada: { variant: 'neutral', label: 'Expirada' },
}

export default function Solicitudes() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('nueva')

  const filtered = ALL_REQUESTS.filter((r) => r.status === activeTab)
  const counts = Object.fromEntries(
    TABS.map((t) => [t.key, ALL_REQUESTS.filter((r) => r.status === t.key).length])
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Solicitudes de presupuesto</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Clientes cercanos que buscan cotización para sus lentes
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Request list */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-400 text-sm">No hay solicitudes en esta categoría.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => {
            const sc = statusConfig[req.status]
            return (
              <Card key={req.id} className="p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{req.client}</span>
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                      <span className="text-sm text-slate-600 font-medium">{req.lensType}</span>
                      <span className="text-sm text-slate-500">{req.priceRange}</span>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {req.distance}
                      </span>
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {req.received}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {req.status === 'nueva' ? (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/optica/solicitudes/${req.id}`)}
                      >
                        Responder <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/optica/solicitudes/${req.id}`)}
                      >
                        Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
