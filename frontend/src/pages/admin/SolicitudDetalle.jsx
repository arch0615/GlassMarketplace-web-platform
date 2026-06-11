import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  ImageIcon,
  Tag,
  DollarSign,
  Calendar,
  Loader2,
  User,
  MapPin,
  Store,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'
import { SERVICE_TYPE_LABELS } from '../../lib/serviceTypes'

const STATUS_MAP = {
  open: { label: 'Abierta', variant: 'warning' },
  quoted: { label: 'Cotizada', variant: 'info' },
  accepted: { label: 'Aceptada', variant: 'success' },
  expired: { label: 'Expirada', variant: 'neutral' },
  cancelled: { label: 'Cancelada', variant: 'neutral' },
}

const QUOTE_STATUS = {
  pending: { label: 'Pendiente', variant: 'warning' },
  accepted: { label: 'Aceptado', variant: 'success' },
  rejected: { label: 'Rechazado', variant: 'neutral' },
}

export default function AdminSolicitudDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [request, setRequest] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api(`/requests/${id}`),
      api(`/quotes/request/${id}`),
    ])
      .then(([req, q]) => {
        setRequest(req)
        setQuotes(q)
      })
      .catch(() => toast.error('No se pudo cargar la solicitud'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 dark:text-slate-400">Solicitud no encontrada.</p>
      </div>
    )
  }

  const st = STATUS_MAP[request.status] || { label: request.status, variant: 'neutral' }
  const prescriptionUrl = request.prescription?.imageUrl
  const styles = request.stylePreferences
    ? (Array.isArray(request.stylePreferences) ? request.stylePreferences : request.stylePreferences.split(','))
    : []

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/solicitudes')}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Solicitud #{id.slice(0, 8)}
        </h1>
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column: request info */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Client info — handles both registered and guest (anonymous) clients. */}
          {(() => {
            const isGuest = !request.client && (request.guestName || request.guestEmail || request.guestPhone)
            const name = request.client?.fullName || request.guestName || '—'
            const email = request.client?.email || request.guestEmail || '—'
            const phone = request.client?.phone || request.guestPhone || null
            const waLink = phone
              ? (() => {
                  // Normalize the phone to the international E.164 digits-only
                  // format that wa.me requires (no "+", no spaces).
                  // For Argentina we have to prepend "549": WhatsApp routes
                  // AR mobile traffic through +54 9 <area> <number>. The user
                  // can have stored their phone in any of these forms:
                  //   "+54 9 2302 54-2518" → 5492302542518  (OK)
                  //   "+54 2302 54-2518"   → 542302542518  → 5492302542518
                  //   "2302542518"         → 2302542518   → 5492302542518
                  //   "+1 555 ..."         → leave alone
                  let n = String(phone).replace(/[^\d+]/g, '')
                  const hadPlus = n.startsWith('+')
                  if (hadPlus) n = n.slice(1)
                  if (!hadPlus && !n.startsWith('54')) {
                    // No country prefix at all → assume AR mobile.
                    n = '549' + n
                  } else if (n.startsWith('54') && !n.startsWith('549')) {
                    // Has country code but missing the WhatsApp "9".
                    n = '549' + n.slice(2)
                  }
                  const msg = encodeURIComponent(
                    `Hola${request.guestName || request.client?.fullName ? ' ' + (request.guestName || request.client?.fullName) : ''}, te escribo de Lensia por tu solicitud #${request.id.slice(0, 8)}.`,
                  )
                  return `https://wa.me/${n}?text=${msg}`
                })()
              : null
            return (
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" /> Cliente
                  </span>
                  {isGuest && <Badge variant="warning">Invitado (sin cuenta)</Badge>}
                </h2>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Nombre</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Email</span>
                    {email !== '—' ? (
                      <a href={`mailto:${email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{email}</a>
                    ) : (
                      <span className="text-sm text-slate-700 dark:text-slate-200">—</span>
                    )}
                  </div>
                  {phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Teléfono</span>
                      <a href={`tel:${phone}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{phone}</a>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Fecha</span>
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {new Date(request.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                    >
                      <span>💬</span> Chatear por WhatsApp
                    </a>
                  )}
                </div>
              </Card>
            )
          })()}

          {/* Receta (lentes_receta) or Descripción + foto (arreglos/contacto/líquidos/otro) */}
          {request.serviceType === 'lentes_receta' ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" /> Receta
              </h2>
              {prescriptionUrl ? (
                <a href={prescriptionUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={prescriptionUrl}
                    alt="Receta"
                    className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-600 hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </a>
              ) : (
                <div className="w-full h-40 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">Sin receta adjunta</span>
                </div>
              )}
              {request.prescription?.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{request.prescription.notes}</p>
              )}
            </Card>
          ) : (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" /> Descripción del cliente
              </h2>
              {request.description ? (
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  {request.description}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  El cliente no agregó una descripción.
                </p>
              )}
              {request.photoUrl && (
                <a
                  href={request.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3"
                >
                  <img
                    src={request.photoUrl}
                    alt="Foto adjunta por el cliente"
                    className="w-full max-h-64 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:opacity-90 transition-opacity"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">Tocá para ampliar.</p>
                </a>
              )}
            </Card>
          )}

          {/* Preferences */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" /> Detalle
            </h2>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Tipo de servicio</span>
                <Badge variant="info">{SERVICE_TYPE_LABELS[request.serviceType] || 'Lentes con receta'}</Badge>
              </div>
              {request.lensType && request.serviceType === 'lentes_receta' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tipo de lente</span>
                  <Badge variant={request.lensType === 'no_se' ? 'warning' : 'info'}>
                    {request.lensType === 'no_se' ? 'Necesita asesoramiento' : request.lensType}
                  </Badge>
                </div>
              )}
              {request.priceRangeMin && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Rango de precio</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    ${Number(request.priceRangeMin).toLocaleString('es-AR')} – ${Number(request.priceRangeMax).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
              {styles.length > 0 && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Estilos</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {styles.map((tag) => (
                      <Badge key={tag.trim()} variant="purple">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {request.observations && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Observaciones</span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1 whitespace-pre-line">{request.observations}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right column: quotes */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Presupuestos recibidos ({quotes.length})
          </h2>

          {quotes.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-slate-400 dark:text-slate-500 text-sm">Ninguna óptica ha enviado presupuesto aún.</p>
            </Card>
          ) : (
            quotes.map((quote) => {
              const qs = QUOTE_STATUS[quote.status] || { label: quote.status, variant: 'neutral' }
              return (
                <Card key={quote.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {quote.optica?.businessName || '—'}
                      </span>
                    </div>
                    <Badge variant={qs.variant}>{qs.label}</Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> Precio total
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        ${Number(quote.totalPrice || 0).toLocaleString('es-AR')}
                      </span>
                    </div>

                    {quote.lensDescription && (
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lentes</span>
                        <span className="text-xs text-slate-700 dark:text-slate-200 text-right">{quote.lensDescription}</span>
                      </div>
                    )}

                    {quote.estimatedDays && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Entrega estimada
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{quote.estimatedDays} días</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Enviado</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(quote.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
