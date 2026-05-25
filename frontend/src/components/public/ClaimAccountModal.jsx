import { useState } from 'react'
import { X, Loader2, Lock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../ui/Button'

/**
 * Triggered when an anonymous guest clicks "Aceptar y pagar" on the
 * /presupuesto/:token page. Collects only a password (we already have the
 * guest's name/email/phone on the request), calls
 * POST /auth/register-from-request, saves the JWT, then invokes
 * `onAccountCreated()` so the parent can resume the payment flow.
 */
export default function ClaimAccountModal({ claimToken, guestName, guestEmail, onClose, onAccountCreated }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (password.length < 8) {
      toast.error('La contraseña tiene que tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register-from-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimToken, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo crear la cuenta')

      // Persist the JWT just like the normal login flow.
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('¡Cuenta creada! Continuando al pago...')
      onAccountCreated?.(data)
    } catch (err) {
      toast.error(err.message || 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Creá tu cuenta para pagar</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Vas a usar estos datos para tu cuenta:
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{guestName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{guestEmail}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Elegí una contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Confirmá la contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repetí la contraseña"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500"
            />
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Al crear tu cuenta aceptás los términos y condiciones y la política de privacidad de Lensia.
          </p>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="md" className="flex-1" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creando...' : 'Crear cuenta y pagar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
