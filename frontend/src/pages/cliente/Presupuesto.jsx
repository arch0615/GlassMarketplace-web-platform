import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Clock, X, CheckCircle2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const QUOTES = [
  {
    id: 'q1',
    optica: 'Óptica Visión Norte',
    rating: 4.7,
    price: 110000,
    lensType: 'Progresivo',
    estimatedDays: '5 días hábiles',
    frames: [
      { id: 'f1', name: 'Ray-Ban RB5154', color: 'bg-slate-700' },
      { id: 'f2', name: 'Vogue VO5332', color: 'bg-amber-600' },
      { id: 'f3', name: 'Oakley OX3217', color: 'bg-slate-400' },
    ],
  },
  {
    id: 'q2',
    optica: 'Óptica Central',
    rating: 4.5,
    price: 95000,
    lensType: 'Progresivo',
    estimatedDays: '7 días hábiles',
    frames: [
      { id: 'f4', name: 'Prada PR 05ZV', color: 'bg-stone-700' },
      { id: 'f5', name: 'Gucci GG0027O', color: 'bg-yellow-700' },
      { id: 'f6', name: 'Armani EA3221', color: 'bg-slate-500' },
    ],
  },
  {
    id: 'q3',
    optica: 'Óptica La Plata',
    rating: 4.2,
    price: 82000,
    lensType: 'Progresivo',
    estimatedDays: '6 días hábiles',
    frames: [
      { id: 'f7', name: 'Carrera CA6658', color: 'bg-blue-800' },
      { id: 'f8', name: 'Tommy TH0372', color: 'bg-red-700' },
      { id: 'f9', name: 'Silhouette 2923', color: 'bg-slate-300' },
    ],
  },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold text-slate-700">{rating}</span>
    </div>
  )
}

function FrameCard({ frame, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(frame.id)}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-full
        ${selected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <div className={`w-16 h-10 rounded-lg ${frame.color} opacity-80`} />
      <span className="text-xs text-slate-600 font-medium text-center leading-tight">
        {frame.name}
      </span>
    </button>
  )
}

function AcceptModal({ quote, onClose }) {
  const navigate = useNavigate()
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  function handleConfirm() {
    if (!selectedFrame) {
      toast.error('Seleccioná un armazón para continuar.')
      return
    }
    setConfirmed(true)
  }

  function handleFinish() {
    toast.success('¡Pedido confirmado! Podés seguirlo en Mis Pedidos.')
    onClose()
    navigate('/cliente/pedidos')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">
            {confirmed ? 'Pedido confirmado' : `Seleccionar armazón — ${quote.optica}`}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {confirmed ? (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">¡Listo!</p>
              <p className="text-sm text-slate-500 mt-1">
                Tu pedido fue confirmado con {quote.optica}. Podrás hacer el seguimiento
                desde Mis Pedidos.
              </p>
            </div>
            <Button variant="primary" size="md" className="w-full mt-2" onClick={handleFinish}>
              Ir a Mis Pedidos
            </Button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            <p className="text-sm text-slate-500">
              Elegí el armazón de tu preferencia para confirmar el presupuesto de{' '}
              <span className="font-bold text-slate-700">
                ${quote.price.toLocaleString('es-AR')}
              </span>
              .
            </p>

            <div className="grid grid-cols-3 gap-3">
              {quote.frames.map((frame) => (
                <FrameCard
                  key={frame.id}
                  frame={frame}
                  selected={selectedFrame === frame.id}
                  onSelect={setSelectedFrame}
                />
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                disabled={!selectedFrame}
                onClick={handleConfirm}
              >
                Confirmar pedido
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Presupuesto() {
  const [modalQuote, setModalQuote] = useState(null)
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Presupuestos recibidos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Compará las opciones y elegí la que mejor se adapta a vos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {QUOTES.map((quote, idx) => (
          <Card key={quote.id} className="flex flex-col overflow-hidden">
            {/* Top accent */}
            <div
              className={`h-1.5 ${
                idx === 0
                  ? 'bg-gradient-to-r from-blue-600 to-sky-400'
                  : idx === 1
                  ? 'bg-gradient-to-r from-slate-500 to-slate-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400'
              }`}
            />

            <div className="p-5 flex flex-col gap-4 flex-1">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-800 text-sm leading-tight">
                    {quote.optica}
                  </p>
                  <div className="mt-1">
                    <StarRating rating={quote.rating} />
                  </div>
                </div>
                {idx === 0 && (
                  <Badge variant="success">Mejor precio</Badge>
                )}
              </div>

              {/* Price */}
              <div>
                <p className="text-3xl font-extrabold text-slate-800">
                  ${quote.price.toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Total del pedido</p>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tipo de lente</span>
                  <span className="font-semibold text-slate-700">{quote.lensType}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tiempo estimado</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {quote.estimatedDays}
                  </span>
                </div>
              </div>

              {/* Frame previews */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Armazones incluidos
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {quote.frames.map((frame) => (
                    <div key={frame.id} className="flex flex-col items-center gap-1">
                      <div className={`w-full h-8 rounded-lg ${frame.color} opacity-80`} />
                      <span className="text-[10px] text-slate-500 text-center leading-tight">
                        {frame.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setModalQuote(quote)}
                >
                  Aceptar presupuesto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setExpanded(expanded === quote.id ? null : quote.id)}
                >
                  {expanded === quote.id ? 'Ocultar detalles' : 'Ver detalles'}
                </Button>
              </div>

              {/* Expanded details */}
              {expanded === quote.id && (
                <div className="border-t border-slate-100 pt-3 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-slate-700">Detalles adicionales</p>
                  <p>Garantía de lentes: 12 meses</p>
                  <p>Incluye funda y paño de limpieza</p>
                  <p>Pago: transferencia o efectivo</p>
                  <p className="text-xs text-slate-400">
                    * El tiempo estimado puede variar según disponibilidad de stock.
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {modalQuote && (
        <AcceptModal quote={modalQuote} onClose={() => setModalQuote(null)} />
      )}
    </div>
  )
}
