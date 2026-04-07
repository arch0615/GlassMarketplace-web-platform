import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, ChevronRight, Loader2, ClipboardList, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import { api } from '../../lib/api'
import { SERVICE_TYPE_LABELS } from '../../lib/serviceTypes'

const statusConfig = {
  pending: { variant: 'info', label: 'Nueva' },
  responded: { variant: 'success', label: 'Respondida' },
  ignored: { variant: 'neutral', label: 'Rechazada' },
  expired: { variant: 'neutral', label: 'Expirada' },
}

const LENS_LABELS = {
  monofocal: 'Monofocal', bifocal: 'Bifocal', progresivo: 'Progresivo',
  filtro_azul: 'Filtro azul', progressive: 'Progresivo', blue_filter: 'Filtro azul',
  no_se: 'Necesita asesoramiento',
}

const TABS = [
  { key: 'pending', label: 'Nuevas' },
  { key: 'responded', label: 'Respondidas' },
  { key: 'expired', label: 'Expiradas' },
]

export default function Solicitudes() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  const handleReject = async (reqId) => {
    if (!confirm('¿Estás seguro de que querés rechazar esta solicitud?')) return
    try {
      await api(`/requests/${reqId}/reject`, { method: 'PATCH' })
      setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, opticaStatus: 'ignored' } : r))
      toast.success('Solicitud rechazada.')
    } catch (err) {
      toast.error(err.message || 'Error al rechazar')
    }
  }

  const loadData = useCallback(() => {
    setLoading(true)
    setError(false)
    api('/requests/assigned')
      .then(setRequests)
      .catch(() => { setRequests([]); setError(true) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = requests.filter((r) => r.opticaStatus === activeTab)
  const counts = Object.fromEntries(
    TABS.map((t) => [t.key, requests.filter((r) => r.opticaStatus === t.key).length])
  )

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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Solicitudes de presupuesto</h1>
        </div>
        <ErrorState message="No se pudieron cargar las solicitudes." onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Solicitudes de presupuesto</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Clientes cercanos que buscan cotización para sus lentes
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
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
          <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 dark:text-slate-500 text-sm">No hay solicitudes en esta categoría.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => {
            const sc = statusConfig[req.opticaStatus] || { variant: 'neutral', label: req.opticaStatus }
            const date = new Date(req.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
            return (
              <Card key={req.id} className="p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">Solicitud #{req.id.slice(0, 8)}</span>
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{SERVICE_TYPE_LABELS[req.serviceType] || 'Lentes con receta'}</span>
                      {req.lensType && req.serviceType === 'lentes_receta' && <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{LENS_LABELS[req.lensType] || req.lensType}</span>}
                      {req.priceRangeMin && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          ${Number(req.priceRangeMin).toLocaleString('es-AR')} – ${Number(req.priceRangeMax).toLocaleString('es-AR')}
                        </span>
                      )}
                      <span className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {date}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {req.opticaStatus === 'pending' ? (
                      <>
                        <Button size="sm" variant="danger" onClick={() => handleReject(req.id)}>
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/optica/solicitudes/${req.id}`)}>
                          Responder <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </>
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
