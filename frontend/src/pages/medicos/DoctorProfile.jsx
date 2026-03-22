import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Star,
  Phone,
  Calendar,
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const GRADIENT_COLORS = [
  'from-blue-500 to-primary',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
]

function StarRating({ value, size = 'sm' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${
            i <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 dark:fill-slate-600 text-slate-200 dark:text-slate-600'
          }`}
        />
      ))}
    </div>
  )
}

function InteractiveStars({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              i <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 dark:fill-slate-600 text-slate-200 dark:text-slate-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api(`/medicos/${id}`)
      .then(setDoctor)
      .catch(() => toast.error('No se pudo cargar el perfil'))
      .finally(() => setLoading(false))
  }, [id])

  const submitReview = async () => {
    if (newRating === 0) {
      toast.error('Seleccioná una calificación.')
      return
    }
    if (!newComment.trim()) {
      toast.error('Escribí un comentario.')
      return
    }
    setSubmitting(true)
    try {
      await api(`/medicos/${id}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ score: newRating, comment: newComment.trim() }),
      })
      const updated = await api(`/medicos/${id}`)
      setDoctor(updated)
      setNewRating(0)
      setNewComment('')
      setShowReviewForm(false)
      toast.success('Reseña publicada. ¡Gracias!')
    } catch (err) {
      toast.error(err.message || 'Error al publicar reseña')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Médico no encontrado.</p>
      </div>
    )
  }

  const initials = (doctor.fullName || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const rating = Number(doctor.rating) || 0
  const color = GRADIENT_COLORS[0]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/medicos')}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al directorio
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Profile header card */}
        <Card className="p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{doctor.fullName}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{doctor.specialty}</p>
              {doctor.licenseNumber && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Matrícula: {doctor.licenseNumber}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <StarRating value={rating} size="lg" />
                <span className="font-bold text-slate-700 dark:text-slate-200">{rating.toFixed(1)}</span>
                <span className="text-sm text-slate-400 dark:text-slate-500">({doctor.ratingCount || 0} reseñas)</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                size="lg"
                onClick={() => toast('Función próximamente disponible.', { icon: '📅' })}
              >
                <Calendar className="w-4 h-4" /> Solicitar turno
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Contact */}
            {doctor.user?.phone && (
              <Card className="p-5">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> Contacto
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{doctor.user.phone}</p>
              </Card>
            )}

            {/* Obras sociales */}
            {doctor.obrasSociales && doctor.obrasSociales.length > 0 && (
              <Card className="p-5">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Obras sociales</h2>
                <div className="flex flex-wrap gap-1.5">
                  {doctor.obrasSociales.map((os) => (
                    <Badge key={os} variant="info">{os}</Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Reviews */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" /> Reseñas ({doctor.ratingCount || 0})
                </h2>
                {!showReviewForm && (
                  <Button size="sm" variant="outline" onClick={() => setShowReviewForm(true)}>
                    Dejar reseña
                  </Button>
                )}
              </div>

              {/* Review form */}
              {showReviewForm && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-5">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Tu reseña</h3>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Calificación</p>
                    <InteractiveStars value={newRating} onChange={setNewRating} />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Comentario</p>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Compartí tu experiencia con este médico..."
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowReviewForm(false)
                        setNewRating(0)
                        setNewComment('')
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={submitReview} disabled={submitting}>
                      <Send className="w-3.5 h-3.5" /> {submitting ? 'Publicando...' : 'Publicar reseña'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {(!doctor.ratingCount || doctor.ratingCount === 0) && !showReviewForm && (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
                  Este médico aún no tiene reseñas. ¡Sé el primero!
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
