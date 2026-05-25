import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  Loader2,
  Star,
  Clock,
  CheckCircle2,
  Eye,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ClaimAccountModal from '../../components/public/ClaimAccountModal'

/**
 * Public, no-auth viewer for an anonymous quote request. The claim token
 * in the URL is the access credential. Lets the guest see all quotes
 * received and prompts them to claim the request (create an account)
 * when they want to accept one and pay.
 */
export default function PresupuestoPublico() {
  const { token } = useParams()
  const [searchParams] = useSearchParams()
  const justCreated = searchParams.get('just_created') === '1'
  const navigate = useNavigate()

  const [request, setRequest] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showClaim, setShowClaim] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [reqRes, quotesRes] = await Promise.all([
          fetch(`/api/requests/by-token/${token}`),
          fetch(`/api/quotes/by-request-token/${token}`),
        ])
        if (!reqRes.ok) {
          const data = await reqRes.json().catch(() => ({}))
          throw new Error(data.message || 'No se pudo cargar la solicitud')
        }
        const reqData = await reqRes.json()
        const quotesData = quotesRes.ok ? await quotesRes.json() : []
        if (!cancelled) {
          setRequest(reqData)
          setQuotes(quotesData)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error desconocido')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    // Poll every 30s so new quotes show up automatically while the page is open.
    const id = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(id) }
  }, [token])

  const handleAcceptClick = () => {
    if (!request) return
    setShowClaim(true)
  }

  const handleAccountCreated = () => {
    // Now logged in. Redirect to the authenticated Presupuesto page where
    // the existing accept-and-pay flow handles the rest.
    setShowClaim(false)
    toast.success('Cuenta creada — continuamos al pago.')
    navigate(`/cliente/presupuestos/${request.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-amber-500 mb-3" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">No pudimos cargar tu solicitud</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">{error}</p>
        <Link to="/" className="mt-6 text-sm font-semibold text-primary hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
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

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {justCreated && (
          <Card className="p-4 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">¡Solicitud enviada!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  Las ópticas cercanas ya están recibiendo tu pedido. Te avisaremos por email cuando carguen los primeros presupuestos.
                  <strong className="block mt-1">⚠ Revisá tu carpeta de Spam o Correo No Deseado.</strong>
                </p>
              </div>
            </div>
          </Card>
        )}

        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Tu solicitud</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hola <strong>{request.guestName || request.client?.fullName || ''}</strong> — guardamos esta página con el link que te enviamos por email. Volvé cuando quieras a ver los presupuestos.
          </p>
        </div>

        {/* Quotes list */}
        {quotes.length === 0 ? (
          <Card className="p-10 text-center">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold">Esperando presupuestos</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Las ópticas tienen hasta 48 horas para responder. Te avisamos por email apenas haya novedades.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quotes.map((q, idx) => {
              const price = Number(q.totalPrice) || 0
              const isPending = q.status === 'pending'
              return (
                <Card key={q.id} className="flex flex-col overflow-hidden">
                  <div className={`h-1.5 ${idx === 0 ? 'bg-gradient-to-r from-blue-600 to-sky-400' : 'bg-gradient-to-r from-slate-500 to-slate-400'}`} />
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Presupuesto {idx + 1}</p>
                      {idx === 0 && isPending && <Badge variant="success">Mejor precio</Badge>}
                      {q.status === 'rejected' && <Badge variant="neutral">Rechazado</Badge>}
                      {q.status === 'expired' && <Badge variant="neutral">Vencido</Badge>}
                    </div>

                    {(q.tierBasicPrice || q.tierRecommendedPrice || q.tierPremiumPrice) ? (
                      <div className="space-y-2">
                        {q.tierBasicPrice && (
                          <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-600">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Económica</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">${Number(q.tierBasicPrice).toLocaleString('es-AR')}</span>
                          </div>
                        )}
                        {q.tierRecommendedPrice && (
                          <div className="flex items-center justify-between p-2.5 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1"><Star className="w-3 h-3 fill-blue-500 text-blue-500" /> Recomendada</span>
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">${Number(q.tierRecommendedPrice).toLocaleString('es-AR')}</span>
                          </div>
                        )}
                        {q.tierPremiumPrice && (
                          <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Premium</span>
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">${Number(q.tierPremiumPrice).toLocaleString('es-AR')}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">${price.toLocaleString('es-AR')}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Total del pedido</p>
                      </div>
                    )}

                    {q.estimatedDays && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Tiempo estimado</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {q.estimatedDays} días
                        </span>
                      </div>
                    )}

                    {isPending && (
                      <Button variant="primary" size="md" className="w-full mt-auto" onClick={handleAcceptClick}>
                        Aceptar y pagar
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4">
          Si ya tenés cuenta, <Link to="/login" className="font-semibold text-primary hover:underline">iniciá sesión</Link> para asociar esta solicitud.
        </p>
      </div>

      {showClaim && (
        <ClaimAccountModal
          claimToken={token}
          guestName={request.guestName}
          guestEmail={request.guestEmail}
          onClose={() => setShowClaim(false)}
          onAccountCreated={handleAccountCreated}
        />
      )}
    </div>
  )
}
