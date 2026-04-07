import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  CheckCircle2,
  MapPin,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const SERVICE_INFO = {
  reparacion: {
    title: 'Reparaciones / arreglos',
    placeholder: 'Describí qué necesitás reparar: armazón roto, tornillo suelto, patilla doblada, soldadura, etc.',
    photoLabel: 'Foto del armazón o lente dañado (opcional)',
  },
  lentes_contacto: {
    title: 'Lentes de contacto',
    placeholder: 'Indicá el tipo de lente que usás o necesitás: marca, graduación, si son blandas/rígidas, descartables/mensuales, etc.',
    photoLabel: 'Foto de tu receta o caja actual (opcional)',
  },
  liquidos_accesorios: {
    title: 'Líquidos y accesorios',
    placeholder: 'Indicá qué productos necesitás: solución multipropósito, gotas humectantes, estuche, paño, etc.',
    photoLabel: 'Foto del producto que necesitás (opcional)',
  },
  otro: {
    title: 'Otro servicio óptico',
    placeholder: 'Describí con detalle qué servicio necesitás de la óptica.',
    photoLabel: 'Adjuntar imagen (opcional)',
  },
}

export default function SolicitudServicio() {
  const { type } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const info = SERVICE_INFO[type]
  const [description, setDescription] = useState('')
  const [observations, setObservations] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!info) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 dark:text-slate-400">Tipo de servicio no válido.</p>
      </div>
    )
  }

  const handleFile = (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 10 MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Completá la descripción del servicio.')
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      // Upload image if provided
      let prescriptionId = undefined
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('notes', `[${info.title}] ${description}`)
        const res = await fetch('/api/prescriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        if (res.ok) {
          const prescription = await res.json()
          prescriptionId = prescription.id
        }
      }

      // Get geolocation
      let clientLat = -34.6037
      let clientLng = -58.3816
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        )
        clientLat = pos.coords.latitude
        clientLng = pos.coords.longitude
      } catch {}

      await api('/requests', {
        method: 'POST',
        body: JSON.stringify({
          serviceType: type,
          prescriptionId,
          lensType: 'no_se',
          observations: [description, observations].filter(Boolean).join('\n---\n'),
          clientLat,
          clientLng,
        }),
      })

      toast.success('¡Solicitud enviada! Las ópticas cercanas recibirán tu pedido.')
      navigate('/cliente/solicitudes')
    } catch (err) {
      toast.error(err.message || 'Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/cliente/nueva-solicitud')}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{info.title}</h1>
      </div>

      <Card className="p-6 space-y-5">
        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            ¿Qué necesitás? <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder={info.placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Optional photo */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            {info.photoLabel}
          </label>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-slate-600" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 bg-white dark:bg-slate-700 rounded-full shadow flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG o PDF · Máx. 10 MB</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* Observations */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Observaciones adicionales
          </label>
          <textarea
            rows={2}
            placeholder="Cualquier detalle extra que quieras agregar..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            Tu solicitud será enviada a <span className="font-bold">ópticas cercanas</span>. Recibirás presupuestos en las próximas horas.
          </p>
        </div>

        <Button variant="primary" size="lg" className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
      </Card>
    </div>
  )
}
