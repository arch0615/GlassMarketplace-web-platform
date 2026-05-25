import { useState } from 'react'
import { FileText, Wrench } from 'lucide-react'
import NuevaReceta from './NuevaReceta'
import NuevaArreglo from './NuevaArreglo'

const TABS = [
  {
    id: 'receta',
    label: 'Lentes con receta',
    icon: FileText,
    desc: 'Cotizá lentes con receta médica',
  },
  {
    id: 'arreglo',
    label: 'Arreglos y otros',
    icon: Wrench,
    desc: 'Arreglos, contactología, líquidos',
  },
]

export default function NuevaSolicitud() {
  const [tab, setTab] = useState('receta')

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Tab selector */}
      <div className="mb-6">
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1.5 rounded-2xl">
          {TABS.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-150 ${
                tab === id
                  ? 'bg-white dark:bg-slate-800 shadow-sm'
                  : 'hover:bg-white/50 dark:hover:bg-slate-600/30'
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

      {/* Active tab content — both children manage their own state, so we
          unmount the inactive one to keep things clean. */}
      {tab === 'receta' ? <NuevaReceta embedded /> : <NuevaArreglo embedded />}
    </div>
  )
}
