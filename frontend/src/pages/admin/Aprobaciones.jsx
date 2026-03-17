import { useState } from 'react'
import toast from 'react-hot-toast'
import { Store, Stethoscope, FileText, CheckCircle, XCircle, Calendar, Hash } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const OPTICAS = [
  {
    id: 'o1',
    name: 'Óptica San Telmo',
    registeredAt: '10 mar 2026',
    cuit: '30-71234567-9',
    address: 'Defensa 743, CABA',
    status: 'pendiente',
  },
  {
    id: 'o2',
    name: 'Centro Óptico Floresta',
    registeredAt: '11 mar 2026',
    cuit: '30-68901234-1',
    address: 'Av. Rivadavia 7820, CABA',
    status: 'pendiente',
  },
  {
    id: 'o3',
    name: 'Visión Palermo',
    registeredAt: '12 mar 2026',
    cuit: '30-75439821-5',
    address: 'Thames 1504, CABA',
    status: 'pendiente',
  },
]

const MEDICOS = [
  {
    id: 'm1',
    name: 'Dr. Ariel Fontana',
    registeredAt: '9 mar 2026',
    license: 'MN 87432',
    specialty: 'Oftalmología',
    status: 'pendiente',
  },
  {
    id: 'm2',
    name: 'Dra. Valentina Rossi',
    registeredAt: '12 mar 2026',
    license: 'MN 91205',
    specialty: 'Oftalmología pediátrica',
    status: 'pendiente',
  },
]

const TABS = [
  { key: 'opticas', label: 'Ópticas', icon: Store },
  { key: 'medicos', label: 'Médicos', icon: Stethoscope },
]

export default function Aprobaciones() {
  const [activeTab, setActiveTab] = useState('opticas')
  const [opticas, setOpticas] = useState(OPTICAS)
  const [medicos, setMedicos] = useState(MEDICOS)

  const pendingOpticas = opticas.filter((o) => o.status === 'pendiente')
  const pendingMedicos = medicos.filter((m) => m.status === 'pendiente')

  const approveOptica = (id) => {
    setOpticas((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'aprobada' } : o)))
    toast.success('Óptica aprobada correctamente.')
  }
  const rejectOptica = (id) => {
    setOpticas((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'rechazada' } : o)))
    toast.error('Óptica rechazada.')
  }
  const approveMedico = (id) => {
    setMedicos((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'aprobado' } : m)))
    toast.success('Médico aprobado correctamente.')
  }
  const rejectMedico = (id) => {
    setMedicos((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'rechazado' } : m)))
    toast.error('Médico rechazado.')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Aprobaciones</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Revisá y aprobá los registros pendientes de verificación
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = key === 'opticas' ? pendingOpticas.length : pendingMedicos.length
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                    activeTab === key ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
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
          {opticas.map((optica) => (
            <Card key={optica.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800">{optica.name}</h3>
                      {optica.status === 'pendiente' && <Badge variant="warning">Pendiente</Badge>}
                      {optica.status === 'aprobada' && <Badge variant="success">Aprobada</Badge>}
                      {optica.status === 'rechazada' && <Badge variant="danger">Rechazada</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> CUIT: {optica.cuit}
                      </span>
                      <span className="text-xs text-slate-500">{optica.address}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Registrada el {optica.registeredAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast('Función de documentos próximamente.', { icon: '📄' })}
                  >
                    <FileText className="w-3.5 h-3.5" /> Ver documentos
                  </Button>
                  {optica.status === 'pendiente' && (
                    <>
                      <Button size="sm" variant="danger" onClick={() => rejectOptica(optica.id)}>
                        <XCircle className="w-3.5 h-3.5" /> Rechazar
                      </Button>
                      <Button size="sm" onClick={() => approveOptica(optica.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {pendingOpticas.length === 0 && (
            <Card className="p-10 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No hay ópticas pendientes de aprobación.</p>
            </Card>
          )}
        </div>
      )}

      {/* Médicos tab */}
      {activeTab === 'medicos' && (
        <div className="flex flex-col gap-4">
          {medicos.map((medico) => (
            <Card key={medico.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800">{medico.name}</h3>
                      {medico.status === 'pendiente' && <Badge variant="warning">Pendiente</Badge>}
                      {medico.status === 'aprobado' && <Badge variant="success">Aprobado</Badge>}
                      {medico.status === 'rechazado' && <Badge variant="danger">Rechazado</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> Matrícula: {medico.license}
                      </span>
                      <span className="text-xs text-slate-500">{medico.specialty}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Registrado el {medico.registeredAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast('Función de documentos próximamente.', { icon: '📄' })}
                  >
                    <FileText className="w-3.5 h-3.5" /> Ver documentos
                  </Button>
                  {medico.status === 'pendiente' && (
                    <>
                      <Button size="sm" variant="danger" onClick={() => rejectMedico(medico.id)}>
                        <XCircle className="w-3.5 h-3.5" /> Rechazar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveMedico(medico.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {pendingMedicos.length === 0 && (
            <Card className="p-10 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No hay médicos pendientes de aprobación.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
