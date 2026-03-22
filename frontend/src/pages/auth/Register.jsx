import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Store, Stethoscope, Eye, Mail, Lock, Phone, MapPin, Hash, Briefcase, ArrowLeft, Check, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const roleCards = [
  {
    id: 'cliente',
    label: 'Cliente',
    icon: User,
    description: 'Cargá tu receta y recibí presupuestos de ópticas cerca tuyo.',
    color: 'from-blue-500 to-primary',
    ring: 'ring-primary',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-primary',
  },
  {
    id: 'optica',
    label: 'Óptica',
    icon: Store,
    description: 'Publicá tu catálogo y respondé solicitudes de clientes en toda Argentina.',
    color: 'from-sky-400 to-secondary',
    ring: 'ring-secondary',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-secondary',
  },
  {
    id: 'medico',
    label: 'Médico',
    icon: Stethoscope,
    description: 'Formá parte del directorio de oftalmólogos y optómetras de Lensia.',
    color: 'from-emerald-400 to-emerald-600',
    ring: 'ring-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600',
  },
]

function ClienteForm({ form, onChange }) {
  return (
    <>
      <InputField icon={User} label="Nombre completo" name="name" value={form.name} onChange={onChange} placeholder="María González" />
      <InputField icon={Mail} label="Correo electrónico" name="email" type="email" value={form.email} onChange={onChange} placeholder="tu@email.com" />
      <InputField icon={Lock} label="Contraseña" name="password" type="password" value={form.password} onChange={onChange} placeholder="Mínimo 8 caracteres" />
    </>
  )
}

function OpticaForm({ form, onChange }) {
  return (
    <>
      <InputField icon={Store} label="Nombre del negocio" name="businessName" value={form.businessName} onChange={onChange} placeholder="Óptica Visión Clara" />
      <InputField icon={Hash} label="CUIT" name="cuit" value={form.cuit} onChange={onChange} placeholder="20-12345678-9" />
      <InputField icon={MapPin} label="Dirección" name="address" value={form.address} onChange={onChange} placeholder="Av. Corrientes 1234, CABA" />
      <InputField icon={Phone} label="Teléfono" name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="+54 11 4000-0000" />
      <InputField icon={Mail} label="Correo electrónico" name="email" type="email" value={form.email} onChange={onChange} placeholder="contacto@optica.com" />
      <InputField icon={Lock} label="Contraseña" name="password" type="password" value={form.password} onChange={onChange} placeholder="Mínimo 8 caracteres" />
    </>
  )
}

function MedicoForm({ form, onChange }) {
  return (
    <>
      <InputField icon={User} label="Nombre completo" name="name" value={form.name} onChange={onChange} placeholder="Dr. Carlos Pérez" />
      <InputField icon={Briefcase} label="Especialidad" name="specialty" value={form.specialty} onChange={onChange} placeholder="Oftalmología / Optometría" />
      <InputField icon={Hash} label="Número de matrícula" name="license" value={form.license} onChange={onChange} placeholder="MN 12345" />
      <InputField icon={Mail} label="Correo electrónico" name="email" type="email" value={form.email} onChange={onChange} placeholder="dr@consultorio.com" />
      <InputField icon={Lock} label="Contraseña" name="password" type="password" value={form.password} onChange={onChange} placeholder="Mínimo 8 caracteres" />
    </>
  )
}

function InputField({ icon: Icon, label, name, type = 'text', value, onChange, placeholder }) {
  const [showPwd, setShowPwd] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={isPassword ? (showPwd ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPwd ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [selectedRole, setSelectedRole] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)

  const roleHome = {
    cliente: '/cliente/dashboard',
    optica: '/optica/dashboard',
    admin: '/admin/dashboard',
    medico: '/medicos',
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const body = {
        email: form.email,
        password: form.password,
        fullName: form.name || form.businessName || '',
        phone: form.phone || undefined,
        role: selectedRole,
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar')
      }
      login(data.access_token, data.user)
      toast.success('¡Cuenta creada con éxito!')
      navigate(roleHome[data.user.role] || '/cliente/dashboard')
    } catch (err) {
      toast.error(err.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const activeCard = roleCards.find((r) => r.id === selectedRole)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 py-10">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 shadow border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/70 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Lensia</h1>
            <p className="text-sky-100 text-sm mt-1 font-medium">Crear cuenta</p>
          </div>

          {/* Role selection */}
          {!selectedRole && (
            <div className="p-8">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Soy...
              </p>
              <div className="grid gap-3">
                {roleCards.map(({ id, label, icon: Icon, description, color, bg, text }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedRole(id)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 ${bg} hover:shadow-md transition-all duration-200 text-left group`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${text}`}>{label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{description}</p>
                    </div>
                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          )}

          {/* Registration form */}
          {selectedRole && activeCard && (
            <div>
              {/* Back + role indicator */}
              <div className="px-8 pt-6 pb-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedRole(null); setForm({}) }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${activeCard.color} flex items-center justify-center`}>
                  <activeCard.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{activeCard.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Completá tus datos</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
                {selectedRole === 'cliente' && <ClienteForm form={form} onChange={handleChange} />}
                {selectedRole === 'optica' && <OpticaForm form={form} onChange={handleChange} />}
                {selectedRole === 'medico' && <MedicoForm form={form} onChange={handleChange} />}

                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                    Acepto los{' '}
                    <button type="button" className="text-primary hover:underline font-medium">
                      términos y condiciones
                    </button>{' '}
                    y la{' '}
                    <button type="button" className="text-primary hover:underline font-medium">
                      política de privacidad
                    </button>
                    .
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  ¿Ya tenés cuenta?{' '}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Iniciar sesión
                  </Link>
                </p>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          © 2026 Lensia · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
