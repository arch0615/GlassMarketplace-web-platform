import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Upload, FileText, ShieldCheck, MapPin, Star, ArrowRight, CheckCircle, Navigation, Clock, Phone, Maximize2, Minimize2, Plus, Minus, Sun, Moon } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../context/ThemeContext'

// Buenos Aires center (Obelisco area)
const CENTER = [-34.6037, -58.3816]

const OPTICAS = [
  { lat: -34.5955, lng: -58.3731, name: 'Óptica Visión Norte', rating: '4.7', distance: '1.2 km', address: 'Av. Santa Fe 1240' },
  { lat: -34.6118, lng: -58.3960, name: 'Óptica del Sol', rating: '4.9', distance: '2.5 km', address: 'Av. Rivadavia 3450' },
  { lat: -34.5880, lng: -58.4010, name: 'Óptica Mirada Clara', rating: '4.5', distance: '3.8 km', address: 'Av. Cabildo 820' },
  { lat: -34.6200, lng: -58.3650, name: 'Óptica Express', rating: '4.6', distance: '4.1 km', address: 'Av. Belgrano 1560' },
  { lat: -34.5790, lng: -58.4200, name: 'Óptica Central', rating: '4.8', distance: '4.9 km', address: 'Av. Corrientes 5670' },
]

function GlassesShowcase() {
  return (
    <img
      src="/hero-glasses.jpg"
      alt="Colección de armazones de anteojos"
      className="w-full h-auto rounded-2xl object-cover"
    />
  )
}

