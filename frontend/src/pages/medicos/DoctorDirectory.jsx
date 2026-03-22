import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, MapPin, ChevronRight, LogOut, Loader2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const GRADIENT_COLORS = [
  'from-blue-500 to-primary',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
]

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 dark:fill-slate-600 text-slate-200 dark:text-slate-600'
          }`}
        />
      ))}
    </div>
  )
}

export default function DoctorDirectory() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('Todas las especialidades')

  useEffect(() => {
    api('/medicos')
      .then(setDoctors)
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false))
  }, [])

  const specialties = ['Todas las especialidades', ...new Set(doctors.map((d) => d.specialty).filter(Boolean))]

  const filtered = doctors.filter((d) => {
    const matchesSearch =
      (d.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.specialty || '').toLowerCase().includes(search.toLowerCase())
    const matchesSpecialty =
      specialty === 'Todas las especialidades' || d.specialty === specialty
    return matchesSearch && matchesSpecialty
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top bar with logout */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-primary">Lensia</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Directorio de médicos</h1>
          <p className="text-blue-100 text-sm">
            Encontrá oftalmólogos y especialistas oculares cerca tuyo
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
            />
          </div>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="sm:w-64 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
          >
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {filtered.length} médico{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Doctor grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doctor, idx) => {
            const initials = (doctor.fullName || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
            const color = GRADIENT_COLORS[idx % GRADIENT_COLORS.length]
            const rating = Number(doctor.rating) || 0
            return (
              <Card key={doctor.id} className="p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{doctor.fullName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{doctor.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <StarRating value={rating} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">({doctor.ratingCount || 0} reseñas)</span>
                </div>

                {doctor.obrasSociales && doctor.obrasSociales.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doctor.obrasSociales.map((os) => (
                      <Badge key={os} variant="neutral">{os}</Badge>
                    ))}
                  </div>
                )}

                <div className="mt-auto">
                  <Button className="w-full" size="sm" onClick={() => navigate(`/medicos/${doctor.id}`)}>
                    Ver perfil <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <Card className="p-10 text-center">
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">No se encontraron médicos</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">Probá con otro nombre o especialidad.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
