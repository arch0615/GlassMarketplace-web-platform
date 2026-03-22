import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { MapPin, Clock, Percent, Save, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

function NumberInput({ label, value, onChange, min, max, unit }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
        {label} {unit && <span className="font-normal text-slate-400 dark:text-slate-500">({unit})</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
      />
    </div>
  )
}

export default function Configuracion() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api('/settings')
      .then((data) => {
        const map = {}
        ;(Array.isArray(data) ? data : []).forEach((s) => { map[s.key] = s.value })
        setSettings(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const get = (key, fallback = '') => settings[key] || fallback
  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(settings)) {
        await api('/settings', {
          method: 'PATCH',
          body: JSON.stringify({ key, value: String(value) }),
        })
      }
      toast.success('Configuración guardada correctamente.')
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Configuración de plataforma</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Ajustá los parámetros operativos de Lensia
        </p>
      </div>

      {/* Distribution */}
      <Card className="p-6">
        <SectionTitle
          icon={MapPin}
          title="Distribución de solicitudes"
          description="Radios de alcance para enviar solicitudes a ópticas cercanas"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NumberInput label="Radio interno" value={get('inner_radius_km', '5')} onChange={(v) => set('inner_radius_km', v)} min={1} unit="km" />
          <NumberInput label="Radio externo" value={get('outer_radius_km', '10')} onChange={(v) => set('outer_radius_km', v)} min={1} unit="km" />
          <NumberInput label="Radio extendido" value={get('extended_radius_km', '25')} onChange={(v) => set('extended_radius_km', v)} min={1} unit="km" />
          <NumberInput label="Mín. ópticas" value={get('smart_select_min', '3')} onChange={(v) => set('smart_select_min', v)} min={1} />
          <NumberInput label="Máx. ópticas" value={get('smart_select_max', '5')} onChange={(v) => set('smart_select_max', v)} min={1} />
          <NumberInput label="Quote cap" value={get('quote_cap', '3')} onChange={(v) => set('quote_cap', v)} min={1} />
        </div>
      </Card>

      {/* Times */}
      <Card className="p-6">
        <SectionTitle
          icon={Clock}
          title="Tiempos y ventanas"
          description="Plazos de expiración y confirmación de operaciones"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NumberInput label="Expiración presupuesto" value={get('quote_expiry_hours', '48')} onChange={(v) => set('quote_expiry_hours', v)} min={1} unit="horas" />
          <NumberInput label="Ventana verificación" value={get('verification_window_hours', '48')} onChange={(v) => set('verification_window_hours', v)} min={1} unit="horas" />
          <NumberInput label="Ventana disputa" value={get('dispute_window_days', '7')} onChange={(v) => set('dispute_window_days', v)} min={1} unit="días" />
          <NumberInput label="Duración descuento referido" value={get('referral_discount_days', '30')} onChange={(v) => set('referral_discount_days', v)} min={1} unit="días" />
        </div>
      </Card>

      {/* Commissions */}
      <Card className="p-6">
        <SectionTitle
          icon={Percent}
          title="Comisiones"
          description="Tasas de facturación de la plataforma"
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="Comisión estándar" value={get('commission_rate_pct', '0')} onChange={(v) => set('commission_rate_pct', v)} min={0} max={100} unit="%" />
          <NumberInput label="Descuento por referido" value={get('referral_discount_pct', '5')} onChange={(v) => set('referral_discount_pct', v)} min={0} max={100} unit="%" />
        </div>
      </Card>

      {/* Save */}
      <Button size="lg" onClick={handleSave} className="self-start" disabled={saving}>
        <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
  )
}
