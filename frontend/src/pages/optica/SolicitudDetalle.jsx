import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  ImageIcon,
  Tag,
  DollarSign,
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  SendHorizonal,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'
import { SERVICE_TYPE_LABELS } from '../../lib/serviceTypes'

const QUOTE_STATUS = {
  pending: { label: 'Pendiente', variant: 'warning' },
  accepted: { label: 'Aceptado', variant: 'success' },
  rejected: { label: 'Rechazado', variant: 'neutral' },
}

export default function SolicitudDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [request, setRequest] = useState(null)
  const [frames, setFrames] = useState([])
  const [myQuote, setMyQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [tiers, setTiers] = useState({
    basicPrice: '', basicDesc: '',
    recommendedPrice: '', recommendedDesc: '',
    premiumPrice: '', premiumDesc: '',
  })
  const [estimatedDays, setEstimatedDays] = useState('')
  const [selectedFrames, setSelectedFrames] = useState([])

  useEffect(() => {
    Promise.all([
      api(`/requests/${id}`),
      api('/opticas/me'),
      api(`/quotes/request/${id}`),
    ]).then(([req, myOptica, quotes]) => {
      setRequest({ ...req, optica: myOptica })

      // Find this optica's quote
      const mine = quotes.find((q) => q.optica?.id === myOptica.id)
      if (mine) setMyQuote(mine)

      if (myOptica?.id) {
        api(`/catalog/optica/${myOptica.id}`).then(setFrames).catch(() => setFrames([]))
      }
    }).catch(() => toast.error('No se pudo cargar la solicitud'))
      .finally(() => setLoading(false))
  }, [id])

  const toggleFrame = (frameId) => {
    setSelectedFrames((prev) => {
      if (prev.includes(frameId)) return prev.filter((f) => f !== frameId)
      if (prev.length >= 5) {
        toast.error('Podés seleccionar hasta 5 armazones.')
        return prev
      }
      return [...prev, frameId]
    })
  }

  const handleSubmit = async () => {
    // At least 2 tiers required
    const filledTiers = [
      tiers.basicPrice && tiers.basicDesc,
      tiers.recommendedPrice && tiers.recommendedDesc,
      tiers.premiumPrice && tiers.premiumDesc,
    ].filter(Boolean).length
    if (filledTiers < 2) {
      toast.error('Completá al menos 2 opciones de presupuesto.')
      return
    }
    if (!estimatedDays) {
      toast.error('Indicá los días estimados de entrega.')
      return
    }
    setSubmitting(true)
    try {
      const created = await api('/quotes', {
        method: 'POST',
        body: JSON.stringify({
          requestId: id,
          opticaId: request.optica?.id,
          tierBasicPrice: tiers.basicPrice ? Number(tiers.basicPrice) : undefined,
          tierBasicDesc: tiers.basicDesc || undefined,
          tierRecommendedPrice: tiers.recommendedPrice ? Number(tiers.recommendedPrice) : undefined,
          tierRecommendedDesc: tiers.recommendedDesc || undefined,
          tierPremiumPrice: tiers.premiumPrice ? Number(tiers.premiumPrice) : undefined,
          tierPremiumDesc: tiers.premiumDesc || undefined,
          estimatedDays: String(estimatedDays),
          frameIds: selectedFrames.length > 0 ? selectedFrames : undefined,
        }),
      })
      toast.success('Presupuesto enviado correctamente.')
      setMyQuote(created)
    } catch (err) {
      toast.error(err.message || 'Error al enviar el presupuesto')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 dark:text-slate-400">Solicitud no encontrada.</p>
      </div>
    )
  }

  const prescriptionUrl = request.prescription?.imageUrl

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/optica/solicitudes')}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {myQuote ? 'Detalle de solicitud' : 'Responder solicitud'} #{id.slice(0, 8)}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: request details */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" /> Receta del cliente
            </h2>
            {prescriptionUrl ? (
              <a href={prescriptionUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={prescriptionUrl}
                  alt="Receta"
                  className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-slate-600 mb-4 hover:opacity-90 transition-opacity cursor-pointer"
                />
              </a>
            ) : (
              <div className="w-full h-40 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-2 mb-4">
                <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                <span className="text-xs text-slate-400 dark:text-slate-500">Imagen de receta</span>
              </div>
            )}
            {request.prescription?.aiTranscription && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Transcripción IA
                </p>
                <pre className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-sans leading-relaxed">{request.prescription.aiTranscription}</pre>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" /> Detalle de la solicitud
            </h2>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Tipo de servicio</span>
                <Badge variant="info">{SERVICE_TYPE_LABELS[request.serviceType] || 'Lentes con receta'}</Badge>
              </div>
              {request.gender && request.gender !== 'no_especifica' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Género</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {{ masculino: 'Hombre', femenino: 'Mujer', otro: 'Otro' }[request.gender] || request.gender}
                  </span>
                </div>
              )}
              {request.lensType && request.serviceType === 'lentes_receta' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tipo de lente</span>
                  <Badge variant={request.lensType === 'no_se' ? 'warning' : 'info'}>
                    {request.lensType === 'no_se' ? 'Necesita asesoramiento' : request.lensType}
                  </Badge>
                </div>
              )}
              {request.priceRangeMin && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Rango de precio</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    ${Number(request.priceRangeMin).toLocaleString('es-AR')} – ${Number(request.priceRangeMax).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
              {request.stylePreferences && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Estilos buscados</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {(Array.isArray(request.stylePreferences) ? request.stylePreferences : request.stylePreferences.split(',')).map((tag) => (
                      <Badge key={tag.trim()} variant="purple">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {request.observations && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Observaciones</span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1 whitespace-pre-line">{request.observations}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {myQuote ? (
            /* ---- Already sent: show submitted quote details ---- */
            <>
              <Card className="p-5 border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Presupuesto enviado</h2>
                  <Badge variant={(QUOTE_STATUS[myQuote.status] || {}).variant || 'neutral'}>
                    {(QUOTE_STATUS[myQuote.status] || {}).label || myQuote.status}
                  </Badge>
                </div>

                <div className="flex flex-col gap-3">
                  {myQuote.tierBasicPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Económica</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">
                        ${Number(myQuote.tierBasicPrice).toLocaleString('es-AR')} — {myQuote.tierBasicDesc}
                      </span>
                    </div>
                  )}
                  {myQuote.tierRecommendedPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Recomendada</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        ${Number(myQuote.tierRecommendedPrice).toLocaleString('es-AR')} — {myQuote.tierRecommendedDesc}
                      </span>
                    </div>
                  )}
                  {myQuote.tierPremiumPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-600 dark:text-amber-400">Premium</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">
                        ${Number(myQuote.tierPremiumPrice).toLocaleString('es-AR')} — {myQuote.tierPremiumDesc}
                      </span>
                    </div>
                  )}
                  {!myQuote.tierBasicPrice && !myQuote.tierRecommendedPrice && myQuote.totalPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Precio total</span>
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100">${Number(myQuote.totalPrice).toLocaleString('es-AR')}</span>
                    </div>
                  )}

                  {myQuote.estimatedDays && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Entrega estimada
                      </span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{myQuote.estimatedDays} días</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Enviado</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(myQuote.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </Card>

              <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/optica/solicitudes')}>
                <ArrowLeft className="w-4 h-4" /> Volver a solicitudes
              </Button>
            </>
          ) : (
            /* ---- Not yet sent: show quote form ---- */
            <>
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" /> Opciones de presupuesto
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Completá al menos 2 opciones para que el cliente elija.</p>

                <div className="flex flex-col gap-4">
                  {/* Tier: Económica */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-600 space-y-2.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Económica</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input type="number" placeholder="Precio" value={tiers.basicPrice} onChange={(e) => setTiers(p => ({ ...p, basicPrice: e.target.value }))} className="w-full pl-6 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <input type="text" placeholder="Ej: Orgánicos blancos" value={tiers.basicDesc} onChange={(e) => setTiers(p => ({ ...p, basicDesc: e.target.value }))} className="w-full px-2.5 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  {/* Tier: Recomendada */}
                  <div className="p-3.5 rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10 space-y-2.5">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Recomendada
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input type="number" placeholder="Precio" value={tiers.recommendedPrice} onChange={(e) => setTiers(p => ({ ...p, recommendedPrice: e.target.value }))} className="w-full pl-6 pr-2 py-2 text-sm border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <input type="text" placeholder="Ej: Con antirreflex y filtro azul" value={tiers.recommendedDesc} onChange={(e) => setTiers(p => ({ ...p, recommendedDesc: e.target.value }))} className="w-full px-2.5 py-2 text-sm border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  {/* Tier: Premium */}
                  <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10 space-y-2.5">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Premium</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input type="number" placeholder="Precio" value={tiers.premiumPrice} onChange={(e) => setTiers(p => ({ ...p, premiumPrice: e.target.value }))} className="w-full pl-6 pr-2 py-2 text-sm border border-amber-200 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <input type="text" placeholder="Ej: Fotocromáticos premium" value={tiers.premiumDesc} onChange={(e) => setTiers(p => ({ ...p, premiumDesc: e.target.value }))} className="w-full px-2.5 py-2 text-sm border border-amber-200 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  {/* Estimated days */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Días estimados de entrega <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" placeholder="7" min={1} value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Frame selector */}
              {frames.length > 0 && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-slate-400" /> Seleccioná armazones del catálogo
                    </h2>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{selectedFrames.length}/5 seleccionados</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Elegí hasta 5 opciones para ofrecer al cliente.</p>

                  <div className="grid grid-cols-2 gap-3">
                    {frames.map((frame) => {
                      const isSelected = selectedFrames.includes(frame.id)
                      return (
                        <button
                          key={frame.id}
                          onClick={() => toggleFrame(frame.id)}
                          className={`relative text-left rounded-xl border-2 p-3 transition-all duration-150 focus:outline-none ${
                            isSelected
                              ? 'border-primary bg-blue-50/60 dark:bg-blue-900/20 shadow-sm shadow-primary/10'
                              : 'border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500 bg-white dark:bg-slate-700'
                          }`}
                        >
                          <div className="absolute top-2.5 right-2.5">
                            {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-slate-300 dark:text-slate-500" />}
                          </div>
                          {frame.imageUrl ? (
                            <img src={frame.imageUrl} alt={`${frame.brand} ${frame.model}`} className="w-full h-20 rounded-lg mb-2 object-cover" />
                          ) : (
                            <div className="w-full h-20 rounded-lg mb-2 bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{frame.brand}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{frame.model}</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">${Number(frame.priceMin || frame.price || 0).toLocaleString('es-AR')}</p>
                          {frame.arReady && (
                            <div className="mt-2"><Badge variant="success">AR Ready</Badge></div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </Card>
              )}

              <Button size="lg" onClick={handleSubmit} className="w-full" disabled={submitting}>
                <SendHorizonal className="w-4 h-4" /> {submitting ? 'Enviando...' : 'Enviar presupuesto'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
