import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Star,
  Phone,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Send,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const DOCTORS = {
  '1': {
    id: '1',
    name: 'Dr. Martín Suárez',
    specialty: 'Oftalmología',
    rating: 4.9,
    reviewCount: 87,
    phone: '+54 11 4321-5678',
    addresses: [
      'Av. Santa Fe 2340, Piso 4 Of. 12, CABA',
      'Av. Córdoba 1180, CABA (solo martes)',
    ],
    obrasSociales: ['OSDE', 'Swiss Medical', 'Galeno'],
    neighborhood: 'Palermo, CABA',
    initials: 'MS',
    initialsColor: 'from-blue-500 to-primary',
    schedules: [
      { day: 'Lunes', hours: '9:00 – 13:00 / 15:00 – 19:00' },
      { day: 'Martes', hours: '9:00 – 13:00' },
      { day: 'Miércoles', hours: '9:00 – 13:00 / 15:00 – 19:00' },
      { day: 'Jueves', hours: '15:00 – 19:00' },
      { day: 'Viernes', hours: '9:00 – 13:00' },
    ],
    reviews: [
      {
        id: 1,
        author: 'Ana G.',
        rating: 5,
        comment: 'Excelente profesional, muy atento y explica todo con claridad. Muy recomendable.',
        date: '1 mar 2026',
      },
      {
        id: 2,
        author: 'Carlos M.',
        rating: 5,
        comment: 'Diagnóstico preciso y rápido. El consultorio es muy moderno.',
        date: '20 feb 2026',
      },
      {
        id: 3,
        author: 'Laura R.',
        rating: 4,
        comment: 'Buena atención, aunque esperé un poco. En general muy satisfecha.',
        date: '10 feb 2026',
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Dra. Carolina Méndez',
    specialty: 'Oftalmología pediátrica',
    rating: 4.8,
    reviewCount: 64,
    phone: '+54 11 5876-2341',
    addresses: ['Av. Quintana 550, Recoleta, CABA'],
    obrasSociales: ['OSDE', 'Medicus'],
    neighborhood: 'Recoleta, CABA',
    initials: 'CM',
    initialsColor: 'from-purple-500 to-violet-600',
    schedules: [
      { day: 'Lunes', hours: '10:00 – 14:00' },
      { day: 'Miércoles', hours: '10:00 – 14:00 / 16:00 – 20:00' },
      { day: 'Viernes', hours: '10:00 – 14:00' },
    ],
    reviews: [
      {
        id: 1,
        author: 'María P.',
        rating: 5,
        comment: 'Increíble con los chicos. Mi hijo de 6 años quedó encantado.',
        date: '5 mar 2026',
      },
      {
        id: 2,
        author: 'Jorge S.',
        rating: 5,
        comment: 'Muy profesional y paciente. Recomendada 100%.',
        date: '18 feb 2026',
      },
      {
        id: 3,
        author: 'Gabriela T.',
        rating: 4,
        comment: 'Buena atención general. El turno fue puntual.',
        date: '8 feb 2026',
      },
    ],
  },
}

// Fallback doctor
const DEFAULT_DOCTOR = DOCTORS['1']

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
              : 'fill-slate-200 text-slate-200'
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
                : 'fill-slate-200 text-slate-200'
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

  const doctor = DOCTORS[id] || DEFAULT_DOCTOR

  const [reviews, setReviews] = useState(doctor.reviews)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')

  const submitReview = () => {
    if (newRating === 0) {
      toast.error('Seleccioná una calificación.')
      return
    }
    if (!newComment.trim()) {
      toast.error('Escribí un comentario.')
      return
    }
    setReviews((prev) => [
      {
        id: Date.now(),
        author: 'Vos',
        rating: newRating,
        comment: newComment.trim(),
        date: 'Hoy',
      },
      ...prev,
    ])
    setNewRating(0)
    setNewComment('')
    setShowReviewForm(false)
    toast.success('Reseña publicada. ¡Gracias!')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/medicos')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors"
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
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${doctor.initialsColor} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}
            >
              {doctor.initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-800">{doctor.name}</h1>
              <p className="text-slate-500 mt-0.5">{doctor.specialty}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <StarRating value={doctor.rating} size="lg" />
                <span className="font-bold text-slate-700">{doctor.rating.toFixed(1)}</span>
                <span className="text-sm text-slate-400">({doctor.reviewCount} reseñas)</span>
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
            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> Contacto
              </h2>
              <p className="text-sm text-slate-600">{doctor.phone}</p>
            </Card>

            {/* Addresses */}
            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Consultorios
              </h2>
              <div className="flex flex-col gap-2">
                {doctor.addresses.map((addr, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{addr}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Obras sociales */}
            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-3">Obras sociales</h2>
              <div className="flex flex-wrap gap-1.5">
                {doctor.obrasSociales.map((os) => (
                  <Badge key={os} variant="info">
                    {os}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Schedule */}
            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Horarios de atención
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Día
                      </th>
                      <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Horario
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {doctor.schedules.map((s) => (
                      <tr key={s.day}>
                        <td className="py-2.5 font-medium text-slate-700">{s.day}</td>
                        <td className="py-2.5 text-slate-500">{s.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" /> Reseñas ({reviews.length})
                </h2>
                {!showReviewForm && (
                  <Button size="sm" variant="outline" onClick={() => setShowReviewForm(true)}>
                    Dejar reseña
                  </Button>
                )}
              </div>

              {/* Review form */}
              {showReviewForm && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Tu reseña</h3>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1.5">Calificación</p>
                    <InteractiveStars value={newRating} onChange={setNewRating} />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1.5">Comentario</p>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Contá tu experiencia con este médico..."
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
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
                    <Button size="sm" onClick={submitReview}>
                      <Send className="w-3.5 h-3.5" /> Publicar reseña
                    </Button>
                  </div>
                </div>
              )}

              {/* Review list */}
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {review.author.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{review.author}</span>
                      </div>
                      <span className="text-xs text-slate-400">{review.date}</span>
                    </div>
                    <div className="ml-9">
                      <StarRating value={review.rating} />
                      <p className="text-sm text-slate-600 mt-1">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
