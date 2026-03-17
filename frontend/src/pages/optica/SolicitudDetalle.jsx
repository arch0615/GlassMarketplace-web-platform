import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  ImageIcon,
  MapPin,
  Tag,
  DollarSign,
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  SendHorizonal,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const MOCK_REQUESTS = {
  1024: {
    id: '1024',
    client: 'Cliente #1024',
    lensType: 'Bifocales progresivos',
    priceRange: '$8.000 – $15.000',
    distance: '1.8 km',
    received: 'Hace 12 min',
    styleTags: ['Clásico', 'Sin aro'],
    prescription: {
      od_esf: '-2.50',
      od_cil: '-0.75',
      od_eje: '180°',
      oi_esf: '-3.00',
      oi_cil: '-0.50',
      oi_eje: '175°',
      add: '+2.00',
    },
  },
  1031: {
    id: '1031',
    client: 'Cliente #1031',
    lensType: 'Monofocales (lejos)',
    priceRange: '$5.000 – $10.000',
    distance: '3.1 km',
    received: 'Hace 34 min',
    styleTags: ['Deportivo', 'Oversize'],
    prescription: {
      od_esf: '-1.00',
      od_cil: '0.00',
      od_eje: '—',
      oi_esf: '-1.25',
      oi_cil: '-0.25',
      oi_eje: '90°',
      add: '—',
    },
  },
}

const CATALOG_FRAMES = [
  {
    id: 'f1',
    brand: 'Ray-Ban',
    model: 'RB5154 Clubmaster',
    priceRange: '$12.000 – $18.000',
    color: 'bg-amber-800',
    arReady: true,
  },
  {
    id: 'f2',
    brand: 'Silhouette',
    model: '5500 Rimless',
    priceRange: '$22.000 – $30.000',
    color: 'bg-slate-400',
    arReady: true,
  },
  {
    id: 'f3',
    brand: 'Oakley',
    model: 'OX8046 Pitchman',
    priceRange: '$9.000 – $14.000',
    color: 'bg-gray-800',
    arReady: false,
  },
  {
    id: 'f4',
    brand: 'Lindberg',
    model: 'Air Titanium 4481',
    priceRange: '$35.000 – $45.000',
    color: 'bg-yellow-600',
    arReady: true,
  },
]

export default function SolicitudDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()

  const request = MOCK_REQUESTS[id] || MOCK_REQUESTS['1024']

  const [totalPrice, setTotalPrice] = useState('')
  const [lensDescription, setLensDescription] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [selectedFrames, setSelectedFrames] = useState([])

  const toggleFrame = (frameId) => {
    setSelectedFrames((prev) => {
      if (prev.includes(frameId)) {
        return prev.filter((f) => f !== frameId)
      }
      if (prev.length >= 5) {
        toast.error('Podés seleccionar hasta 5 armazones.')
        return prev
      }
      return [...prev, frameId]
    })
  }

  const handleSubmit = () => {
    if (!totalPrice || !lensDescription || !estimatedDays) {
      toast.error('Completá todos los campos obligatorios.')
      return
    }
    if (selectedFrames.length === 0) {
      toast.error('Seleccioná al menos un armazón del catálogo.')
      return
    }
    toast.success('Presupuesto enviado correctamente.')
    navigate('/optica/solicitudes')
  }

  const rx = request.prescription

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/optica/solicitudes')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-800">
          Responder solicitud — {request.client}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: request details */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" /> Receta del cliente
            </h2>
            {/* Prescription image placeholder */}
            <div className="w-full h-40 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 mb-4">
              <ImageIcon className="w-8 h-8 text-slate-300" />
              <span className="text-xs text-slate-400">Imagen de receta</span>
            </div>

            {/* Prescription data */}
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Valores
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left text-slate-400 font-medium pb-1">Ojo</th>
                    <th className="text-center text-slate-400 font-medium pb-1">Esf</th>
                    <th className="text-center text-slate-400 font-medium pb-1">Cil</th>
                    <th className="text-center text-slate-400 font-medium pb-1">Eje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-1.5 font-medium text-slate-700">OD</td>
                    <td className="py-1.5 text-center text-slate-600">{rx.od_esf}</td>
                    <td className="py-1.5 text-center text-slate-600">{rx.od_cil}</td>
                    <td className="py-1.5 text-center text-slate-600">{rx.od_eje}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium text-slate-700">OI</td>
                    <td className="py-1.5 text-center text-slate-600">{rx.oi_esf}</td>
                    <td className="py-1.5 text-center text-slate-600">{rx.oi_cil}</td>
                    <td className="py-1.5 text-center text-slate-600">{rx.oi_eje}</td>
                  </tr>
                </tbody>
              </table>
              {rx.add !== '—' && (
                <p className="text-xs text-slate-500 mt-2">
                  <span className="font-medium text-slate-700">ADD:</span> {rx.add}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" /> Preferencias del cliente
            </h2>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Tipo de lente</span>
                <Badge variant="info">{request.lensType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Rango de precio</span>
                <span className="text-xs font-semibold text-slate-700">{request.priceRange}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Distancia</span>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {request.distance}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-slate-500 mt-0.5">Estilos buscados</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {request.styleTags.map((tag) => (
                    <Badge key={tag} variant="purple">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: build quote */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" /> Construí tu presupuesto
            </h2>

            <div className="flex flex-col gap-4">
              {/* Total price */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Precio total <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lens description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Descripción de lentes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Lentes progresivos Zeiss Individual 2, con tratamiento antirreflex y filtro UV..."
                  value={lensDescription}
                  onChange={(e) => setLensDescription(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Estimated days */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Días estimados de entrega <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    placeholder="7"
                    min={1}
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Frame selector */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-400" /> Seleccioná armazones del catálogo
              </h2>
              <span className="text-xs text-slate-400">
                {selectedFrames.length}/5 seleccionados
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Elegí hasta 5 opciones para ofrecer al cliente.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CATALOG_FRAMES.map((frame) => {
                const isSelected = selectedFrames.includes(frame.id)
                return (
                  <button
                    key={frame.id}
                    onClick={() => toggleFrame(frame.id)}
                    className={`relative text-left rounded-xl border-2 p-3 transition-all duration-150 focus:outline-none ${
                      isSelected
                        ? 'border-primary bg-blue-50/60 shadow-sm shadow-primary/10'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    {/* Selection indicator */}
                    <div className="absolute top-2.5 right-2.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </div>

                    {/* Frame color image placeholder */}
                    <div className={`w-full h-20 rounded-lg mb-2 ${frame.color} opacity-80`} />

                    <p className="text-xs font-bold text-slate-800">{frame.brand}</p>
                    <p className="text-xs text-slate-500 leading-snug">{frame.model}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{frame.priceRange}</p>

                    {frame.arReady && (
                      <div className="mt-2">
                        <Badge variant="success">AR Ready</Badge>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Submit */}
          <Button size="lg" onClick={handleSubmit} className="w-full">
            <SendHorizonal className="w-4 h-4" /> Enviar presupuesto
          </Button>
        </div>
      </div>
    </div>
  )
}
