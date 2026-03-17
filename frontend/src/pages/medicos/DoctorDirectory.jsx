import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, MapPin, ChevronRight } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Martín Suárez',
    specialty: 'Oftalmología',
    rating: 4.9,
    reviewCount: 87,
    obrasSociales: ['OSDE', 'Swiss Medical', 'Galeno'],
    neighborhood: 'Palermo, CABA',
    initials: 'MS',
    initialsColor: 'from-blue-500 to-primary',
  },
  {
    id: '2',
    name: 'Dra. Carolina Méndez',
    specialty: 'Oftalmología pediátrica',
    rating: 4.8,
    reviewCount: 64,
    obrasSociales: ['OSDE', 'Medicus'],
    neighborhood: 'Recoleta, CABA',
    initials: 'CM',
    initialsColor: 'from-purple-500 to-violet-600',
  },
  {
    id: '3',
    name: 'Dr. Ariel Fontana',
    specialty: 'Oftalmología',
    rating: 4.7,
    reviewCount: 103,
    obrasSociales: ['PAMI', 'IOMA', 'Galeno'],
    neighborhood: 'Caballito, CABA',
    initials: 'AF',
    initialsColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: '4',
    name: 'Dra. Valentina Rossi',
    specialty: 'Oftalmología pediátrica',
    rating: 5.0,
    reviewCount: 42,
    obrasSociales: ['Swiss Medical', 'OSDE'],
    neighborhood: 'Belgrano, CABA',
    initials: 'VR',
    initialsColor: 'from-rose-500 to-pink-600',
  },
  {
    id: '5',
    name: 'Dr. Federico Lara',
    specialty: 'Retinología',
    rating: 4.6,
    reviewCount: 58,
    obrasSociales: ['IOMA', 'Medicus', 'OSDE'],
    neighborhood: 'Villa Urquiza, CABA',
    initials: 'FL',
    initialsColor: 'from-amber-500 to-orange-600',
  },
  {
    id: '6',
    name: 'Dra. Sofía Giménez',
    specialty: 'Oftalmología',
    rating: 4.8,
    reviewCount: 79,
    obrasSociales: ['PAMI', 'Swiss Medical'],
    neighborhood: 'San Telmo, CABA',
    initials: 'SG',
    initialsColor: 'from-cyan-500 to-sky-600',
  },
]

const SPECIALTIES = [
  'Todas las especialidades',
  'Oftalmología',
  'Oftalmología pediátrica',
  'Retinología',
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
              : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function DoctorDirectory() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('Todas las especialidades')

  const filtered = DOCTORS.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.neighborhood.toLowerCase().includes(search.toLowerCase())
    const matchesSpecialty =
      specialty === 'Todas las especialidades' || d.specialty === specialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="min-h-screen bg-slate-50">
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
              placeholder="Buscar por nombre o barrio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
            />
          </div>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="sm:w-64 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-slate-500 mb-4">
          {filtered.length} médico{filtered.length !== 1 ? 's' : ''} encontrado
          {filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Doctor grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doctor) => (
            <Card key={doctor.id} className="p-5 flex flex-col">
              {/* Avatar + name */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${doctor.initialsColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {doctor.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{doctor.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{doctor.specialty}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating value={doctor.rating} />
                <span className="text-xs font-bold text-slate-700">{doctor.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({doctor.reviewCount} reseñas)</span>
              </div>

              {/* Obras sociales */}
              <div className="flex flex-wrap gap-1 mb-3">
                {doctor.obrasSociales.map((os) => (
                  <Badge key={os} variant="neutral">
                    {os}
                  </Badge>
                ))}
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {doctor.neighborhood}
              </div>

              <div className="mt-auto">
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => navigate(`/medicos/${doctor.id}`)}
                >
                  Ver perfil <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="p-10 text-center">
            <p className="text-slate-400 text-sm">
              No se encontraron médicos con ese criterio de búsqueda.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
