import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Wrench, Eye } from 'lucide-react'
import NuevaRecetaPublica from './NuevaRecetaPublica'
import NuevaArregloPublica from './NuevaArregloPublica'

const TABS = [
  { id: 'receta', label: 'Lentes con receta', icon: FileText, desc: 'Cotizá lentes con receta médica' },
  { id: 'arreglo', label: 'Arreglos y otros', icon: Wrench, desc: 'Arreglos, contactología, líquidos' },
]

export default function NuevaSolicitudPublica() {
  const [tab, setTab] = useState('receta')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header bar */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">Lensia</span>
          </Link>
          <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Pedí tu presupuesto sin crear cuenta
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">
            Completá el formulario y te llegan presupuestos de ópticas cercanas por email y WhatsApp.
            Sólo creás tu cuenta cuando elegís un presupuesto y pagás.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1.5 rounded-2xl">
            {TABS.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-150 ${
                  tab === id ? 'bg-white dark:bg-slate-800 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-slate-600/30'
                }`}
                aria-pressed={tab === id}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${tab === id ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className={`text-sm font-semibold ${tab === id ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                    {label}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {tab === 'receta' ? <NuevaRecetaPublica /> : <NuevaArregloPublica />}
      </div>
    </div>
  )
}
