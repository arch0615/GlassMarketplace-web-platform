import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  X,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Loader2,
  CreditCard,
  Star,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import StatusTimeline from '../../components/ui/StatusTimeline'
import { api } from '../../lib/api'
import DisputeChat from '../../components/DisputeChat'

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

function PaymentCountdown({ deadline }) {
  const calc = useCallback(() => {
    if (!deadline) return null
    const diff = new Date(deadline).getTime() - Date.now()
    if (diff <= 0) return null
    return { m: Math.floor(diff / 60000), s: Math.floor((diff % 60000) / 1000) }
  }, [deadline])

  const [time, setTime] = useState(calc)
  useEffect(() => {
    if (!deadline) return
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [deadline, calc])

  if (!time) return <span className="text-sm font-bold text-red-600 dark:text-red-400">Tiempo agotado</span>
  return (
    <span className="text-sm font-bold text-red-600 dark:text-red-400">
      {time.m}:{String(time.s).padStart(2, '0')} restantes
    </span>
  )
}

function RatingModal({ order, onClose, onSuccess }) {
  const [score, setScore] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (score === 0) {
      toast.error('Seleccioná una puntuación.')
      return
    }
    setLoading(true)
    try {
      await api(`/opticas/${order.optica.id}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ score, comment: comment || undefined, orderId: order.id }),
      })
      setDone(true)
      onSuccess?.()
    } catch (err) {
      toast.error(err.message || 'Error al enviar la calificación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {done ? 'Gracias por tu opinión' : 'Calificá tu experiencia'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Star className="w-9 h-9 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">¡Calificación enviada!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tu opinión ayuda a otros clientes a elegir mejor.</p>
            </div>
            <Button variant="primary" size="md" className="w-full mt-2" onClick={onClose}>Cerrar</Button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ¿Cómo fue tu experiencia con la óptica?
            </p>

            {/* Star selector */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setScore(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-10 h-10 transition-colors ${
                    s <= (hover || score)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200 dark:text-slate-600'
                  }`} />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400">
              {score === 1 && 'Muy mala'}
              {score === 2 && 'Mala'}
              {score === 3 && 'Regular'}
              {score === 4 && 'Buena'}
              {score === 5 && 'Excelente'}
            </p>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Contanos más sobre tu experiencia (opcional)..."
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            />

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>Omitir</Button>
              <Button variant="primary" size="md" className="flex-1" disabled={loading || score === 0} onClick={handleSubmit}>
                {loading ? 'Enviando...' : 'Enviar calificación'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
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
      let body
      if (photoFile) {
        const formData = new FormData()
        formData.append('photos', photoFile)
        formData.append('orderId', orderId)
        formData.append('reason', reason)
        if (comment) formData.append('comment', comment)
        body = formData
      } else {
        body = JSON.stringify({ orderId, reason, comment })
      }
      await api('/disputes', { method: 'POST', body })
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {submitted ? 'Reclamo enviado' : 'Abrir disputa'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">Reclamo recibido</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Completá el siguiente formulario para iniciar el proceso de disputa.
              Nuestro equipo revisará tu caso.
            </p>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Motivo del reclamo <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
              >
                <option value="">Seleccioná un motivo...</option>
                {DISPUTE_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Photo upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Foto del problema{' '}
                <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional)</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  {photoFile ? (
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{photoFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Subir foto</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG · Máx. 5 MB</p>
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
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Descripción del problema
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Describí con detalle qué ocurrió con tu pedido..."
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-300 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
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
  const [showRating, setShowRating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

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

  async function handlePayWithMP() {
    setPayLoading(true)
    try {
      const { initPoint } = await api(`/payments/preference/${id}`)
      if (initPoint) {
        window.location.href = initPoint
      } else {
        toast.success('Modo de prueba: pago simulado correctamente.')
        loadOrder()
      }
    } catch (err) {
      toast.error(err.message || 'Error al iniciar el pago')
    } finally {
      setPayLoading(false)
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
        <p className="text-slate-500 dark:text-slate-400">Pedido no encontrado.</p>
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
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mis pedidos
      </button>

      {/* Top section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pedido #{order.id.slice(0, 8)}</h1>
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {opticaName} · {date}
          </p>
        </div>
      </div>

      {/* Payment pending banner */}
      {order.status === 'payment_pending' && (
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5">
          <div className="flex items-start gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                  Tu pedido está pendiente de pago
                </p>
                {order.paymentDeadline && <PaymentCountdown deadline={order.paymentDeadline} />}
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
                {order.paymentMode === 'deposit'
                  ? <>Tenés <strong>20 minutos</strong> para pagar la seña de <strong>${Number(order.depositAmount || 0).toLocaleString('es-AR')}</strong>. El resto (${(amount - Number(order.depositAmount || 0)).toLocaleString('es-AR')}) lo abonás en la óptica.</>
                  : <>Tenés <strong>20 minutos</strong> para completar el pago de <strong>${amount.toLocaleString('es-AR')}</strong>. Pasado ese tiempo, el pedido se cancelará automáticamente.</>
                }
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            disabled={payLoading}
            onClick={handlePayWithMP}
          >
            {payLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo...</>
            ) : (
              <><CreditCard className="w-4 h-4" /> Pagar con Mercado Pago</>
            )}
          </Button>
        </div>
      )}

      {/* Delivery verification banner */}
      {isDelivered && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                Verificación de entrega requerida
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
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
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Pedido completado. ¡Gracias por tu compra!
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowRating(true)}
            className="gap-1.5"
          >
            <Star className="w-4 h-4" /> Calificar a la óptica
          </Button>
        </div>
      )}

      {/* Dispute chat — visible whenever there's a dispute on the order */}
      <DisputeChat orderId={order.id} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Timeline */}
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-5">
              Estado del pedido
            </h2>
            <StatusTimeline steps={timelineSteps} />
          </Card>

          {/* Frame info */}
          {order.selectedFrame && (
            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-4">
                Armazón seleccionado
              </h2>
              <div className="flex items-center gap-4">
                {order.selectedFrame.imageUrl ? (
                  <img src={order.selectedFrame.imageUrl} alt={`${order.selectedFrame.brand} ${order.selectedFrame.model}`} className="w-24 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-24 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{order.selectedFrame.brand} {order.selectedFrame.model}</p>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-1">
                    ${Number(order.selectedFrame.priceMin || order.selectedFrame.price || 0).toLocaleString('es-AR')}
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
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-4">
              Resumen de pago
            </h2>
            <div className="space-y-2">
              {order.quote?.selectedTier && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Lentes ({order.quote.selectedTier === 'basica' ? 'Económica' : order.quote.selectedTier === 'recomendada' ? 'Recomendada' : order.quote.selectedTier === 'premium' ? 'Premium' : order.quote.selectedTier})
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    ${Number(order.quote.selectedTier === 'basica' ? order.quote.tierBasicPrice : order.quote.selectedTier === 'recomendada' ? order.quote.tierRecommendedPrice : order.quote.selectedTier === 'premium' ? order.quote.tierPremiumPrice : order.quote.totalPrice || 0).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
              {!order.quote?.selectedTier && order.quote?.totalPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Lentes</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    ${Number(order.quote.totalPrice || 0).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
              {order.selectedFrame && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Armazón ({order.selectedFrame.brand} {order.selectedFrame.model})</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    ${Number(order.selectedFrame.priceMin || order.selectedFrame.price || 0).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-200">Total</span>
                <span className="text-base font-extrabold text-blue-700 dark:text-blue-400">
                  ${amount.toLocaleString('es-AR')}
                </span>
              </div>
              {order.paymentMode === 'deposit' && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-800 dark:text-amber-300 font-semibold">Seña online (12%)</span>
                    <span className="font-bold text-amber-800 dark:text-amber-300">${Number(order.depositAmount || 0).toLocaleString('es-AR')}</span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Resto a pagar en la óptica: ${(amount - Number(order.depositAmount || 0)).toLocaleString('es-AR')}
                  </p>
                </div>
              )}
              {order.paymentMode === 'full' && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Pago completo online por Mercado Pago</p>
              )}
            </div>
          </Card>

          {/* Optica info */}
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-4">
              Óptica
            </h2>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{opticaName}</p>
            {order.optica?.address && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{order.optica.address}</p>
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

      {/* Rating modal */}
      {showRating && (
        <RatingModal
          order={order}
          onClose={() => setShowRating(false)}
          onSuccess={loadOrder}
        />
      )}
    </div>
  )
}
