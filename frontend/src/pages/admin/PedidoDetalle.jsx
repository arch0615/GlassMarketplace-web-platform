import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ImageIcon,
  Tag,
  DollarSign,
  User,
  Phone,
  Mail,
  Calendar,
  Loader2,
  CheckCircle2,
  Sparkles,
  Store,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'
import DisputeChat from '../../components/DisputeChat'

const STATUS_MAP = {
  payment_pending: { variant: 'warning', label: 'Pago pendiente' },
  payment_held: { variant: 'info', label: 'Pago retenido' },
  in_process: { variant: 'info', label: 'En proceso' },
  delivered: { variant: 'success', label: 'Entregado' },
  completed: { variant: 'success', label: 'Completado' },
  dispute: { variant: 'danger', label: 'Disputa' },
  refunded: { variant: 'neutral', label: 'Reembolsado' },
  cancelled: { variant: 'neutral', label: 'Cancelado' },
}

const TIER_LABELS = {
  basica: 'Económica',
  recomendada: 'Recomendada',
  premium: 'Premium',
}

export default function AdminPedidoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api(`/orders/${id}`)
      .then(setOrder)
      .catch(() => toast.error('No se pudo cargar el pedido'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 dark:text-slate-400">Pedido no encontrado.</p>
      </div>
    )
  }

  const st = STATUS_MAP[order.status] || { label: order.status, variant: 'neutral' }
  const quote = order.quote
  const request = quote?.request
  const prescription = request?.prescription
  const selectedTier = quote?.selectedTier
  const tierPrice = selectedTier === 'basica' ? quote?.tierBasicPrice
    : selectedTier === 'recomendada' ? quote?.tierRecommendedPrice
    : selectedTier === 'premium' ? quote?.tierPremiumPrice
    : quote?.totalPrice
  const tierDesc = selectedTier === 'basica' ? quote?.tierBasicDesc
    : selectedTier === 'recomendada' ? quote?.tierRecommendedDesc
    : selectedTier === 'premium' ? quote?.tierPremiumDesc
    : quote?.lensDescription
  const styles = request?.stylePreferences
    ? (Array.isArray(request.stylePreferences) ? request.stylePreferences : request.stylePreferences.split(','))
    : []

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Back + title */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a pedidos
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Pedido #{id.slice(0, 8)}</h1>
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>

      {order.status === 'dispute' && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            Pedido en disputa. Revisá el chat más abajo para mediar.
          </p>
        </div>
      )}

      {/* Dispute chat */}
      <DisputeChat orderId={order.id} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column: client + prescription + request */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Client info */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Cliente
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Nombre</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{order.client?.fullName || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{order.client?.email || '—'}</span>
              </div>
              {order.client?.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Teléfono
                  </span>
                  <a href={`tel:${order.client.phone}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400">{order.client.phone}</a>
                </div>
              )}
            </div>
          </Card>

          {/* Optica info */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-400" /> Óptica
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Nombre</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{order.optica?.businessName || '—'}</span>
              </div>
              {order.optica?.address && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Dirección</span>
                  <span className="text-sm text-slate-700 dark:text-slate-200 text-right">{order.optica.address}</span>
                </div>
              )}
              {order.optica?.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Teléfono</span>
                  <a href={`tel:${order.optica.phone}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400">{order.optica.phone}</a>
                </div>
              )}
              {order.optica?.user?.email && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Email</span>
                  <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{order.optica.user.email}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Delivery method */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Entrega</h2>
            {order.deliveryMethod === 'delivery' ? (
              <>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">📦 Envío a domicilio</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{order.deliveryAddress || '—'}</p>
              </>
            ) : (
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">🏬 Retiro en sucursal</p>
            )}
          </Card>

          {/* Prescription */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" /> Receta del cliente
            </h2>
            {prescription?.imageUrl ? (
              <a href={prescription.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={prescription.imageUrl}
                  alt="Receta"
                  className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-600 hover:opacity-90 transition-opacity cursor-pointer"
                />
              </a>
            ) : (
              <div className="w-full h-40 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                <span className="text-xs text-slate-400 dark:text-slate-500">Sin receta adjunta</span>
              </div>
            )}
            {prescription?.aiTranscription && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Transcripción IA
                </p>
                <pre className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-sans leading-relaxed">{prescription.aiTranscription}</pre>
              </div>
            )}
          </Card>

          {/* Request details */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" /> Detalle de la solicitud
            </h2>
            <div className="flex flex-col gap-2.5">
              {request?.gender && request.gender !== 'no_especifica' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Género</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {{ masculino: 'Hombre', femenino: 'Mujer', otro: 'Otro' }[request.gender] || request.gender}
                  </span>
                </div>
              )}
              {request?.lensType && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tipo de lente</span>
                  <Badge variant={request.lensType === 'no_se' ? 'warning' : 'info'}>
                    {request.lensType === 'no_se' ? 'Necesita asesoramiento' : request.lensType}
                  </Badge>
                </div>
              )}
              {request?.priceRangeMin && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Rango de precio</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    ${Number(request.priceRangeMin).toLocaleString('es-AR')} – ${Number(request.priceRangeMax).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
              {styles.length > 0 && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Estilos</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {styles.map((tag) => (
                      <Badge key={tag.trim()} variant="purple">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {request?.observations && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Observaciones</span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1 whitespace-pre-line">{request.observations}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right column: work + payment info */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Work details */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" /> Trabajo realizado
            </h2>

            {/* Lens tier */}
            <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 mb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                    Lentes {selectedTier ? `— ${TIER_LABELS[selectedTier] || selectedTier}` : ''}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{tierDesc || 'Sin descripción'}</p>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">${Number(tierPrice || 0).toLocaleString('es-AR')}</p>
              </div>
            </div>

            {/* Selected frame */}
            {order.selectedFrame && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 mb-3">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-3">Armazón seleccionado</p>
                <div className="flex items-center gap-4">
                  {order.selectedFrame.imageUrl ? (
                    <a href={order.selectedFrame.imageUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      <img src={order.selectedFrame.imageUrl} alt={`${order.selectedFrame.brand} ${order.selectedFrame.model}`} className="w-28 h-20 rounded-lg object-cover hover:opacity-90 transition-opacity cursor-pointer" />
                    </a>
                  ) : (
                    <div className="w-28 h-20 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{order.selectedFrame.brand}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{order.selectedFrame.model}</p>
                    {order.selectedFrame.material && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {order.selectedFrame.material}{order.selectedFrame.color ? ` · ${order.selectedFrame.color}` : ''}
                      </p>
                    )}
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                      ${Number(order.selectedFrame.priceMin || 0).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Subtotal lentes</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">${Number(tierPrice || 0).toLocaleString('es-AR')}</span>
              </div>
              {order.selectedFrame && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal armazón</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">${Number(order.selectedFrame.priceMin || 0).toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between text-base pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-100">Total del pedido</span>
                <span className="font-extrabold text-blue-700 dark:text-blue-400">${Number(order.amount || 0).toLocaleString('es-AR')}</span>
              </div>
              {order.commissionAmount && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                  <span>Comisión Lensia</span>
                  <span className="font-bold">${Number(order.commissionAmount).toLocaleString('es-AR')}</span>
                </div>
              )}
              {order.paymentMode === 'deposit' && (
                <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pago con seña (12%)</p>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-amber-700 dark:text-amber-400">Seña online</span>
                    <span className="font-bold text-amber-800 dark:text-amber-300">${Number(order.depositAmount || 0).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-amber-700 dark:text-amber-400">Resto en óptica</span>
                    <span className="font-bold text-amber-800 dark:text-amber-300">${(Number(order.amount || 0) - Number(order.depositAmount || 0)).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}
              {order.paymentMode === 'full' && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Pago completo online.</p>
              )}
              {order.mpPaymentId && (
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-2">
                  <span>MP Payment ID</span>
                  <span className="font-mono">{order.mpPaymentId}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Dates */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Cronología
            </h2>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pedido creado</span>
                <span className="text-slate-700 dark:text-slate-200">{new Date(order.createdAt).toLocaleString('es-AR')}</span>
              </div>
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Entregado por óptica</span>
                  <span className="text-slate-700 dark:text-slate-200">{new Date(order.deliveredAt).toLocaleString('es-AR')}</span>
                </div>
              )}
              {order.verificationDeadline && order.status === 'delivered' && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Plazo de verificación</span>
                  <span className="text-slate-700 dark:text-slate-200">{new Date(order.verificationDeadline).toLocaleString('es-AR')}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Completado</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {new Date(order.completedAt).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
