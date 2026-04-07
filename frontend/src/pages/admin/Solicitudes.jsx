import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import { api } from '../../lib/api'
import { SERVICE_TYPE_LABELS } from '../../lib/serviceTypes'

const STATUS_MAP = {
  open: { label: 'Abierta', variant: 'warning' },
  quoted: { label: 'Cotizada', variant: 'info' },
  accepted: { label: 'Aceptada', variant: 'success' },
  expired: { label: 'Expirada', variant: 'neutral' },
  cancelled: { label: 'Cancelada', variant: 'neutral' },
}

const FILTERS = [
  { label: 'Todas', value: '' },
  { label: 'Abiertas', value: 'open' },
  { label: 'Cotizadas', value: 'quoted' },
  { label: 'Aceptadas', value: 'accepted' },
  { label: 'Expiradas', value: 'expired' },
]

export default function AdminSolicitudes() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const url = filter ? `/admin/requests?status=${filter}` : '/admin/requests'
    setLoading(true)
    setError(false)
    api(url)
      .then(setRequests)
      .catch(() => { setRequests([]); setError(true) })
      .finally(() => setLoading(false))
  }, [filter])

  const filtered = search
    ? requests.filter((r) =>
        (r.client?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (SERVICE_TYPE_LABELS[r.serviceType] || '').toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase())
      )
    : requests

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
        <ErrorState message="No se pudieron cargar las solicitudes." onRetry={() => { setError(false); setLoading(true); api(filter ? `/admin/requests?status=${filter}` : '/admin/requests').then(setRequests).catch(() => { setRequests([]); setError(true) }).finally(() => setLoading(false)) }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Solicitudes de presupuesto</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Todas las solicitudes de presupuesto de la plataforma</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, tipo de lente o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filter === f.value
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">No se encontraron solicitudes.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cliente</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Servicio</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cotizaciones</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filtered.map((req) => {
                const st = STATUS_MAP[req.status] || { label: req.status, variant: 'neutral' }
                const date = new Date(req.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                return (
                  <tr key={req.id} onClick={() => navigate(`/admin/solicitudes/${req.id}`)} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/40 cursor-pointer">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">#{req.id.slice(0, 8)}</td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-200">{req.client?.fullName || '—'}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{SERVICE_TYPE_LABELS[req.serviceType] || 'Lentes con receta'}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{req.quotesReceived || 0}</td>
                    <td className="px-5 py-4"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs">{date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
