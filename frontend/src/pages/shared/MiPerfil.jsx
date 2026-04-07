import { useState } from 'react'
import { User, Phone, Mail, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function MiPerfil() {
  const { user, updateUser } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('El nombre no puede estar vacío.')
      return
    }
    setSaving(true)
    try {
      const updated = await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() }),
      })
      updateUser({ ...user, fullName: updated.fullName, phone: updated.phone })
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
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Actualizá tu información personal.</p>
      </div>

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

          <Button className="w-full mt-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
