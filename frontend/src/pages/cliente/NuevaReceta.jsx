import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  MapPin,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const STEPS = ['Subir receta', 'Detalles del pedido', 'Confirmación']

const LENS_TYPES = [
  { id: 'monofocal', label: 'Monofocal', desc: 'Un solo foco, visión simple' },
  { id: 'bifocal', label: 'Bifocal', desc: 'Dos zonas de visión' },
  { id: 'progresivo', label: 'Progresivo', desc: 'Transición suave entre focos' },
  { id: 'no_se', label: 'No estoy seguro', desc: 'Quiero asesoramiento de la óptica' },
]

const PRICE_RANGES = [
  { id: 'bajo', label: '$50.000 – $100.000', sub: 'Económico' },
  { id: 'medio', label: '$100.000 – $200.000', sub: 'Estándar' },
  { id: 'alto', label: '$200.000 – $400.000', sub: 'Premium' },
  { id: 'premium', label: '$400.000+', sub: 'Exclusivo' },
  { id: 'no_se', label: 'No estoy seguro', sub: 'La óptica me asesorará' },
]

const FRAME_STYLES = [
  { id: 'metal', label: 'Metal' },
  { id: 'acetato', label: 'Acetato' },
  { id: 'titanio', label: 'Titanio' },
  { id: 'sin_aro', label: 'Sin aro' },
]

export default function NuevaReceta() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [step, setStep] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [recetaFile, setRecetaFile] = useState(null)
  const [recetaPreview, setRecetaPreview] = useState(null)
  const [lensType, setLensType] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [frameStyles, setFrameStyles] = useState([])
  const [gender, setGender] = useState('')
  const [observations, setObservations] = useState('')
  const [loading, setLoading] = useState(false)

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  function handleFile(file) {
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo es demasiado grande. Máximo 10 MB.')
      return
    }
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/) && file.type !== 'application/pdf') {
      toast.error('Solo se permiten imágenes (JPG, PNG, WebP, GIF) o PDF.')
      return
    }
    setRecetaFile(file)
    setRecetaPreview(URL.createObjectURL(file))
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function toggleFrameStyle(id) {
    setFrameStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      // 1. Upload prescription
      const formData = new FormData()
      formData.append('file', recetaFile)
      const noteParts = []
      if (lensType && lensType !== 'no_se') noteParts.push(`Lente: ${getLensLabel()}`)
      else noteParts.push('Lente: Necesita asesoramiento')
      if (priceRange && priceRange !== 'no_se') noteParts.push(`Precio: ${getPriceLabel()}`)
      else noteParts.push('Precio: Sin preferencia')
      noteParts.push(`Estilo: ${getStyleLabels()}`)
      formData.append('notes', noteParts.join(' | '))

      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        let msg = 'Error al enviar la receta'
        try { const data = await res.json(); msg = data.message || msg } catch {}
        throw new Error(msg)
      }

      const prescription = await res.json()

      // 2. Get client geolocation
      let clientLat = -34.6037
      let clientLng = -58.3816
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        )
        clientLat = pos.coords.latitude
        clientLng = pos.coords.longitude
      } catch {
        // Fallback to Buenos Aires if geolocation denied
      }

      // 3. Create QuoteRequest so ópticas receive the solicitud
      const PRICE_MAP = {
        bajo: { min: '50000', max: '100000' },
        medio: { min: '100000', max: '200000' },
        alto: { min: '200000', max: '400000' },
        premium: { min: '400000', max: '1000000' },
        no_se: { min: null, max: null },
      }
      const priceValues = PRICE_MAP[priceRange] || { min: null, max: null }

      await api('/requests', {
        method: 'POST',
        body: JSON.stringify({
          serviceType: 'lentes_receta',
          prescriptionId: prescription.id,
          lensType,
          gender: gender || 'no_especifica',
          observations: observations || undefined,
          priceRangeMin: priceValues.min,
          priceRangeMax: priceValues.max,
          stylePreferences: frameStyles,
          clientLat,
          clientLng,
        }),
      })

      toast.success('¡Solicitud enviada! Las ópticas cercanas recibirán tu receta.')
      navigate('/cliente/solicitudes')
    } catch (err) {
      toast.error(err.message || 'Error al enviar la receta')
    } finally {
      setLoading(false)
    }
  }

  const getLensLabel = () => LENS_TYPES.find((l) => l.id === lensType)?.label || '—'
  const getPriceLabel = () => PRICE_RANGES.find((p) => p.id === priceRange)?.label || '—'
  const getStyleLabels = () =>
    frameStyles.length > 0
      ? frameStyles.map((id) => FRAME_STYLES.find((s) => s.id === id)?.label).join(', ')
      : 'Sin preferencia'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  i === step ? 'text-blue-700 dark:text-blue-400' : i < step ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 rounded ${
                  i < step ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Subir receta */}
      {step === 0 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Subir tu receta</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Necesitamos la imagen de tu receta médica para procesar el pedido.
            </p>
          </div>

          {recetaPreview ? (
            <div className="relative">
              <img
                src={recetaPreview}
                alt="Receta"
                className="w-full h-56 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
              />
              <button
                onClick={() => { setRecetaFile(null); setRecetaPreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 bg-white dark:bg-slate-700 rounded-full shadow flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
              <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {recetaFile?.name}
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors
                ${isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/10'
                }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Arrastrá tu receta aquí
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  PNG, JPG o PDF · Máx. 10 MB
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <Upload className="w-3.5 h-3.5" />
                Soltar archivo para subir
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {!recetaPreview && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              O cargar desde galería
            </button>
          )}

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              disabled={!recetaFile}
              onClick={() => setStep(1)}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2 — Detalles */}
      {step === 1 && (
        <Card className="p-6 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Detalles del pedido</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Contanos qué tipo de lentes y armazón preferís. Si no estás seguro, la óptica te asesorará.
            </p>
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">¿Para quién es?</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'femenino', label: 'Mujer' },
                { id: 'masculino', label: 'Hombre' },
                { id: 'otro', label: 'Otro' },
                { id: 'no_especifica', label: 'Prefiero no decir' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all
                    ${gender === g.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lens type */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo de lente</p>
            <div className="grid grid-cols-2 gap-3">
              {LENS_TYPES.map((lens) => (
                <button
                  key={lens.id}
                  onClick={() => setLensType(lens.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all
                    ${lensType === lens.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{lens.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lens.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Rango de precio del armazón
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setPriceRange(range.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all
                    ${priceRange === range.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{range.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{range.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Frame style */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Estilo de armazón{' '}
              <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {FRAME_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => toggleFrameStyle(style.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all
                    ${frameStyles.includes(style.id)
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Observaciones adicionales{' '}
              <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional)</span>
            </p>
            <textarea
              rows={2}
              placeholder="Cualquier detalle extra que quieras agregar..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="md" onClick={() => setStep(0)}>
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (!lensType) setLensType('no_se')
                if (!priceRange) setPriceRange('no_se')
                setStep(2)
              }}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 — Confirmación */}
      {step === 2 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Confirmación</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Revisá tu solicitud antes de enviarla.
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Receta</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {recetaFile?.name ?? 'Archivo subido'}
              </span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Tipo de lente</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{getLensLabel()}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Rango de precio</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{getPriceLabel()}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Estilo</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{getStyleLabels()}</span>
            </div>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              Tu solicitud será enviada a{' '}
              <span className="font-bold">5 ópticas cercanas</span>. Recibirás
              presupuestos en las próximas horas.
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="md" onClick={() => setStep(1)}>
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Button variant="primary" size="md" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