function MapIllustration() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: CENTER,
      zoom: 13,
      scrollWheelZoom: false,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    L.circle(CENTER, {
      radius: 10000,
      color: '#1E40AF',
      weight: 1.5,
      dashArray: '8 6',
      fillColor: '#1E40AF',
      fillOpacity: 0.02,
    }).addTo(map)

    L.circle(CENTER, {
      radius: 5000,
      color: '#1E40AF',
      weight: 1.5,
      dashArray: '8 6',
      fillColor: '#1E40AF',
      fillOpacity: 0.04,
    }).addTo(map)

    const userIcon = L.divIcon({
      html: '<div style="width:24px;height:24px;background:#1E40AF;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;background:white;border-radius:50%"></div></div>',
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -16],
    })

    L.marker(CENTER, { icon: userIcon })
      .addTo(map)
      .bindPopup('<div style="text-align:center;font-family:Inter,sans-serif"><strong style="font-size:13px">Tu ubicación</strong><br/><span style="font-size:11px;color:#64748b">Buenos Aires, Argentina</span></div>')

    const opticaIcon = L.divIcon({
      html: '<div style="width:28px;height:28px;background:#0EA5E9;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -18],
    })

    OPTICAS.forEach((op) => {
      L.marker([op.lat, op.lng], { icon: opticaIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;min-width:160px">` +
            `<strong style="font-size:13px">${op.name}</strong><br/>` +
            `<span style="font-size:11px;color:#64748b">${op.address}</span><br/>` +
            `<div style="margin-top:4px;display:flex;align-items:center;gap:8px">` +
            `<span style="font-size:11px;color:#f59e0b;font-weight:600">&#9733; ${op.rating}</span>` +
            `<span style="font-size:11px;color:#94a3b8">${op.distance}</span>` +
            `</div></div>`
        )
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => mapInstanceRef.current.invalidateSize(), 300)
    }
  }, [expanded])

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()
  const handleToggleExpand = () => setExpanded((prev) => !prev)

  return (
    <>
      {expanded && (
        <div className="fixed inset-0 bg-black/50 z-[55]" onClick={handleToggleExpand} />
      )}
      <div
        className={`w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 ${
          expanded ? 'fixed top-20 right-4 bottom-4 left-4 z-[60]' : 'relative'
        }`}
        style={expanded ? {} : { height: 420 }}
      >
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Map controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Acercar"
        >
          <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Alejar"
        >
          <Minus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="h-1" />
        <button
          onClick={handleToggleExpand}
          className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title={expanded ? 'Reducir' : 'Expandir'}
        >
          {expanded ? (
            <Minimize2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          ) : (
            <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Tu ubicación</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-secondary rounded-full" />
          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Ópticas</span>
        </div>
      </div>

      {/* Info card overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2">
        <p className="text-[10px] text-primary font-semibold">5 ópticas encontradas</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">en un radio de 5 km</p>
      </div>
      </div>
    </>
  )
}

const features = [
  { icon: Upload, title: 'Subí tu receta', description: 'Cargá la foto de tu receta óptica y recibí presupuestos de ópticas cercanas en minutos.' },
  { icon: FileText, title: 'Compará presupuestos', description: 'Recibí hasta 5 propuestas con opciones de marcos reales. Elige la que mejor se adapte a ti.' },
  { icon: ShieldCheck, title: 'Pagá con seguridad', description: 'Tu pago queda retenido hasta que confirmes la recepción. Protección total para vos.' },
  { icon: MapPin, title: 'Ópticas cercanas', description: 'Encontramos las mejores ópticas cerca tuyo según distancia, reputación y velocidad de respuesta.' },
]

const steps = [
  { number: '1', title: 'Registrate', description: 'Creá tu cuenta gratis en segundos.' },
  { number: '2', title: 'Subí tu receta', description: 'Sacale una foto a tu receta y elegí tus preferencias.' },
  { number: '3', title: 'Recibí presupuestos', description: 'Las ópticas te envían presupuestos con monturas y precios.' },
  { number: '4', title: 'Elegí y pagá', description: 'Compará, elegí tu favorito y pagá online con Mercado Pago.' },
  { number: '5', title: 'Recibí tu pedido', description: 'Seguí el estado en tiempo real y confirmá la entrega.' },
]

const opticaBenefits = [
  'Recibí clientes nuevos que ya tienen receta y están listos para comprar.',
  'Cero comisión durante el periodo de lanzamiento.',
  'No más tiempo perdido con visitas sin intención de compra.',
  'Mostrá tu catálogo de armazones a clientes que realmente necesitan anteojos.',
  'Sistema de reputación que premia tu buen servicio.',
]

export default function Landing() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">Lensia</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
              Cómo funciona
            </a>
            <a href="#para-opticas" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
              Para ópticas
            </a>
            <a href="#medicos" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
              Médicos
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors px-4 py-2"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors px-5 py-2.5 rounded-xl"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">Plataforma activa en Argentina</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-6">
                Tus anteojos, al mejor precio y{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  sin moverte de casa
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-xl">
                Subí tu receta óptica, recibí presupuestos de ópticas cercanas, compará opciones de armazones
                y pagá online con total seguridad.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors text-lg"
                >
                  Empezar ahora
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#como-funciona"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors text-lg"
                >
                  Ver cómo funciona
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-slate-50 dark:from-slate-800 to-primary/5 rounded-3xl p-8 border border-slate-100 dark:border-slate-700">
                <GlassesShowcase />
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Monofocal', price: 'Desde $35.000' },
                    { label: 'Bifocal', price: 'Desde $55.000' },
                    { label: 'Progresivo', price: 'Desde $75.000' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white dark:bg-slate-700 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-600 shadow-sm">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '3–5', label: 'presupuestos por solicitud' },
              { value: '48hs', label: 'tiempo de respuesta' },
              { value: '100%', label: 'pagos protegidos' },
              { value: '0%', label: 'comisión de lanzamiento' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Todo lo que necesitás, en un solo lugar
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Lensia conecta clientes con ópticas de confianza, simplificando todo el proceso.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 dark:bg-secondary/20 rounded-full mb-6">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Geolocalización inteligente</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Encontramos las ópticas más cercanas a vos
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Nuestro sistema selecciona automáticamente entre 3 y 5 ópticas cercanas según distancia,
                reputación y velocidad de respuesta. Solo las mejores reciben tu solicitud.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Navigation, text: 'Búsqueda inteligente en radio de 5 a 10 km' },
                  { icon: Star, text: 'Ópticas seleccionadas por ranking y reputación' },
                  { icon: Clock, text: 'Respuesta en menos de 48 horas' },
                  { icon: Phone, text: 'Comunicación gestionada por Lensia en todo momento' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-200">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <MapIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Cómo funciona
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              En 5 simples pasos, tus anteojos nuevos están en camino.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-4 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full bg-primary/20 mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Ópticas */}
      <section id="para-opticas" className="py-20 bg-gradient-to-br from-primary to-primary-dark px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-white/90">Para ópticas</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Clientes nuevos, listos para comprar
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Lensia te presenta clientes que ya tienen receta y están decididos. No más visitas sin intención de compra.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Registrar mi óptica
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="space-y-4">
              {opticaBenefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Doctors section */}
      <section id="medicos" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Encontrá tu oftalmólogo
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
            Buscá médicos cerca tuyo, consultá sus horarios, obras sociales y las opiniones de otros pacientes.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
            {[
              { icon: MapPin, title: 'Ubicación', description: 'Médicos cerca de tu zona' },
              { icon: Star, title: 'Rankings', description: 'Puntuados por pacientes reales' },
              { icon: ShieldCheck, title: 'Obras sociales', description: 'Filtrá por cobertura médica' },
            ].map((item) => (
              <div key={item.title} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                <item.icon className="w-8 h-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
          <Link
            to="/medicos"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            Ver directorio de médicos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Empezá hoy mismo
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Registrate gratis y recibí presupuestos de ópticas cercanas en minutos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 dark:border-slate-600 hover:border-primary text-slate-700 dark:text-slate-200 hover:text-primary font-semibold rounded-xl transition-colors text-lg"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">Lensia</span>
              </div>
              <p className="text-slate-400 text-sm">
                La plataforma que conecta clientes con ópticas de confianza en Argentina.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Clientes</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Crear cuenta</Link></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a></li>
                <li><Link to="/medicos" className="hover:text-white transition-colors">Buscar médico</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Ópticas</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Registrar mi óptica</Link></li>
                <li><a href="#para-opticas" className="hover:text-white transition-colors">Beneficios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Médicos</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Registrar mi consultorio</Link></li>
                <li><Link to="/medicos" className="hover:text-white transition-colors">Directorio</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Lensia. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
