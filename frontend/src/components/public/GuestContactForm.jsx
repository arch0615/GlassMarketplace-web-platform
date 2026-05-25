import { User, Mail, Phone } from 'lucide-react'

/**
 * Trailing contact form for the anonymous request flow. Collects the
 * minimum we need to email the user back with their presupuesto link:
 * name, email, WhatsApp phone. Includes the mandatory spam-folder hint
 * directly below the email field per Seba's spec.
 */
export default function GuestContactForm({ value, onChange }) {
  const setField = (key) => (e) => onChange({ ...value, [key]: e.target.value })

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Datos de contacto</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Te avisamos por email y WhatsApp cuando las ópticas carguen presupuestos.
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <User className="w-3.5 h-3.5" /> Nombre completo
        </label>
        <input
          type="text"
          value={value.name || ''}
          onChange={setField('name')}
          placeholder="María González"
          className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500"
        />
      </div>

      {/* Email + spam hint */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Mail className="w-3.5 h-3.5" /> Email de contacto
        </label>
        <input
          type="email"
          value={value.email || ''}
          onChange={setField('email')}
          placeholder="tu@email.com"
          className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500"
        />
        <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
          ⚠ Revisá tu carpeta de Spam o Correo No Deseado por si no ves el mail.
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Phone className="w-3.5 h-3.5" /> Teléfono (WhatsApp)
        </label>
        <input
          type="tel"
          value={value.phone || ''}
          onChange={setField('phone')}
          placeholder="+54 11 4000-0000"
          className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500"
        />
      </div>
    </div>
  )
}

/** Returns null if valid, or a Spanish error message if invalid. */
export function validateGuestContact(value) {
  if (!value?.name || value.name.trim().length < 2) {
    return 'Ingresá tu nombre.'
  }
  if (!value?.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.email.trim())) {
    return 'Ingresá un email válido.'
  }
  if (!value?.phone || !/^[+0-9()\-\s]{6,30}$/.test(value.phone.trim())) {
    return 'Ingresá un teléfono válido (WhatsApp).'
  }
  return null
}
