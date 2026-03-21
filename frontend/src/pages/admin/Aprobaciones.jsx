import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Store, Stethoscope, FileText, CheckCircle, XCircle, Calendar, Loader2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

const TABS = [
  { key: 'opticas', label: 'Ópticas', icon: Store },
  { key: 'medicos', label: 'Médicos', icon: Stethoscope },
]

export default function Aprobaciones() {
  const [activeTab, setActiveTab] = useState('opticas')
  const [opticas, setOpticas] = useState([])
  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/admin/approvals')
      .then((data) => {
        setOpticas(data.opticas || [])
        setMedicos(data.medicos || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const approveUser = async (id) => {
    try {
      await api(`/admin/users/${id}/approve`, { method: 'PATCH' })
      setOpticas((prev) => prev.filter((o) => o.id !== id))
      setMedicos((prev) => prev.filter((m) => m.id !== id))
      toast.success('Aprobado correctamente.')
    } catch (err) {
      toast.error(err.message || 'Error al aprobar')
    }
  }

  const rejectUser = async (id) => {
    try {
      await api(`/admin/users/${id}/reject`, { method: 'PATCH' })
      setOpticas((prev) => prev.filter((o) => o.id !== id))
      setMedicos((prev) => prev.filter((m) => m.id !== id))
      toast.error('Rechazado.')
    } catch (err) {
      toast.error(err.message || 'Error al rechazar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Aprobaciones</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Revisá y aprobá los registros pendientes de verificación
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = key === 'opticas' ? opticas.length : medicos.length
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  activeTab === key ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Ópticas tab */}
      {activeTab === 'opticas' && (
        <div className="flex flex-col gap-4">
          {opticas.length === 0 ? (
            <Card className="p-10 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No hay ópticas pendientes de aprobación.</p>
            </Card>
          ) : (
            opticas.map((user) => (
              <Card key={user.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Store className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{user.fullName}</h3>
                        <Badge variant="warning">Pendiente</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        <span className="text-xs text-slate-500">{user.email}</span>
                        {user.phone && <span className="text-xs text-slate-500">{user.phone}</span>}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="danger" onClick={() => rejectUser(user.id)}>
                      <XCircle className="w-3.5 h-3.5" /> Rechazar
                    </Button>
                    <Button size="sm" variant="success" onClick={() => approveUser(user.id)}>
                      <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Médicos tab */}
      {activeTab === 'medicos' && (
        <div className="flex flex-col gap-4">
          {medicos.length === 0 ? (
            <Card className="p-10 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No hay médicos pendientes de aprobación.</p>
            </Card>
          ) : (
            medicos.map((user) => (
              <Card key={user.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{user.fullName}</h3>
                        <Badge variant="warning">Pendiente</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        <span className="text-xs text-slate-500">{user.email}</span>
                        {user.phone && <span className="text-xs text-slate-500">{user.phone}</span>}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="danger" onClick={() => rejectUser(user.id)}>
                      <XCircle className="w-3.5 h-3.5" /> Rechazar
                    </Button>
                    <Button size="sm" variant="success" onClick={() => approveUser(user.id)}>
                      <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
