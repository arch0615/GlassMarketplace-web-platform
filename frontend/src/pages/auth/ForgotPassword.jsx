import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, ArrowLeft, Mail, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import { useTheme } from '../../context/ThemeContext'

export default function ForgotPassword() {
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return toast.error('Ingresá tu email.')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error')
      setSent(true)
      toast.success('Revisá tu email para restablecer tu contraseña.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">Lensia</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Revisá tu email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link to="/login" className="text-sm text-primary hover:underline font-medium">
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Restablecer contraseña</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
