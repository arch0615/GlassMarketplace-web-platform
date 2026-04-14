import { useState, useEffect } from 'react'
import { Users, Store, Stethoscope, User, MapPin, Phone, Mail, Calendar, Loader2, Search, ChevronDown, ChevronUp } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const ROLE_TABS = [
  { key: '', label: 'Todos', icon: Users },
  { key: 'cliente', label: 'Clientes', icon: User },
  { key: 'optica', label: 'Opticas', icon: Store },
  { key: 'medico', label: 'Medicos', icon: Stethoscope },
]

const ROLE_LABELS = {
  cliente: { label: 'Cliente', variant: 'info' },
  optica: { label: 'Optica', variant: 'success' },
  medico: { label: 'Medico', variant: 'warning' },
  admin: { label: 'Admin', variant: 'danger' },
}

export default function Usuarios() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    setLoading(true)
    const url = activeTab ? `/admin/users?role=${activeTab}` : '/admin/users'
    api(url)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [activeTab])

  const filtered = users.filter((u) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      (u.fullName || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s) ||
      (u.phone || '').toLowerCase().includes(s) ||
      (u.businessName || '').toLowerCase().includes(s) ||
      (u.address || '').toLowerCase().includes(s)
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Usuarios</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Informacion de clientes, opticas y medicos registrados
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-full sm:w-fit">
        {ROLE_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === key
                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            aria-label={label}
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, email, telefono, direccion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">No se encontraron usuarios.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((user) => {
            const role = ROLE_LABELS[user.role] || { label: user.role, variant: 'neutral' }
            const isExpanded = expandedId === user.id
            return (
              <Card key={user.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : user.id)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      user.role === 'optica' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                      user.role === 'medico' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {user.role === 'optica' ? <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> :
                       user.role === 'medico' ? <Stethoscope className="w-5 h-5 text-amber-600 dark:text-amber-400" /> :
                       <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{user.fullName}</h3>
                        <Badge variant={role.variant}>{role.label}</Badge>
                        {user.isApproved === false && <Badge variant="warning">Sin aprobar</Badge>}
                        {user.isActive === false && <Badge variant="danger">Inactivo</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                        {user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString('es-AR')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      <InfoItem label="Email" value={user.email} />
                      <InfoItem label="Telefono" value={user.phone} />
                      <InfoItem label="Registrado" value={new Date(user.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })} />

                      {user.role === 'optica' && (
                        <>
                          <InfoItem label="Nombre comercial" value={user.businessName} />
                          <InfoItem label="CUIT" value={user.cuit} />
                          <InfoItem label="Direccion" value={user.address} />
                          <InfoItem label="Verificada" value={user.isVerified ? 'Si' : 'No'} />
                          <InfoItem label="Plan" value={user.subscriptionTier} />
                          <InfoItem label="Tasa de respuesta" value={user.responseRate != null ? `${Number(user.responseRate).toFixed(0)}%` : null} />
                        </>
                      )}

                      {user.role === 'medico' && (
                        <>
                          <InfoItem label="Especialidad" value={user.specialty} />
                          <InfoItem label="Matricula" value={user.licenseNumber} />
                          <InfoItem label="Obras sociales" value={user.obrasSociales?.join(', ')} />
                          <InfoItem label="Verificado" value={user.isVerified ? 'Si' : 'No'} />
                        </>
                      )}
                    </div>

                    {user.role === 'medico' && user.locations?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Ubicaciones</p>
                        <div className="flex flex-col gap-2">
                          {user.locations.map((loc, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              {loc.address}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {user.role === 'optica' && user.address && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Ubicacion</p>
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          {user.address}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">{label}</p>
      <p className="text-sm text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
    </div>
  )
}
