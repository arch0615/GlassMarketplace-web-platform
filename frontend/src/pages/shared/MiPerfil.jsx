import { useState, useEffect } from 'react'
import { User, Phone, Mail, Save, Loader2, Hash, FileText, Store, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const INVOICE_CONDITIONS = [
  { value: '', label: 'Seleccioná una opción' },
  { value: 'consumidor_final', label: 'Consumidor final' },
  { value: 'monotributista', label: 'Monotributista' },
  { value: 'responsable_inscripto', label: 'Responsable inscripto' },
  { value: 'exento', label: 'IVA exento' },
]

export default function MiPerfil() {
  const { user, updateUser } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [cuit, setCuit] = useState(user?.cuit || '')
  const [razonSocial, setRazonSocial] = useState(user?.razonSocial || '')
  const [invoiceCondition, setInvoiceCondition] = useState(user?.invoiceCondition || '')
  const [saving, setSaving] = useState(false)

  // Óptica-specific fields (Optica entity, separate from User)
  const isOptica = user?.role === 'optica'
  const [optica, setOptica] = useState(null)
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')

  useEffect(() => {
    if (!isOptica) return
    api('/opticas/me')
      .then((o) => {
        setOptica(o)
        setBusinessName(o?.businessName || '')
        setAddress(o?.address || '')
        setBusinessPhone(o?.phone || '')
      })
      .catch(() => {})
  }, [isOptica])

  const needsBilling = user?.role === 'cliente' || user?.role === 'optica'
  const billingComplete = Boolean(user?.cuit && user?.invoiceCondition)
  const opticaProfileComplete = !isOptica || (optica?.address && optica?.phone)

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('El nombre no puede estar vacío.')
      return
    }

    const cleanCuit = cuit.replace(/[-\s]/g, '')
    if (needsBilling) {
      if (!cleanCuit || !/^\d{11}$/.test(cleanCuit)) {
        toast.error('Ingresá un CUIT/CUIL válido (11 dígitos).')
        return
      }
      if (!invoiceCondition) {
        toast.error('Seleccioná tu condición frente a IVA.')
        return
      }
    }

    if (isOptica) {
      if (!businessName.trim()) {
        toast.error('Ingresá el nombre comercial de la óptica.')
        return
      }
      if (!address.trim()) {
        toast.error('Ingresá la dirección exacta de la óptica.')
        return
      }
      if (!businessPhone.trim()) {
        toast.error('Ingresá un teléfono de contacto para la óptica.')
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
      }
      if (needsBilling) {
        payload.cuit = cleanCuit
        payload.razonSocial = razonSocial.trim() || undefined
        payload.invoiceCondition = invoiceCondition
      }
      const updated = await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      // Also update Optica row for óptica users
      if (isOptica && optica?.id) {
        await api(`/opticas/${optica.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            businessName: businessName.trim(),
            address: address.trim(),
            phone: businessPhone.trim(),
          }),
        })
        setOptica({ ...optica, businessName: businessName.trim(), address: address.trim(), phone: businessPhone.trim() })
      }

      updateUser({
        ...user,
        fullName: updated.fullName,
        phone: updated.phone,
        cuit: updated.cuit,
        razonSocial: updated.razonSocial,
        invoiceCondition: updated.invoiceCondition,
      })
      toast.success('Perfil actualizado.')
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mi perfil</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Actualizá tu información personal y de facturación.</p>
      </div>

      {needsBilling && !billingComplete && (
        <div className="mb-4 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Datos de facturación incompletos</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            Necesitamos tu CUIT y condición frente a IVA para poder emitir facturas. Sin estos datos no vas a poder confirmar pedidos.
          </p>
        </div>
      )}

      {isOptica && !opticaProfileComplete && (
        <div className="mb-4 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Completá los datos de contacto de la óptica</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            Sin dirección exacta y teléfono, los clientes no van a saber dónde retirar sus pedidos.
          </p>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col gap-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Full name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Nombre completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: +54 11 1234-5678"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {isOptica && (
            <>
              <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Datos de la óptica</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Los clientes usan estos datos para retirar el pedido en tu sucursal.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" /> Nombre comercial
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Óptica Visión Clara"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Dirección exacta
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Corrientes 1234, CABA"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Teléfono de la óptica
                </label>
                <input
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="Ej: +54 11 4000-0000"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </>
          )}

          {needsBilling && (
            <>
              <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Datos de facturación</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Usamos estos datos para emitir la factura electrónica de tus pedidos.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> CUIT / CUIL
                </label>
                <input
                  type="text"
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                  placeholder="20123456789 (11 dígitos)"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {user?.role === 'optica' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Razón social
                  </label>
                  <input
                    type="text"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    placeholder="Óptica Visión Clara S.A."
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Condición frente a IVA
                </label>
                <select
                  value={invoiceCondition}
                  onChange={(e) => setInvoiceCondition(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {INVOICE_CONDITIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <Button className="w-full mt-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
