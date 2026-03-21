import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, ChevronRight, Loader2, ClipboardList } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const statusConfig = {
  open: { variant: 'info', label: 'Nueva' },
  filled: { variant: 'success', label: 'Respondida' },
  expired: { variant: 'neutral', label: 'Expirada' },
}

const TABS = [
  { key: 'open', label: 'Nuevas' },
  { key: 'filled', label: 'Respondidas' },
  { key: 'expired', label: 'Expiradas' },
]

export default function Solicitudes() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('open')

  useEffect(() => {
    api('/requests/assigned')
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = requests.filter((r) => r.status === activeTab)
  const counts = Object.fromEntries(
    TABS.map((t) => [t.key, requests.filter((r) => r.status === t.key).length])
  )

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
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay solicitudes en esta categoría.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => {
            const sc = statusConfig[req.status] || { variant: 'neutral', label: req.status }
            const date = new Date(req.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
            return (
              <Card key={req.id} className="p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">Solicitud #{req.id.slice(0, 8)}</span>
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                      {req.lensType && <span className="text-sm text-slate-600 font-medium">{req.lensType}</span>}
                      {req.priceRangeMin && (
                        <span className="text-sm text-slate-500">
                          ${Number(req.priceRangeMin).toLocaleString('es-AR')} – ${Number(req.priceRangeMax).toLocaleString('es-AR')}
                        </span>
                      )}
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {date}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {req.status === 'open' ? (
                      <Button size="sm" onClick={() => navigate(`/optica/solicitudes/${req.id}`)}>
                        Responder <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/optica/solicitudes/${req.id}`)}>
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
