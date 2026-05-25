import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Eye, Droplets, HelpCircle, Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { api } from '../../lib/api'
import { compressImage } from '../../lib/imageCompression'

const SERVICE_OPTIONS = [
  {
    id: 'reparacion',
    label: 'Arreglo / Reparación',
    desc: 'Cambio de armazón, tornillos, soldaduras, ajustes',
    icon: Wrench,
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'lentes_contacto',
    label: 'Lentes de contacto',
    desc: 'Cotización de lentes de contacto (blandas o rígidas)',
    icon: Eye,
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'liquidos_accesorios',
    label: 'Líquidos / Insumos',
    desc: 'Soluciones de limpieza, estuches, paños, accesorios',
    icon: Droplets,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    id: 'otro',
    label: 'Otro servicio',
    desc: 'Cualquier otra consulta óptica',
    icon: HelpCircle,
    color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
  },
]

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MIN_DESC = 20
const MAX_DESC = 2000

export default function NuevaArreglo() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [serviceType, setServiceType] = useState('reparacion')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [compressing, setCompressing] = useState(false)

  async function handleFile(file) {
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      toast.error('La foto es demasiado grande. Máximo 5 MB.')
      return
    }
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      toast.error('Solo se permiten imágenes (JPG, PNG, WebP, GIF).')
      return
    }
    let prepared = file
    if (file.type !== 'image/gif') {
      setCompressing(true)
      try {
        prepared = await compressImage(file, { maxSizeMB: 1, maxWidthOrHeight: 2000 })
      } finally {
        setCompressing(false)
      }
    }
    setPhotoFile(prepared)
    setPhotoPreview(URL.createObjectURL(prepared))
  }

  function clearPhoto() {
    setPhotoFile(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function uploadPhoto() {
    if (!photoFile) return null
    const formData = new FormData()
    formData.append('image', photoFile)
    const token = localStorage.getItem('token')
    const res = await fetch('/api/requests/upload-photo', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'No se pudo subir la foto')
    }
    const data = await res.json()
    return data.url
  }

  async function handleSubmit() {
    const trimmed = description.trim()
    if (trimmed.length < MIN_DESC) {
      toast.error(`Describí el servicio con al menos ${MIN_DESC} caracteres.`)
      return
    }

    setSubmitting(true)
    try {
      // 1. Geolocate so the request gets routed to nearby ópticas (matches
      //    the existing receta flow).
      let clientLat = null
      let clientLng = null
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
        )
        clientLat = pos.coords.latitude
        clientLng = pos.coords.longitude
      } catch {
        // Geo denied; backend will still route via fallback to all ópticas.
        clientLat = -34.6
        clientLng = -58.38
      }

      // 2. Upload photo if present.
      let photoUrl = null
      if (photoFile) {
        photoUrl = await uploadPhoto()
      }

      // 3. Create the request.
      await api('/requests', {
        method: 'POST',
        body: JSON.stringify({
          serviceType,
          description: trimmed,
          photoUrl: photoUrl || undefined,
          clientLat,
          clientLng,
        }),
      })

      toast.success('¡Solicitud enviada! Las ópticas cercanas la recibirán en breve.')
      navigate('/cliente/solicitudes')
    } catch (err) {
      toast.error(err.message || 'No se pudo enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  const charsLeft = MAX_DESC - description.length
  const descTooShort = description.trim().length < MIN_DESC
  const activeOption = SERVICE_OPTIONS.find((o) => o.id === serviceType)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Arreglos y otros servicios</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Describí lo que necesitás y las ópticas cercanas te van a enviar presupuestos.
        </p>
      </div>

      {/* Service type selection */}
      <Card className="p-5">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">¿Qué necesitás?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICE_OPTIONS.map(({ id, label, desc, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setServiceType(id)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                ${serviceType === id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Description */}
      <Card className="p-5 space-y-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Contanos qué necesitás
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dale a la óptica todo el detalle que puedas. Mínimo {MIN_DESC} caracteres.
          </p>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
          placeholder={
            activeOption?.id === 'reparacion'
              ? 'Ej: Se me rompió la patilla derecha del armazón. Es un Ray-Ban metálico.'
              : activeOption?.id === 'lentes_contacto'
              ? 'Ej: Necesito lentes de contacto blandas, esférica, -2.25 ambos ojos, uso mensual.'
              : activeOption?.id === 'liquidos_accesorios'
              ? 'Ej: Necesito una solución multipropósito de 360 ml y un estuche nuevo.'
              : 'Describí lo que necesitás con la mayor cantidad de detalle posible.'
          }
          rows={5}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-600 resize-none"
        />
        <div className="flex items-center justify-between text-xs">
          <span className={descTooShort ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
            {descTooShort ? `Mínimo ${MIN_DESC} caracteres (${description.trim().length}/${MIN_DESC})` : '✓ Descripción válida'}
          </span>
          <span className="text-slate-400 dark:text-slate-500">{charsLeft} restantes</span>
        </div>
      </Card>

      {/* Optional photo upload */}
      <Card className="p-5 space-y-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Foto (opcional)
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sirve mucho cuando el armazón está roto o querés mostrar la caja del producto.
          </p>
        </div>

        {!photoPreview ? (
          <button
            type="button"
            onClick={() => !compressing && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            disabled={compressing}
            className={`w-full rounded-xl border-2 border-dashed transition-colors py-10 px-4 flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/50 dark:bg-slate-700/30'
            } ${compressing ? 'opacity-60 cursor-wait' : ''}`}
          >
            {compressing ? (
              <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
            ) : (
              <Upload className="w-7 h-7 text-slate-400" />
            )}
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {compressing ? 'Optimizando imagen...' : 'Subir foto'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">JPG, PNG, WebP — máximo 5 MB</p>
          </button>
        ) : (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Vista previa"
              className="w-full max-h-64 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Quitar foto"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting || descTooShort}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar solicitud'
          )}
        </Button>
      </div>
    </div>
  )
}
