import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, ShoppingBag } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const ORDERS = [
  {
    id: '1234',
    optica: 'Óptica Visión Norte',
    status: 'En Proceso',
    statusVariant: 'info',
    date: '10 mar 2026',
    lensType: 'Progresivo',
  },
  {
    id: '1201',
    optica: 'Óptica Central',
    status: 'Esperando presupuestos',
    statusVariant: 'warning',
    date: '05 mar 2026',
    lensType: 'Monofocal',
  },
  {
    id: '1189',
    optica: 'Óptica La Plata',
    status: 'Entregado',
    statusVariant: 'success',
    date: '28 feb 2026',
    lensType: 'Bifocal',
  },
  {
    id: '1150',
    optica: 'Óptica San Martín',
    status: 'En Proceso',
    statusVariant: 'info',
    date: '15 feb 2026',
    lensType: 'Progresivo',
  },
  {
    id: '1102',
    optica: 'Óptica Visión Norte',
    status: 'Disputa',
    statusVariant: 'danger',
    date: '02 ene 2026',
    lensType: 'Con filtro azul',
  },
]

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'En Proceso', value: 'En Proceso' },
  { label: 'Entregado', value: 'Entregado' },
  { label: 'Disputa', value: 'Disputa' },
]

export default function MisPedidos() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered =
    activeFilter === 'all'
      ? ORDERS
      : ORDERS.filter((o) => o.status === activeFilter)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mis pedidos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Historial completo de todos tus pedidos de lentes.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
              ${activeFilter === f.value
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            {f.label}
            {f.value === 'all' && (
              <span className="ml-1.5 text-xs opacity-70">({ORDERS.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="font-semibold text-slate-600">No hay pedidos en este estado</p>
            <p className="text-sm text-slate-400 mt-1">
              Probá seleccionando otro filtro.
            </p>
          </div>
        </div>
      )}

      {/* Orders */}
      {filtered.length > 0 && (
        <Card>
          {/* Desktop header */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <span className="w-16">Pedido</span>
            <span>Óptica</span>
            <span className="w-36">Estado</span>
            <span className="w-28">Fecha</span>
            <span className="w-28"></span>
          </div>

          <ul className="divide-y divide-slate-100">
            {filtered.map((order) => (
              <li key={order.id}>
                {/* Mobile */}
                <div className="sm:hidden px-5 py-4 flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-bold text-slate-700">#{order.id}</p>
                    <p className="text-xs text-slate-500">{order.optica}</p>
                    <p className="text-xs text-slate-400">{order.lensType}</p>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <Badge variant={order.statusVariant}>{order.status}</Badge>
                      <span className="text-xs text-slate-400">{order.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/cliente/pedidos/${order.id}`)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                </div>

                {/* Desktop */}
                <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-6 py-4">
                  <span className="w-16 text-sm font-bold text-slate-700">
                    #{order.id}
                  </span>
                  <div>
                    <p className="text-sm text-slate-700 font-medium">{order.optica}</p>
                    <p className="text-xs text-slate-400">{order.lensType}</p>
                  </div>
                  <span className="w-36">
                    <Badge variant={order.statusVariant}>{order.status}</Badge>
                  </span>
                  <span className="w-28 text-sm text-slate-400">{order.date}</span>
                  <span className="w-28 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/cliente/pedidos/${order.id}`)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver detalle
                    </Button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
