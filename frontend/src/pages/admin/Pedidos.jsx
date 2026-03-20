import { useState } from 'react'
import {
  Search,
  Eye,
  X,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  User,
  Store,
  CreditCard,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import StatusTimeline from '../../components/ui/StatusTimeline'

const ORDERS = [
  {
    id: '#PED-0095',
    client: 'María García',
    clientEmail: 'maria.garcia@email.com',
    clientPhone: '+54 11 2345-6789',
    optica: 'Óptica Visión Norte',
    opticaEmail: 'info@visionorte.com.ar',
    opticaPhone: '+54 11 4567-8901',
    opticaAddress: 'Av. Corrientes 1234, CABA',
    amount: 18500,
    status: 'entregado',
    date: '12 mar 2026',
    lensType: 'Progresivo',
    frame: 'Ray-Ban RB5154 — Carey',
    prescription: 'OD: -2.50 / -0.75 x 180° | OI: -3.00 / -0.50 x 175°',
    paymentMethod: 'Mercado Pago',
    commission: 0,
    timeline: [
      { label: 'Pedido creado', date: '10 mar 2026, 14:30', completed: true },
      { label: 'Pago confirmado', date: '10 mar 2026, 14:32', completed: true },
      { label: 'En proceso', date: '10 mar 2026, 16:00', completed: true },
      { label: 'Entregado', date: '12 mar 2026, 11:20', completed: true },
      { label: 'Completado', completed: false, active: true },
    ],
  },
  {
    id: '#PED-0094',
    client: 'Juan Pérez',
    clientEmail: 'juan.perez@email.com',
    clientPhone: '+54 11 3456-7890',
    optica: 'Centro Óptico Palermo',
    opticaEmail: 'contacto@opticapalermo.com.ar',
    opticaPhone: '+54 11 5678-9012',
    opticaAddress: 'Honduras 4800, Palermo, CABA',
    amount: 9200,
    status: 'en_proceso',
    date: '12 mar 2026',
    lensType: 'Monofocal',
    frame: 'Oakley OX8046 — Negro mate',
    prescription: 'OD: -1.25 | OI: -1.50',
    paymentMethod: 'Mercado Pago',
    commission: 0,
    timeline: [
      { label: 'Pedido creado', date: '12 mar 2026, 09:15', completed: true },
      { label: 'Pago confirmado', date: '12 mar 2026, 09:17', completed: true },
      { label: 'En proceso', date: '12 mar 2026, 10:00', completed: false, active: true },
      { label: 'Entregado', completed: false },
      { label: 'Completado', completed: false },
    ],
  },
  {
    id: '#PED-0093',
    client: 'Laura Fernández',
    clientEmail: 'laura.f@email.com',
    clientPhone: '+54 11 4567-8901',
    optica: 'Óptica San Telmo',
    opticaEmail: 'ventas@opticasantelmo.com.ar',
    opticaPhone: '+54 11 6789-0123',
    opticaAddress: 'Defensa 1100, San Telmo, CABA',
    amount: 25000,
    status: 'pendiente_pago',
    date: '11 mar 2026',
    lensType: 'Progresivo Premium',
    frame: 'Tom Ford FT5401 — Habana',
    prescription: 'OD: +1.00 / -0.50 x 90° | OI: +1.25 / -0.25 x 85°',
    paymentMethod: 'Pendiente',
    commission: 0,
    timeline: [
      { label: 'Pedido creado', date: '11 mar 2026, 16:45', completed: true },
      { label: 'Pago confirmado', completed: false, active: true },
      { label: 'En proceso', completed: false },
      { label: 'Entregado', completed: false },
      { label: 'Completado', completed: false },
    ],
  },
  {
    id: '#PED-0092',
    client: 'Carlos López',
    clientEmail: 'carlos.l@email.com',
    clientPhone: '+54 11 5678-9012',
    optica: 'Visión Palermo',
    opticaEmail: 'info@visionpalermo.com.ar',
    opticaPhone: '+54 11 7890-1234',
    opticaAddress: 'Av. Santa Fe 3200, Palermo, CABA',
    amount: 14800,
    status: 'en_proceso',
    date: '11 mar 2026',
    lensType: 'Bifocal',
    frame: 'Vogue VO5286 — Burdeo',
    prescription: 'OD: -4.00 / -1.00 x 170° | OI: -3.75 / -1.25 x 5°',
    paymentMethod: 'Mercado Pago',
    commission: 0,
    timeline: [
      { label: 'Pedido creado', date: '11 mar 2026, 10:00', completed: true },
      { label: 'Pago confirmado', date: '11 mar 2026, 10:03', completed: true },
      { label: 'En proceso', date: '11 mar 2026, 14:30', completed: false, active: true },
      { label: 'Entregado', completed: false },
      { label: 'Completado', completed: false },
    ],
  },
  {
    id: '#PED-0091',
    client: 'Ana Rodríguez',
    clientEmail: 'ana.r@email.com',
    clientPhone: '+54 11 6789-0123',
    optica: 'Óptica Visión Norte',
    opticaEmail: 'info@visionorte.com.ar',
    opticaPhone: '+54 11 4567-8901',
    opticaAddress: 'Av. Corrientes 1234, CABA',
    amount: 7600,
    status: 'pendiente',
    date: '10 mar 2026',
    lensType: 'Monofocal',
    frame: 'Guess GU2700 — Rosa',
    prescription: 'OD: -0.75 | OI: -1.00',
    paymentMethod: 'Pendiente',
    commission: 0,
    timeline: [
      { label: 'Pedido creado', date: '10 mar 2026, 18:20', completed: true },
      { label: 'Pago confirmado', completed: false, active: true },
      { label: 'En proceso', completed: false },
      { label: 'Entregado', completed: false },
      { label: 'Completado', completed: false },
    ],
  },
  {
    id: '#PED-0090',
    client: 'Roberto Díaz',
    clientEmail: 'roberto.d@email.com',
    clientPhone: '+54 11 7890-1234',
    optica: 'Óptica Floresta',
    opticaEmail: 'contacto@opticafloresta.com.ar',
    opticaPhone: '+54 11 8901-2345',
    opticaAddress: 'Av. Rivadavia 7500, Floresta, CABA',
    amount: 11300,
    status: 'entregado',
    date: '10 mar 2026',
    lensType: 'Progresivo',
    frame: 'Arnette AN7176 — Negro',
    prescription: 'OD: +2.00 / -0.50 x 90° | OI: +2.25 / -0.75 x 85°',
    paymentMethod: 'Mercado Pago',
    commission: 0,
    timeline: [
      { label: 'Pedido creado', date: '7 mar 2026, 11:00', completed: true },
      { label: 'Pago confirmado', date: '7 mar 2026, 11:02', completed: true },
      { label: 'En proceso', date: '7 mar 2026, 15:00', completed: true },
      { label: 'Entregado', date: '10 mar 2026, 09:45', completed: true },
      { label: 'Completado', completed: false, active: true },
    ],
  },
  {
    id: '#PED-0089',
    client: 'Sofía Martínez',
    clientEmail: 'sofia.m@email.com',
    clientPhone: '+54 11 8901-2345',
    optica: 'Centro Óptico Palermo',
    opticaEmail: 'contacto@opticapalermo.com.ar',
    opticaPhone: '+54 11 5678-9012',
    opticaAddress: 'Honduras 4800, Palermo, CABA',
    amount: 33000,
    status: 'disputa',
    date: '9 mar 2026',
    lensType: 'Progresivo Premium',
    frame: 'Prada VPR 08T — Tortuga',
    prescription: 'OD: -5.00 / -1.50 x 175° | OI: -4.75 / -1.75 x 10°',
    paymentMethod: 'Mercado Pago',
    commission: 0,
    disputeReason: 'Graduación incorrecta',
    disputeDate: '11 mar 2026',
    timeline: [
      { label: 'Pedido creado', date: '6 mar 2026, 09:30', completed: true },
      { label: 'Pago confirmado', date: '6 mar 2026, 09:32', completed: true },
      { label: 'En proceso', date: '6 mar 2026, 14:00', completed: true },
      { label: 'Entregado', date: '9 mar 2026, 10:00', completed: true },
      { label: 'En disputa', date: '11 mar 2026, 08:15', completed: false, active: true },
    ],
  },
  {
    id: '#PED-0088',
    client: 'Diego Torres',
    clientEmail: 'diego.t@email.com',
    clientPhone: '+54 11 9012-3456',
    optica: 'Óptica Visión Norte',
    opticaEmail: 'info@visionorte.com.ar',
    opticaPhone: '+54 11 4567-8901',
    opticaAddress: 'Av. Corrientes 1234, CABA',
    amount: 8900,
    status: 'en_proceso',
    date: '8 mar 2026',
    lensType: 'Monofocal',
    frame: 'Nike 7090 — Gris',
    prescription: 'OD: -2.00 | OI: -2.25',
    paymentMethod: 'Mercado Pago',
    commission: 0,
    timeline: [
      { label: 'Pedido creado', date: '8 mar 2026, 13:00', completed: true },
      { label: 'Pago confirmado', date: '8 mar 2026, 13:02', completed: true },
      { label: 'En proceso', date: '8 mar 2026, 16:30', completed: false, active: true },
      { label: 'Entregado', completed: false },
      { label: 'Completado', completed: false },
    ],
  },
  {
    id: '#PED-0087',
    client: 'Valentina Ruiz',
    clientEmail: 'vale.r@email.com',
    clientPhone: '+54 11 0123-4567',
    optica: 'Visión Palermo',
    opticaEmail: 'info@visionpalermo.com.ar',
    opticaPhone: '+54 11 7890-1234',
    opticaAddress: 'Av. Santa Fe 3200, Palermo, CABA',
    amount: 16400,
    status: 'entregado',
    date: '7 mar 2026',
    lensType: 'Progresivo',
    frame: 'Dolce & Gabbana DG3268 — Negro',
    prescription: 'OD: +0.75 / -0.25 x 90° | OI: +1.00 / -0.50 x 80°',
    paymentMethod: 'Mercado Pago',
    commission: 0,
    timeline: [
      { label: 'Pedido creado', date: '4 mar 2026, 10:00', completed: true },
      { label: 'Pago confirmado', date: '4 mar 2026, 10:02', completed: true },
      { label: 'En proceso', date: '4 mar 2026, 14:00', completed: true },
      { label: 'Entregado', date: '7 mar 2026, 10:30', completed: true },
      { label: 'Completado', date: '7 mar 2026, 12:00', completed: true },
    ],
  },
  {
    id: '#PED-0086',
    client: 'Martín Sánchez',
    clientEmail: 'martin.s@email.com',
    clientPhone: '+54 11 1234-5678',
    optica: 'Óptica San Telmo',
    opticaEmail: 'ventas@opticasantelmo.com.ar',
    opticaPhone: '+54 11 6789-0123',
    opticaAddress: 'Defensa 1100, San Telmo, CABA',
    amount: 5200,
    status: 'cancelado',
    date: '6 mar 2026',
    lensType: 'Monofocal',
    frame: 'Ray-Ban RB7047 — Negro',
    prescription: 'OD: -1.00 | OI: -0.75',
    paymentMethod: 'Reembolsado',
    commission: 0,
    timeline: [
      { label: 'Pedido creado', date: '6 mar 2026, 08:00', completed: true },
      { label: 'Cancelado', date: '6 mar 2026, 09:30', completed: false, active: true },
    ],
  },
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

function OrderDetailPanel({ order, onClose }) {
  const sc = STATUS_CONFIG[order.status]

  function handleAction(action) {
    const messages = {
      release: `Pago liberado a ${order.optica}`,
      refund: `Reembolso iniciado para ${order.client}`,
      cancel: `Pedido ${order.id} cancelado`,
    }
    toast.success(messages[action])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">{order.id}</h2>
                <Badge variant={sc.variant}>{sc.label}</Badge>
              </div>
              <p className="text-xs text-slate-500">{order.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Dispute banner */}
          {order.status === 'disputa' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">Pedido en disputa</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    Motivo: {order.disputeReason || 'Sin especificar'}
                  </p>
                  {order.disputeDate && (
                    <p className="text-xs text-red-500 mt-1">Abierta el {order.disputeDate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Client info */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Cliente
            </h3>
            <p className="text-sm font-semibold text-slate-800">{order.client}</p>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {order.clientEmail}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.clientPhone}
              </div>
            </div>
          </div>

          {/* Óptica info */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Store className="w-3.5 h-3.5" /> Óptica
            </h3>
            <p className="text-sm font-semibold text-slate-800">{order.optica}</p>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {order.opticaEmail}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.opticaPhone}
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                {order.opticaAddress}
              </div>
            </div>
          </div>

          {/* Order details */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Package className="w-3.5 h-3.5" /> Detalle del pedido
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Armazón</span>
                <span className="text-slate-700 font-medium text-right">{order.frame}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tipo de lente</span>
                <span className="text-slate-700 font-medium">{order.lensType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Receta</span>
                <span className="text-slate-700 font-medium text-right text-xs max-w-[60%]">{order.prescription}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" /> Pago
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Método</span>
                <span className="text-slate-700 font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700 font-medium">
                  ${order.amount.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Comisión Lensia
                </span>
                <span className="text-slate-700 font-medium">
                  ${order.commission.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="text-sm font-bold text-slate-800">Total</span>
                <span className="text-base font-extrabold text-blue-700">
                  ${(order.amount + order.commission).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Historial
            </h3>
            <StatusTimeline steps={order.timeline} />
          </div>

          {/* Admin actions */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Acciones de administrador
            </h3>
            <div className="flex flex-col gap-2">
              {(order.status === 'entregado' || order.status === 'disputa') && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleAction('release')}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Liberar pago a óptica
                </Button>
              )}
              {(order.status === 'disputa' || order.status === 'entregado') && (
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => handleAction('refund')}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reembolsar al cliente
                </Button>
              )}
              {order.status !== 'cancelado' && order.status !== 'entregado' && order.status !== 'disputa' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleAction('cancel')}
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar pedido
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminPedidos() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

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
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">{order.client}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{order.optica}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                        ${order.amount.toLocaleString('es-AR')}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{order.date}</td>
                      <td className="px-5 py-3.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOrder(order)
                          }}
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

      {/* Detail panel */}
      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}
