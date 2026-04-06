import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Mail, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const token = searchParams.get('token')

  const [status, setStatus] = useState(token ? 'verifying' : 'waiting') // verifying | success | error | waiting
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)

  const roleHome = {
    cliente: '/cliente/dashboard',
    optica: '/optica/dashboard',
    admin: '/admin/dashboard',
    medico: '/medicos',
  }

  useEffect(() => {
    if (!token) return

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.access_token) {
          setStatus('success')
          login(data.access_token, data.user)
          toast.success('Email verificado correctamente')
          setTimeout(() => {
            navigate(roleHome[data.user.role] || '/cliente/dashboard')
          }, 2000)
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!resendEmail) {
      toast.error('Ingresá tu email.')
      return
    }
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      })
      const data = await res.json()
      toast.success(data.message || 'Si el email existe, recibirás un nuevo enlace.')
    } catch {
      toast.error('Error al reenviar. Intentá de nuevo.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/70 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Lensia</h1>
            <p className="text-sky-100 text-sm mt-1 font-medium">Verificación de email</p>
          </div>

          <div className="px-8 py-8">
            {/* Verifying */}
            {status === 'verifying' && (
              <div className="text-center py-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-slate-700 dark:text-slate-200 font-semibold">Verificando tu email...</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Esto solo toma un momento.</p>
              </div>
            )}

            {/* Success */}
            {status === 'success' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-slate-800 dark:text-slate-100 font-bold text-lg">Email verificado</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Tu cuenta está activa. Redirigiendo a tu panel...</p>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-slate-800 dark:text-slate-100 font-bold text-lg">Token inválido o expirado</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-6">
                  El enlace de verificación no es válido. Podés solicitar uno nuevo.
                </p>

                <form onSubmit={handleResend} className="space-y-3">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                  <Button type="submit" variant="primary" className="w-full" disabled={resending}>
                    {resending ? 'Enviando...' : 'Reenviar email de verificación'}
                  </Button>
                </form>
              </div>
            )}

            {/* Waiting (no token — just landed here) */}
            {status === 'waiting' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-slate-800 dark:text-slate-100 font-bold text-lg">Revisá tu email</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-6">
                  Te enviamos un enlace de verificación a tu correo. Hacé clic en el enlace para activar tu cuenta.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">No encontrás el email?</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Revisá tu carpeta de spam o correo no deseado.</p>
                </div>

                <form onSubmit={handleResend} className="space-y-3">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                  <Button type="submit" variant="outline" className="w-full" disabled={resending}>
                    {resending ? 'Enviando...' : 'Reenviar email de verificación'}
                  </Button>
                </form>
              </div>
            )}

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
