import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Clock, X, CheckCircle2, ChevronRight, Loader2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{rating?.toFixed(1) || '—'}</span>
    </div>
  )
}

function FrameCard({ frame, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(frame.id)}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-full
        ${selected
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-700'
          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}
    >
      <div className="w-16 h-10 rounded-lg bg-slate-300 dark:bg-slate-600 opacity-80" />
      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium text-center leading-tight">
        {frame.brand} {frame.model}
      </span>
    </button>
  )
}

function AcceptModal({ quote, onClose }) {
  const navigate = useNavigate()
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  const frames = quote.quoteFrames?.map((qf) => qf.frame).filter(Boolean) || []

  async function handleConfirm() {
    if (frames.length > 0 && !selectedFrame) {
      toast.error('Seleccioná un armazón para continuar.')
      return
    }
    setLoading(true)
    try {
      await api(`/quotes/${quote.id}/accept`, { method: 'PATCH' })
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          quoteId: quote.id,
          selectedFrameId: selectedFrame || undefined,
          amount: Number(quote.totalPrice),
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {confirmed ? 'Pedido confirmado' : `Seleccionar armazón — ${quote.optica?.businessName || 'Óptica'}`}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {confirmed ? (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
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
          <div className="px-6 py-5 space-y-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {frames.length > 0
                ? <>Elegí el armazón de tu preferencia para confirmar el presupuesto de{' '}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      ${Number(quote.totalPrice).toLocaleString('es-AR')}
                    </span>.</>
                : <>Confirmá el presupuesto de{' '}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      ${Number(quote.totalPrice).toLocaleString('es-AR')}
                    </span>.</>
              }
            </p>

            {frames.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {frames.map((frame) => (
                  <FrameCard
                    key={frame.id}
                    frame={frame}
                    selected={selectedFrame === frame.id}
                    onSelect={setSelectedFrame}
                  />
                ))}
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
                disabled={loading || (frames.length > 0 && !selectedFrame)}
                onClick={handleConfirm}
              >
                {loading ? 'Confirmando...' : 'Confirmar pedido'}
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
                        {opticaName}
                      </p>
                      <div className="mt-1">
                        <StarRating rating={rating} />
                      </div>
                    </div>
                    {isAccepted && <Badge variant="success">Aceptado</Badge>}
                    {isRejected && <Badge variant="neutral">Rechazado</Badge>}
                    {!isAccepted && !isRejected && idx === 0 && (
                      <Badge variant="success">Mejor precio</Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                      ${price.toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Total del pedido</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    {quote.lensDescription && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Lente</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{quote.lensDescription}</span>
                      </div>
                    )}
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
                      <div className="grid grid-cols-3 gap-2">
                        {frames.map((frame) => (
                          <div key={frame.id} className="flex flex-col items-center gap-1">
                            <div className="w-full h-8 rounded-lg bg-slate-300 dark:bg-slate-600 opacity-80" />
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight">
                              {frame.brand} {frame.model}
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

      {/* Modal */}
      {modalQuote && (
        <AcceptModal quote={modalQuote} onClose={() => setModalQuote(null)} />
      )}
    </div>
  )
}
