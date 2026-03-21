import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  X,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import StatusTimeline from '../../components/ui/StatusTimeline'
import { api } from '../../lib/api'

const STATUS_MAP = {
  payment_pending: { label: 'Pago pendiente', variant: 'warning' },
  payment_held: { label: 'Pago retenido', variant: 'info' },
  in_process: { label: 'En Proceso', variant: 'info' },
  delivered: { label: 'Entregado', variant: 'success' },
  completed: { label: 'Completado', variant: 'success' },
  dispute: { label: 'Disputa', variant: 'danger' },
  refunded: { label: 'Reembolsado', variant: 'neutral' },
  cancelled: { label: 'Cancelado', variant: 'neutral' },
}

const DISPUTE_REASONS = [
  { value: 'wrong_prescription', label: 'Graduación incorrecta' },
  { value: 'damage', label: 'Producto dañado' },
  { value: 'mismatch', label: 'No coincide con lo solicitado' },
  { value: 'not_received', label: 'No recibí el pedido' },
  { value: 'other', label: 'Otro motivo' },
]

const STATUS_ORDER = ['payment_pending', 'payment_held', 'in_process', 'delivered', 'completed']
const STATUS_LABELS = {
  payment_pending: 'Pago pendiente',
  payment_held: 'Pago retenido',
  in_process: 'En Proceso',
  delivered: 'Entregado',
  completed: 'Completado',
}

function buildTimeline(order) {
  const currentIdx = STATUS_ORDER.indexOf(order.status)
  return STATUS_ORDER.map((status, i) => ({
    label: STATUS_LABELS[status],
    completed: i < currentIdx || (i === currentIdx && order.status === 'completed'),
    active: i === currentIdx && order.status !== 'completed',
    date: i <= currentIdx
      ? new Date(order.updatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
      : undefined,
  }))
}

function DisputeModal({ orderId, onClose, onSuccess }) {
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!reason) {
      toast.error('Seleccioná el motivo del reclamo.')
      return
    }
    setLoading(true)
    try {
      await api('/disputes', {
        method: 'POST',
        body: JSON.stringify({ orderId, reason, comment }),
      })
      setSubmitted(true)
      onSuccess?.()
    } catch (err) {
      toast.error(err.message || 'Error al enviar el reclamo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {submitted ? 'Reclamo enviado' : 'Abrir disputa'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">Reclamo recibido</p>
              <p className="text-sm text-slate-500 mt-1">
                Nuestro equipo revisará tu caso en las próximas 24–48 horas hábiles y
                te notificará por email.
              </p>
            </div>
            <Button variant="primary" size="md" className="w-full mt-2" onClick={onClose}>
              Entendido
            </Button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            <p className="text-sm text-slate-500">
              Completá el siguiente formulario para iniciar el proceso de disputa.
              Nuestro equipo revisará tu caso.
            </p>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Motivo del reclamo <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Seleccioná un motivo...</option>
                {DISPUTE_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Foto del problema{' '}
                <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  {photoFile ? (
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {photoFile.name}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-600">Subir foto</p>
                      <p className="text-xs text-slate-400">PNG, JPG · Máx. 5 MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotoFile(e.target.files[0] || null)}
                />
              </label>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Descripción del problema
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Describí con detalle qué ocurrió con tu pedido..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-300"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? 'Enviando...' : 'Enviar reclamo'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PedidoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDispute, setShowDispute] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function loadOrder() {
    api(`/orders/${id}`)
      .then(setOrder)
      .catch(() => toast.error('No se pudo cargar el pedido'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrder() }, [id])

  async function handleConfirmReception() {
    setConfirming(true)
    try {
      const updated = await api(`/orders/${id}/confirm`, { method: 'PATCH' })
      setOrder(updated)
      toast.success('¡Recepción confirmada! Gracias por tu compra.')
    } catch (err) {
      toast.error(err.message || 'Error al confirmar recepción')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-slate-500">Pedido no encontrado.</p>
      </div>
    )
  }

  const st = STATUS_MAP[order.status] || { label: order.status, variant: 'neutral' }
  const isDelivered = order.status === 'delivered'
  const date = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  const opticaName = order.optica?.businessName || 'Óptica'
  const timelineSteps = buildTimeline(order)
  const amount = Number(order.amount) || 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/cliente/pedidos')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mis pedidos
      </button>

      {/* Top section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-800">Pedido #{order.id.slice(0, 8)}</h1>
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {opticaName} · {date}
          </p>
        </div>
      </div>

      {/* Delivery verification banner */}
      {isDelivered && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                Verificación de entrega requerida
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Tienes <strong>48 horas</strong> para reportar cualquier problema con tu
                pedido. Pasado ese plazo, el pedido se marcará como completado
                automáticamente.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="success"
              size="md"
              className="flex-1"
              disabled={confirming}
              onClick={handleConfirmReception}
            >
              <CheckCircle2 className="w-4 h-4" />
              {confirming ? 'Confirmando...' : 'Confirmar recepción'}
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              onClick={() => setShowDispute(true)}
            >
              <AlertTriangle className="w-4 h-4" />
              Abrir disputa
            </Button>
          </div>
        </div>
      )}

      {order.status === 'completed' && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">
            Pedido completado. ¡Gracias por tu compra!
          </p>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Timeline */}
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-5">
              Estado del pedido
            </h2>
            <StatusTimeline steps={timelineSteps} />
          </Card>

          {/* Frame info */}
          {order.selectedFrame && (
            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
                Armazón seleccionado
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-14 rounded-xl bg-slate-200 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{order.selectedFrame.brand} {order.selectedFrame.model}</p>
                  <p className="text-sm font-bold text-blue-700 mt-1">
                    ${Number(order.selectedFrame.price || 0).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Payment summary */}
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
              Resumen de pago
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="text-base font-extrabold text-blue-700">
                  ${amount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </Card>

          {/* Optica info */}
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
              Óptica
            </h2>
            <p className="text-sm font-semibold text-slate-700">{opticaName}</p>
            {order.optica?.address && (
              <p className="text-sm text-slate-500 mt-1">{order.optica.address}</p>
            )}
          </Card>
        </div>
      </div>

      {/* Dispute modal */}
      {showDispute && (
        <DisputeModal
          orderId={order.id}
          onClose={() => setShowDispute(false)}
          onSuccess={loadOrder}
        />
      )}
    </div>
  )
}
