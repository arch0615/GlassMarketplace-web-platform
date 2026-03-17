import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const ORDERS = [
  { id: '#PED-0095', client: 'Cliente #1023', optica: 'Óptica Visión Norte', amount: '$18.500', status: 'entregado', date: '12 mar 2026' },
  { id: '#PED-0094', client: 'Cliente #1021', optica: 'Centro Óptico Palermo', amount: '$9.200', status: 'en_proceso', date: '12 mar 2026' },
  { id: '#PED-0093', client: 'Cliente #1019', optica: 'Óptica San Telmo', amount: '$25.000', status: 'pendiente_pago', date: '11 mar 2026' },
  { id: '#PED-0092', client: 'Cliente #1018', optica: 'Visión Palermo', amount: '$14.800', status: 'en_proceso', date: '11 mar 2026' },
  { id: '#PED-0091', client: 'Cliente #1016', optica: 'Óptica Visión Norte', amount: '$7.600', status: 'pendiente', date: '10 mar 2026' },
  { id: '#PED-0090', client: 'Cliente #1014', optica: 'Óptica Floresta', amount: '$11.300', status: 'entregado', date: '10 mar 2026' },
  { id: '#PED-0089', client: 'Cliente #1012', optica: 'Centro Óptico Palermo', amount: '$33.000', status: 'disputa', date: '9 mar 2026' },
  { id: '#PED-0088', client: 'Cliente #1009', optica: 'Óptica Visión Norte', amount: '$8.900', status: 'en_proceso', date: '8 mar 2026' },
  { id: '#PED-0087', client: 'Cliente #1006', optica: 'Visión Palermo', amount: '$16.400', status: 'entregado', date: '7 mar 2026' },
  { id: '#PED-0086', client: 'Cliente #1003', optica: 'Óptica San Telmo', amount: '$5.200', status: 'cancelado', date: '6 mar 2026' },
]

const STATUS_CONFIG = {
  pendiente: { variant: 'neutral', label: 'Pendiente' },
  pendiente_pago: { variant: 'info', label: 'Pendiente pago' },
  en_proceso: { variant: 'warning', label: 'En proceso' },
  entregado: { variant: 'success', label: 'Entregado' },
  disputa: { variant: 'danger', label: 'En disputa' },
  cancelado: { variant: 'neutral', label: 'Cancelado' },
}

const STATUS_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'pendiente_pago', label: 'Pend. pago' },
  { key: 'en_proceso', label: 'En proceso' },
  { key: 'entregado', label: 'Entregado' },
  { key: 'disputa', label: 'Disputa' },
  { key: 'cancelado', label: 'Cancelado' },
]

export default function AdminPedidos() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = ORDERS.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.client.toLowerCase().includes(search.toLowerCase()) ||
      o.optica.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Administración completa de todos los pedidos de la plataforma
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID, cliente u óptica..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          />
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              statusFilter === f.key
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
            <span className={`ml-1.5 ${statusFilter === f.key ? 'text-blue-200' : 'text-slate-400'}`}>
              {f.key === 'all'
                ? ORDERS.length
                : ORDERS.filter((o) => o.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Cliente', 'Óptica', 'Monto', 'Estado', 'Fecha', 'Acciones'].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                    No se encontraron pedidos con ese criterio.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const sc = STATUS_CONFIG[order.status]
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">{order.client}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{order.optica}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{order.amount}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{order.date}</td>
                      <td className="px-5 py-3.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate(
                              order.status === 'disputa'
                                ? '/admin/disputas'
                                : '/admin/pedidos'
                            )
                          }
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver detalle
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Mostrando {filtered.length} de {ORDERS.length} pedidos
        </div>
      </Card>
    </div>
  )
}
