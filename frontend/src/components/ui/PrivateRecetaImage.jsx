import { useState } from 'react'

/**
 * Renders a prescription image with the top ~22% masked to hide the patient's
 * name and surname. Toggling the lock briefly reveals the full image (e.g. so
 * the óptica can verify the patient's full name at delivery time).
 */
export default function PrivateRecetaImage({ src, alt = 'Receta', className = '', heightClass = 'h-48' }) {
  const [unmasked, setUnmasked] = useState(false)

  if (!src) return null

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 group ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      {!unmasked && (
        <div
          className="absolute top-0 left-0 w-full backdrop-blur-md bg-slate-900/40 flex items-center justify-center"
          style={{ height: '22%' }}
        >
          <span className="text-[10px] uppercase tracking-wider font-semibold text-white/90">
            🔒 Datos del paciente ocultos
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUnmasked((v) => !v) }}
        className="absolute bottom-2 right-2 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 shadow hover:bg-white dark:hover:bg-slate-800 transition-colors"
        title={unmasked ? 'Ocultar datos' : 'Mostrar datos del paciente'}
      >
        {unmasked ? 'Ocultar' : 'Ver completo'}
      </button>
    </div>
  )
}
