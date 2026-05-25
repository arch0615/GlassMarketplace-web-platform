import { useState, useEffect } from 'react'
import { Users, Store, Stethoscope, User, MapPin, Phone, Mail, Calendar, Loader2, Search, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
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
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadUsers = () => {
    setLoading(true)
    const url = activeTab ? `/admin/users?role=${activeTab}` : '/admin/users'
    api(url)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [activeTab])

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

                    {user.role !== 'admin' && (
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar usuario
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {deleteTarget && (
        <DeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null)
            loadUsers()
          }}
        />
      )}
    </div>
  )
}

function DeleteUserModal({ user, onClose, onDeleted }) {
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleting, setDeleting] = useState(false)

  const matchesEmail = confirmEmail.trim().toLowerCase() === user.email.toLowerCase()

  const handleDelete = async () => {
    if (!matchesEmail) return
    setDeleting(true)
    try {
      await api(`/admin/users/${user.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ confirmEmail: confirmEmail.trim() }),
      })
      toast.success(`Cuenta de ${user.email} eliminada.`)
      onDeleted()
    } catch (err) {
      toast.error(err.message || 'No se pudo eliminar el usuario.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Eliminar usuario</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm font-bold text-red-800 dark:text-red-300">Esta acción es irreversible.</p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1">
              La cuenta de <strong>{user.fullName}</strong> ({user.email}) será eliminada de la base de datos.
              Si el usuario tiene pedidos, solicitudes o disputas, la eliminación va a fallar — en ese caso suspendé la cuenta en su lugar.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Para confirmar, escribí el email del usuario:
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={user.email}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="md" className="flex-1" onClick={onClose} disabled={deleting}>
              Cancelar
            </Button>
            <button
              onClick={handleDelete}
              disabled={!matchesEmail || deleting}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                matchesEmail
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
            </button>
          </div>
        </div>
      </div>
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
