import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import GuestContactForm, { validateGuestContact } from '../../components/public/GuestContactForm'
import { compressImage } from '../../lib/imageCompression'

const LENS_TYPES = [
  { id: 'monofocal', label: 'Monofocal', desc: 'Un solo foco, visión simple' },
  { id: 'bifocal', label: 'Bifocal', desc: 'Dos zonas de visión' },
  { id: 'progresivo', label: 'Progresivo', desc: 'Transición suave entre focos' },
  { id: 'no_se', label: 'No estoy seguro', desc: 'Quiero asesoramiento de la óptica' },
]

const PATIENT_TYPES = [
  { id: 'adulto', label: 'Adulto/a' },
  { id: 'nino', label: 'Niño' },
  { id: 'nina', label: 'Niña' },
]

const GENDERS = [
  { id: 'femenino', label: 'Mujer' },
  { id: 'masculino', label: 'Hombre' },
  { id: 'otro', label: 'Otro' },
  { id: 'no_especifica', label: 'Prefiero no decir' },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function NuevaRecetaPublica() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [recetaFile, setRecetaFile] = useState(null)
  const [recetaPreview, setRecetaPreview] = useState(null)
  const [compressing, setCompressing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [lensType, setLensType] = useState('')
  const [gender, setGender] = useState('no_especifica')
  const [patientType, setPatientType] = useState('adulto')
  const [patientAge, setPatientAge] = useState('')
  const [observations, setObservations] = useState('')
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)

  async function handleFile(file) {
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo es demasiado grande. Máximo 10 MB.')
      return
    }
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/) && file.type !== 'application/pdf') {
      toast.error('Solo se permiten imágenes (JPG, PNG, WebP, GIF) o PDF.')
      return
    }
    let prepared = file
    if (file.type.startsWith('image/') && file.type !== 'image/gif') {
      setCompressing(true)
      try {
        prepared = await compressImage(file, { maxSizeMB: 1, maxWidthOrHeight: 2000 })
      } finally {
        setCompressing(false)
      }
    }
    setRecetaFile(prepared)
    setRecetaPreview(URL.createObjectURL(prepared))
  }

  function clearReceta() {
    setRecetaFile(null)
    if (recetaPreview) URL.revokeObjectURL(recetaPreview)
    setRecetaPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadPrescriptionAnon() {
    if (!recetaFile) throw new Error('Subí tu receta primero')
    const fd = new FormData()
    fd.append('file', recetaFile)
    const res = await fetch('/api/prescriptions/public', { method: 'POST', body: fd })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'No se pudo subir la receta')
    }
    return res.json()
  }

  async function handleSubmit() {
    if (!recetaFile) {
      toast.error('Subí la foto o PDF de tu receta primero.')
      return
    }
    if (!lensType) {
      toast.error('Elegí el tipo de lente que necesitás.')
      return
    }
    const contactErr = validateGuestContact(contact)
    if (contactErr) { toast.error(contactErr); return }

    setSubmitting(true)
    try {
      let clientLat = -34.6
      let clientLng = -58.38
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
        )
        clientLat = pos.coords.latitude
        clientLng = pos.coords.longitude
      } catch {
        // ignore — backend fallback
      }

      const prescription = await uploadPrescriptionAnon()

      const res = await fetch('/api/requests/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'lentes_receta',
          prescriptionId: prescription.id,
          lensType,
          gender,
          patientType,
          patientAge: patientAge ? Number(patientAge) : undefined,
          observations: observations || undefined,
          clientLat,
          clientLng,
          guestName: contact.name.trim(),
          guestEmail: contact.email.trim().toLowerCase(),
          guestPhone: contact.phone.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo crear la solicitud')

      toast.success('¡Solicitud enviada! Te avisaremos por email cuando tengamos presupuestos.')
      navigate(`/presupuesto/${data.claimToken}?just_created=1`)
    } catch (err) {
      toast.error(err.message || 'No se pudo enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Receta upload */}
      <Card className="p-5 space-y-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Subí tu receta</label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Foto o PDF — la óptica la va a leer para presupuestarte.</p>
        </div>
        {recetaPreview ? (
          <div className="relative">
            {recetaFile?.type?.startsWith('image/') ? (
              <img src={recetaPreview} alt="Receta" className="w-full max-h-72 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
            ) : (
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-300">
                📄 {recetaFile?.name || 'PDF subido'}
              </div>
            )}
            <button type="button" onClick={clearReceta} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        ) : (
          <div
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]) }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !compressing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
              ${isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30 hover:border-blue-400'
              } ${compressing ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Camera className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {compressing ? 'Optimizando imagen...' : 'Arrastrá tu receta aquí'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PNG, JPG o PDF · Máx. 10 MB</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Upload className="w-3.5 h-3.5" /> O tocá para elegir
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
      </Card>

      {/* Lens type */}
      <Card className="p-5 space-y-3">
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
      </Card>

      {/* Patient info */}
      <Card className="p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">¿Para quién es?</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {GENDERS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGender(g.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all
                  ${gender === g.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">¿Es para un adulto, niño o niña?</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {PATIENT_TYPES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPatientType(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all
                  ${patientType === p.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Edad del/la paciente</p>
          <input
            type="number"
            min="0"
            max="120"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            placeholder="Ej: 8"
            className="mt-2 w-full max-w-[160px] px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-600"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ayuda a la óptica a sugerir el tamaño correcto de armazón y cristales.
          </p>
        </div>
      </Card>

      {/* Optional observations */}
      <Card className="p-5">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Observaciones (opcional)</label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value.slice(0, 500))}
          placeholder="Comentarios adicionales para la óptica"
          rows={3}
          className="mt-2 w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-600 resize-none"
        />
      </Card>

      {/* Contact */}
      <Card className="p-5">
        <GuestContactForm value={contact} onChange={setContact} />
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : 'Enviar solicitud'}
        </Button>
      </div>
    </div>
  )
}
