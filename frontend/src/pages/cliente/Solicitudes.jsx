import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, CheckCircle2, XCircle, Loader2, Eye, Trash2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import { api } from '../../lib/api'
import { SERVICE_TYPE_LABELS } from '../../lib/serviceTypes'

import toast from 'react-hot-toast'

const STATUS_MAP = {
  open: { label: 'Esperando presupuestos', variant: 'warning' },
  filled: { label: 'Presupuesto aceptado', variant: 'success' },
  expired: { label: 'Expirada', variant: 'neutral' },
  cancelled: { label: 'Cancelada', variant: 'neutral' },
}

const LENS_LABELS = {
  monofocal: 'Monofocal',
  bifocal: 'Bifocal',
  progresivo: 'Progresivo',
  filtro_azul: 'Filtro azul',
  progressive: 'Progresivo',
  blue_filter: 'Filtro azul',
  no_se: 'A definir con la óptica',
}

export default function ClienteSolicitudes() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    setError(false)
    api('/requests/mine')
      .then(setRequests)
      .catch(() => { setRequests([]); setError(true) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCancel = async (reqId) => {
    if (!confirm('¿Estás seguro de que querés cancelar esta solicitud?')) return
    try {
      await api(`/requests/${reqId}/cancel`, { method: 'PATCH' })
      setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: 'cancelled' } : r))
      toast.success('Solicitud cancelada.')
    } catch (err) {
      toast.error(err.message || 'Error al cancelar')
    }
  }

  const openRequests = requests.filter((r) => r.status === 'open')
  const otherRequests = requests.filter((r) => r.status !== 'open')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mis Solicitudes</h1>
        </div>
        <ErrorState message="No se pudieron cargar tus solicitudes." onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mis Solicitudes</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Seguí el estado de tus solicitudes de presupuesto.
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="p-10 text-center">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No tenés solicitudes aún</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Solicitá un servicio óptico para recibir presupuestos de ópticas cercanas.</p>
          <Button variant="primary" size="md" className="mt-4" onClick={() => navigate('/cliente/nueva-solicitud')}>
            Nueva solicitud
          </Button>
        </Card>
      ) : (
        <>
          {/* Open requests - highlighted */}
          {openRequests.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 flex items-center gap-4 text-white shadow-md">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  Tenés {openRequests.length} solicitud{openRequests.length !== 1 ? 'es' : ''} esperando presupuestos
                </p>
                <p className="text-amber-100 text-xs mt-0.5">Las ópticas están revisando tu receta.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {requests.map((req) => {
              const st = STATUS_MAP[req.status] || { label: req.status, variant: 'neutral' }
              const date = new Date(req.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
              const lensLabel = LENS_LABELS[req.lensType] || req.lensType
              const quotesCount = req.quotesReceived || 0

              return (
                <Card key={req.id} className="overflow-hidden">
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        req.status === 'open' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        req.status === 'filled' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                        'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        {req.status === 'open' ? <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" /> :
                         req.status === 'filled' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> :
                         <XCircle className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            Solicitud #{req.id.slice(0, 8)}
                          </h3>
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">{SERVICE_TYPE_LABELS[req.serviceType] || 'Lentes con receta'}</span>
                          <span>{date}</span>
                          {quotesCount > 0 && (
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {quotesCount} presupuesto{quotesCount !== 1 ? 's' : ''} recibido{quotesCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(req.status === 'open' && quotesCount > 0) && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/cliente/presupuestos/${req.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver presupuestos
                        </Button>
                      )}
                      {req.status === 'open' && quotesCount === 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                          Esperando respuestas...
                        </span>
                      )}
                      {req.status === 'open' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancel(req.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Cancelar
                        </Button>
                      )}
                      {req.status === 'filled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/cliente/presupuestos/${req.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver detalle
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
