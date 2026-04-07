import { useNavigate } from 'react-router-dom'
import { Glasses, Wrench, Eye, Droplets, HelpCircle, ChevronRight } from 'lucide-react'
import Card from '../../components/ui/Card'

const SERVICE_TYPES = [
  {
    id: 'lentes_receta',
    label: 'Lentes con receta',
    desc: 'Subí tu receta y recibí presupuestos de ópticas cercanas',
    icon: Glasses,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'reparacion',
    label: 'Reparaciones / arreglos',
    desc: 'Arreglo de armazón, cambio de tornillos, soldaduras, ajustes',
    icon: Wrench,
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'lentes_contacto',
    label: 'Lentes de contacto',
    desc: 'Pedí cotización para lentes de contacto blandas o rígidas',
    icon: Eye,
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'liquidos_accesorios',
    label: 'Líquidos y accesorios',
    desc: 'Soluciones de limpieza, estuches, paños y accesorios ópticos',
    icon: Droplets,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    id: 'otro',
    label: 'Otro servicio óptico',
    desc: 'Cualquier otra consulta o servicio que necesites',
    icon: HelpCircle,
    color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
  },
]

export default function NuevaSolicitud() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Nueva solicitud</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Seleccioná el tipo de servicio que necesitás.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {SERVICE_TYPES.map((service) => {
          const Icon = service.icon
          return (
            <Card
              key={service.id}
              className="p-5 cursor-pointer hover:shadow-md transition-all duration-150 hover:border-primary/30 dark:hover:border-primary/30"
              onClick={() => {
                if (service.id === 'lentes_receta') {
                  navigate('/cliente/receta/nueva')
                } else {
                  navigate(`/cliente/solicitud/${service.id}`)
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${service.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{service.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{service.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
