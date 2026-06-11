import { useState, useEffect } from 'react'

/**
 * Renders a prescription image with the top portion masked to hide the
 * patient's name and surname. The mask is a solid opaque bar (not a
 * blur) because a blur is still partially readable for handwritten
 * recetas. Clicking the image opens it full-screen in a lightbox so the
 * óptica can zoom in to read the prescription values — the mask is
 * preserved in the lightbox too.
 *
 * The óptica can toggle the mask off if they actually need to see the
 * patient name (e.g. delivery time). The mask state stays in sync
 * between the inline preview and the lightbox.
 */
export default function PrivateRecetaImage({ src, alt = 'Receta', className = '', heightClass = 'h-48', maskTopPct = 28 }) {
  const [unmasked, setUnmasked] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  // ESC closes the lightbox.
  useEffect(() => {
    if (!zoomed) return
    const onKey = (e) => {
      if (e.key === 'Escape') setZoomed(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  if (!src) return null

  const Mask = ({ heightPct }) => (
    !unmasked ? (
      <div
        className="absolute top-0 left-0 w-full bg-slate-900 flex items-center justify-center pointer-events-none"
        style={{ height: `${heightPct}%` }}
      >
        <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-white/80">
          🔒 Datos del paciente ocultos
        </span>
      </div>
    ) : null
  )

  return (
    <>
      <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 group ${className}`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={() => setZoomed(true)}
        />
        <Mask heightPct={maskTopPct} />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUnmasked((v) => !v) }}
          className="absolute bottom-2 right-2 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title={unmasked ? 'Ocultar datos personales' : 'Mostrar datos del paciente'}
        >
          {unmasked ? 'Ocultar' : 'Ver completo'}
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setZoomed(true) }}
          className="absolute bottom-2 left-2 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title="Ampliar"
        >
          🔍 Ampliar
        </button>
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setZoomed(false) }}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-sm font-semibold shadow hover:bg-white"
          >
            Cerrar ✕
          </button>
          <div
            className="relative max-w-[95vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-[95vw] max-h-[90vh] rounded-lg shadow-2xl"
            />
            <Mask heightPct={maskTopPct} />
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUnmasked((v) => !v) }}
              className="absolute bottom-3 right-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/95 text-slate-700 shadow hover:bg-white"
            >
              {unmasked ? 'Ocultar' : 'Ver completo'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
