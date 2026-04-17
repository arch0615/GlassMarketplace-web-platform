import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Clock, X, CheckCircle2, ChevronRight, Loader2, ArrowLeft, AlertTriangle, ZoomIn, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

function useCountdown(deadline) {
  const calc = useCallback(() => {
    if (!deadline) return null
    const diff = new Date(deadline).getTime() - Date.now()
    if (diff <= 0) return null
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { h, m, s, total: diff }
  }, [deadline])

  const [time, setTime] = useState(calc)
  useEffect(() => {
    if (!deadline) return
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [deadline, calc])
  return time
}

function CountdownBadge({ deadline, label }) {
  const time = useCountdown(deadline)
  if (!time) return <Badge variant="neutral">Vencido</Badge>
  const text = time.h > 0
    ? `${time.h}h ${time.m}m`
    : `${time.m}m ${time.s}s`
  const urgent = time.total < 3600000
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${urgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
      <Clock className="w-3 h-3" />
      {label} {text}
    </span>
  )
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{rating?.toFixed(1) || '—'}</span>
    </div>
  )
}

function ImageViewer({ src, alt, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
        <X className="w-6 h-6 text-white" />
      </button>
      <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
    </div>
  )
}

function FrameCard({ frame, selected, onSelect, onZoom }) {
  return (
    <div className={`rounded-xl border-2 transition-all overflow-hidden
      ${selected
        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-700'
        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}
    >
      {frame.imageUrl ? (
        <div className="relative group">
          <img src={frame.imageUrl} alt={`${frame.brand} ${frame.model}`} className="w-full h-28 object-cover" />
          <button
            onClick={(e) => { e.stopPropagation(); onZoom(frame.imageUrl, `${frame.brand} ${frame.model}`) }}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          >
            <ZoomIn className="w-6 h-6 text-white drop-shadow-lg" />
          </button>
        </div>
      ) : (
        <div className="w-full h-28 bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
          <Star className="w-5 h-5 text-slate-400" />
        </div>
      )}
      <button onClick={() => onSelect(frame.id)} className="w-full p-2.5 text-center">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">{frame.brand} {frame.model}</span>
        <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 block">
          {selected ? 'Seleccionado' : 'Seleccionar'}
        </span>
      </button>
    </div>
  )
}

function AcceptModal({ quote, onClose, onZoom }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const hasBillingData = Boolean(user?.cuit && user?.invoiceCondition)
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [selectedTier, setSelectedTier] = useState(null)
  const [paymentMode, setPaymentMode] = useState('full')
  const [deliveryMethod, setDeliveryMethod] = useState('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  // Seña forces pickup — the rest has to be settled in person at the óptica.
  const effectiveDeliveryMethod = paymentMode === 'deposit' ? 'pickup' : deliveryMethod

  const frames = quote.quoteFrames?.map((qf) => qf.frame).filter(Boolean) || []
  const hasTiers = quote.tierBasicPrice || quote.tierRecommendedPrice || quote.tierPremiumPrice
  const tiers = [
    quote.tierBasicPrice && { id: 'basica', label: 'Económica', price: Number(quote.tierBasicPrice), desc: quote.tierBasicDesc, style: 'border-slate-200 dark:border-slate-600' },
    quote.tierRecommendedPrice && { id: 'recomendada', label: 'Recomendada', price: Number(quote.tierRecommendedPrice), desc: quote.tierRecommendedDesc, style: 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10', labelStyle: 'text-blue-700 dark:text-blue-300' },
    quote.tierPremiumPrice && { id: 'premium', label: 'Premium', price: Number(quote.tierPremiumPrice), desc: quote.tierPremiumDesc, style: 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10', labelStyle: 'text-amber-700 dark:text-amber-300' },
  ].filter(Boolean)

  // Calculate totals
  const lensPrice = selectedTier
    ? (tiers.find(t => t.id === selectedTier)?.price || 0)
    : Number(quote.totalPrice) || 0
  const frameObj = selectedFrame ? frames.find(f => f.id === selectedFrame) : null
  const framePrice = frameObj ? Number(frameObj.priceMin || frameObj.price || 0) : 0
  const totalPrice = lensPrice + framePrice
  const depositAmount = Math.round(totalPrice * 0.12)

  async function handleConfirm() {
    if (frames.length > 0 && !selectedFrame) {
      toast.error('Seleccioná un armazón para continuar.')
      return
    }
    if (hasTiers && !selectedTier) {
      toast.error('Seleccioná una opción de lentes.')
      return
    }
    if (effectiveDeliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Ingresá la dirección de envío.')
      return
    }
    if (!hasBillingData) {
      toast.error('Completá tus datos de facturación (CUIT y condición de IVA) antes de confirmar.')
      return
    }
    setLoading(true)
    try {
      await api(`/quotes/${quote.id}/accept`, {
        method: 'PATCH',
        body: JSON.stringify({ tier: selectedTier || undefined }),
      })
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          quoteId: quote.id,
          selectedFrameId: selectedFrame || undefined,
          amount: lensPrice,
          paymentMode,
          deliveryMethod: effectiveDeliveryMethod,
          deliveryAddress: effectiveDeliveryMethod === 'delivery' ? deliveryAddress.trim() : undefined,
        }),
      })
      setConfirmed(true)
    } catch (err) {
      toast.error(err.message || 'Error al confirmar el pedido')
    } finally {
      setLoading(false)
    }
  }

  function handleFinish() {
    toast.success('¡Pedido confirmado! Podés seguirlo en Mis Pedidos.')
    onClose()
    navigate('/cliente/pedidos')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {confirmed ? 'Pedido confirmado' : 'Confirmar presupuesto'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {confirmed ? (
          <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">¡Listo!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Tu pedido fue confirmado. Podrás hacer el seguimiento desde Mis Pedidos.
              </p>
            </div>
            <Button variant="primary" size="md" className="w-full mt-2" onClick={handleFinish}>
              Ir a Mis Pedidos
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {!hasBillingData && (
              <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Completá tus datos de facturación</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    Necesitamos tu CUIT y condición frente a IVA para poder emitir la factura electrónica.
                  </p>
                  <button
                    type="button"
                    onClick={() => { onClose(); navigate('/cliente/perfil') }}
                    className="mt-2 text-xs font-bold text-amber-800 dark:text-amber-300 underline hover:no-underline"
                  >
                    Ir a Mi Perfil →
                  </button>
                </div>
              </div>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {hasTiers
                ? 'Seleccioná la opción que preferís y confirmá.'
                : frames.length > 0
                  ? <>Elegí el armazón de tu preferencia para confirmar el presupuesto de <span className="font-bold text-slate-700 dark:text-slate-200">${Number(quote.totalPrice).toLocaleString('es-AR')}</span>.</>
                  : <>Confirmá el presupuesto de <span className="font-bold text-slate-700 dark:text-slate-200">${Number(quote.totalPrice).toLocaleString('es-AR')}</span>.</>
              }
            </p>

            {/* Tier selector */}
            {hasTiers && (
              <div className="space-y-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTier(t.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                      selectedTier === t.id
                        ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20'
                        : t.style
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${t.labelStyle || 'text-slate-700 dark:text-slate-200'}`}>{t.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</p>
                    </div>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">${t.price.toLocaleString('es-AR')}</p>
                  </button>
                ))}
              </div>
            )}

            {frames.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {frames.map((frame) => (
                  <FrameCard
                    key={frame.id}
                    frame={frame}
                    selected={selectedFrame === frame.id}
                    onSelect={setSelectedFrame}
                    onZoom={onZoom}
                  />
                ))}
              </div>
            )}

            {/* Price breakdown */}
            {(selectedTier || !hasTiers) && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-slate-500 dark:text-slate-400">Lentes</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">${lensPrice.toLocaleString('es-AR')}</span>
                </div>
                {frameObj && (
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-slate-500 dark:text-slate-400">Armazón</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">${framePrice.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50">
                  <span className="font-bold text-slate-800 dark:text-slate-100">Total</span>
                  <span className="font-extrabold text-blue-700 dark:text-blue-400">${totalPrice.toLocaleString('es-AR')}</span>
                </div>
              </div>
            )}

            {/* Payment mode selector */}
            {(selectedTier || !hasTiers) && totalPrice > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">¿Cómo querés pagar?</p>
                <button
                  onClick={() => setPaymentMode('full')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                    paymentMode === 'full'
                      ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Pago total online</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pagás el 100% por Mercado Pago</p>
                  </div>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">${totalPrice.toLocaleString('es-AR')}</p>
                </button>
                <button
                  onClick={() => setPaymentMode('deposit')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                    paymentMode === 'deposit'
                      ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Seña online + resto en óptica</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pagás 12% ahora y el resto presencial</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">${depositAmount.toLocaleString('es-AR')}</p>
                    <p className="text-[10px] text-slate-400">de ${totalPrice.toLocaleString('es-AR')}</p>
                  </div>
                </button>
              </div>
            )}

            {/* Delivery method */}
            {(selectedTier || !hasTiers) && totalPrice > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">¿Cómo recibís tu pedido?</p>

                {paymentMode === 'deposit' ? (
                  <div className="rounded-xl border-2 border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-1">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Retiro en sucursal</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Como vas a pagar el resto en la óptica, tu pedido se prepara para retiro presencial. La dirección se muestra una vez confirmado el pago.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                        deliveryMethod === 'pickup'
                          ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Retiro en sucursal</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Lo pasás a buscar por la óptica. Verás la dirección una vez confirmado el pago.</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                        deliveryMethod === 'delivery'
                          ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Envío a domicilio</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Recibís el pedido en la dirección que indiques</p>
                      </div>
                    </button>
                    {deliveryMethod === 'delivery' && (
                      <input
                        type="text"
                        placeholder="Dirección de envío completa"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                disabled={loading || !hasBillingData || (frames.length > 0 && !selectedFrame) || (hasTiers && !selectedTier) || (effectiveDeliveryMethod === 'delivery' && !deliveryAddress.trim())}
                onClick={handleConfirm}
              >
                {loading ? 'Confirmando...' : paymentMode === 'deposit' ? `Pagar seña $${depositAmount.toLocaleString('es-AR')}` : 'Confirmar pedido'}
                {!loading && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Presupuesto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalQuote, setModalQuote] = useState(null)
  const [zoomImg, setZoomImg] = useState(null)

  useEffect(() => {
    api(`/quotes/request/${id}`)
      .then(setQuotes)
      .catch(() => {
        toast.error('No se pudieron cargar los presupuestos')
        setQuotes([])
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const pendingQuotes = quotes.filter((q) => q.status === 'pending')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/cliente/pedidos')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Presupuestos recibidos</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {pendingQuotes.length > 0
            ? 'Compará las opciones y elegí la que mejor se adapta a vos.'
            : 'No hay presupuestos pendientes para esta solicitud.'}
        </p>
      </div>

      {quotes.length === 0 ? (
        <Card className="p-10 text-center">
          <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Aún no hay presupuestos</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Las ópticas cercanas están revisando tu solicitud.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quotes.map((quote, idx) => {
            const opticaName = quote.optica?.businessName || 'Óptica'
            const rating = quote.optica?.averageRating
            const frames = quote.quoteFrames?.map((qf) => qf.frame).filter(Boolean) || []
            const price = Number(quote.totalPrice) || 0
            const isAccepted = quote.status === 'accepted'
            const isRejected = quote.status === 'rejected'

            return (
              <Card key={quote.id} className="flex flex-col overflow-hidden">
                {/* Top accent */}
                <div
                  className={`h-1.5 ${
                    isAccepted
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : isRejected
                      ? 'bg-gradient-to-r from-slate-400 to-slate-300'
                      : idx === 0
                      ? 'bg-gradient-to-r from-blue-600 to-sky-400'
                      : 'bg-gradient-to-r from-slate-500 to-slate-400'
                  }`}
                />

                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                        Presupuesto {idx + 1}
                      </p>
                    </div>
                    {isAccepted && <Badge variant="success">Aceptado</Badge>}
                    {isRejected && <Badge variant="neutral">Rechazado</Badge>}
                    {quote.status === 'expired' && <Badge variant="neutral">Vencido</Badge>}
                    {!isAccepted && !isRejected && quote.status !== 'expired' && idx === 0 && (
                      <Badge variant="success">Mejor precio</Badge>
                    )}
                  </div>

                  {/* Countdown */}
                  {quote.status === 'pending' && quote.expiresAt && (
                    <CountdownBadge deadline={quote.expiresAt} label="Vence en" />
                  )}

                  {/* Tier options */}
                  {(quote.tierBasicPrice || quote.tierRecommendedPrice || quote.tierPremiumPrice) ? (
                    <div className="space-y-2">
                      {quote.tierBasicPrice && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-600">
                          <div>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Económica</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{quote.tierBasicDesc}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">${Number(quote.tierBasicPrice).toLocaleString('es-AR')}</p>
                        </div>
                      )}
                      {quote.tierRecommendedPrice && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10">
                          <div>
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1"><Star className="w-3 h-3 fill-blue-500 text-blue-500" /> Recomendada</p>
                            <p className="text-[11px] text-blue-500 dark:text-blue-400">{quote.tierRecommendedDesc}</p>
                          </div>
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">${Number(quote.tierRecommendedPrice).toLocaleString('es-AR')}</p>
                        </div>
                      )}
                      {quote.tierPremiumPrice && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
                          <div>
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Premium</p>
                            <p className="text-[11px] text-amber-500 dark:text-amber-400">{quote.tierPremiumDesc}</p>
                          </div>
                          <p className="text-sm font-bold text-amber-700 dark:text-amber-300">${Number(quote.tierPremiumPrice).toLocaleString('es-AR')}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">${price.toLocaleString('es-AR')}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Total del pedido</p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2">
                    {quote.estimatedDays && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Tiempo estimado</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {quote.estimatedDays} días
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Frame previews */}
                  {frames.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Armazones incluidos
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {frames.map((frame) => (
                          <div key={frame.id} className="flex flex-col items-center gap-1">
                            {frame.imageUrl ? (
                              <div className="relative group w-full cursor-pointer" onClick={() => setZoomImg({ src: frame.imageUrl, alt: `${frame.brand} ${frame.model}` })}>
                                <img src={frame.imageUrl} alt={`${frame.brand} ${frame.model}`} className="w-full h-24 rounded-lg object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                                  <ZoomIn className="w-5 h-5 text-white drop-shadow-lg" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-24 rounded-lg bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                                <Star className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight">
                              {frame.brand} {frame.model}
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
                              ${Number(frame.priceMin || frame.price || 0).toLocaleString('es-AR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {quote.status === 'pending' && (
                    <div className="flex flex-col gap-2 mt-auto pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full"
                        onClick={() => setModalQuote(quote)}
                      >
                        Aceptar presupuesto
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Zoom viewer */}
      {zoomImg && (
        <ImageViewer src={zoomImg.src} alt={zoomImg.alt} onClose={() => setZoomImg(null)} />
      )}

      {/* Modal */}
      {modalQuote && (
        <AcceptModal quote={modalQuote} onClose={() => setModalQuote(null)} onZoom={(src, alt) => setZoomImg({ src, alt })} />
      )}
    </div>
  )
}
