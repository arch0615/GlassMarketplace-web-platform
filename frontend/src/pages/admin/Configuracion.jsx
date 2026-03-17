import { useState } from 'react'
import toast from 'react-hot-toast'
import { MapPin, Clock, Percent, Tag, Plus, Trash2, AlertTriangle, Save } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const INITIAL_PRICE_TIERS = [
  { id: 't1', label: 'Económico', min: 0, max: 5000 },
  { id: 't2', label: 'Medio', min: 5001, max: 15000 },
  { id: 't3', label: 'Premium', min: 15001, max: 40000 },
  { id: 't4', label: 'Lujo', min: 40001, max: 100000 },
]

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

function NumberInput({ label, value, onChange, min, max, unit }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {unit && <span className="font-normal text-slate-400">({unit})</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

export default function Configuracion() {
  // Distribution
  const [innerRadius, setInnerRadius] = useState(2)
  const [outerRadius, setOuterRadius] = useState(5)
  const [extendedRadius, setExtendedRadius] = useState(10)
  const [minOpticas, setMinOpticas] = useState(3)
  const [maxOpticas, setMaxOpticas] = useState(8)

  // Times
  const [quoteExpiry, setQuoteExpiry] = useState(48)
  const [verificationWindow, setVerificationWindow] = useState(48)
  const [referralDuration, setReferralDuration] = useState(30)

  // Commissions
  const [commissionRate, setCommissionRate] = useState(8)
  const [referralDiscount, setReferralDiscount] = useState(5)
  const [commissionFreeEnd, setCommissionFreeEnd] = useState('2026-06-30')
  const [launchPeriodActive, setLaunchPeriodActive] = useState(true)

  // Price tiers
  const [priceTiers, setPriceTiers] = useState(INITIAL_PRICE_TIERS)

  const addTier = () => {
    setPriceTiers((prev) => [
      ...prev,
      { id: `t${Date.now()}`, label: '', min: 0, max: 0 },
    ])
  }

  const removeTier = (id) => {
    setPriceTiers((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTier = (id, field, value) => {
    setPriceTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    )
  }

  const handleSave = () => {
    toast.success('Configuración guardada correctamente.')
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configuración de plataforma</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Ajustá los parámetros operativos de Lensia
        </p>
      </div>

      {/* Launch period warning */}
      {launchPeriodActive && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Período de lanzamiento activo</p>
            <p className="text-xs text-amber-700 mt-0.5">
              La comisión está en 0% hasta el{' '}
              <strong>{commissionFreeEnd}</strong>. Las ópticas no serán cobradas durante este período.
            </p>
          </div>
        </div>
      )}

      {/* Distribution */}
      <Card className="p-6">
        <SectionTitle
          icon={MapPin}
          title="Distribución de solicitudes"
          description="Radios de alcance para enviar solicitudes a ópticas cercanas"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NumberInput label="Radio interno" value={innerRadius} onChange={setInnerRadius} min={1} unit="km" />
          <NumberInput label="Radio externo" value={outerRadius} onChange={setOuterRadius} min={1} unit="km" />
          <NumberInput label="Radio extendido" value={extendedRadius} onChange={setExtendedRadius} min={1} unit="km" />
          <NumberInput label="Mín. ópticas por solicitud" value={minOpticas} onChange={setMinOpticas} min={1} />
          <NumberInput label="Máx. ópticas por solicitud" value={maxOpticas} onChange={setMaxOpticas} min={1} />
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
          <NumberInput label="Expiración de presupuesto" value={quoteExpiry} onChange={setQuoteExpiry} min={1} unit="horas" />
          <NumberInput label="Ventana de verificación" value={verificationWindow} onChange={setVerificationWindow} min={1} unit="horas" />
          <NumberInput label="Duración descuento referido" value={referralDuration} onChange={setReferralDuration} min={1} unit="días" />
        </div>
      </Card>

      {/* Commissions */}
      <Card className="p-6">
        <SectionTitle
          icon={Percent}
          title="Comisiones"
          description="Tasas y períodos especiales de facturación"
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <NumberInput label="Comisión estándar" value={commissionRate} onChange={setCommissionRate} min={0} max={100} unit="%" />
          <NumberInput label="Descuento por referido" value={referralDiscount} onChange={setReferralDiscount} min={0} max={100} unit="%" />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Fin del período sin comisión
          </label>
          <input
            type="date"
            value={commissionFreeEnd}
            onChange={(e) => setCommissionFreeEnd(e.target.value)}
            className="w-full sm:w-64 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Launch period toggle */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <button
            type="button"
            onClick={() => setLaunchPeriodActive((v) => !v)}
            className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              launchPeriodActive ? 'bg-amber-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                launchPeriodActive ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Período de lanzamiento activo (comisión 0%)
            </p>
            <p className="text-xs text-slate-500">
              Cuando está activo, ninguna óptica paga comisión independientemente de la tasa configurada.
            </p>
          </div>
        </div>
      </Card>

      {/* Price tiers */}
      <Card className="p-6">
        <SectionTitle
          icon={Tag}
          title="Rangos de precio de armazones"
          description="Categorías de precio que se muestran a los clientes al crear solicitudes"
        />

        <div className="flex flex-col gap-3 mb-4">
          {priceTiers.map((tier) => (
            <div key={tier.id} className="flex items-center gap-2">
              <input
                type="text"
                value={tier.label}
                onChange={(e) => updateTier(tier.id, 'label', e.target.value)}
                placeholder="Etiqueta"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-xs text-slate-400">$</span>
              <input
                type="number"
                value={tier.min}
                onChange={(e) => updateTier(tier.id, 'min', e.target.value)}
                placeholder="Mín"
                className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-xs text-slate-400">–</span>
              <input
                type="number"
                value={tier.max}
                onChange={(e) => updateTier(tier.id, 'max', e.target.value)}
                placeholder="Máx"
                className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => removeTier(tier.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <Button size="sm" variant="outline" onClick={addTier}>
          <Plus className="w-3.5 h-3.5" /> Agregar rango
        </Button>
      </Card>

      {/* Save */}
      <Button size="lg" onClick={handleSave} className="self-start">
        <Save className="w-4 h-4" /> Guardar cambios
      </Button>
    </div>
  )
}
