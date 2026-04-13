import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Política de Privacidad</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          <p>Lensia recopila datos personales con el fin de facilitar la conexión entre usuarios y ópticas.</p>

          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-8">Los datos pueden incluir:</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Nombre</li>
            <li>Teléfono</li>
            <li>Ubicación</li>
            <li>Receta óptica</li>
            <li>Información del pedido</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-8">La información es utilizada exclusivamente para:</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Generar presupuestos</li>
            <li>Contactar al usuario una vez confirmada la solicitud</li>
            <li>Mejorar la experiencia en la plataforma</li>
          </ul>

          <p>Lensia no vende ni comparte datos personales con terceros fuera de la plataforma, excepto con las ópticas seleccionadas por el usuario.</p>

          <p>El usuario puede solicitar la modificación o eliminación de sus datos en cualquier momento.</p>

          <p>Lensia implementa medidas de seguridad para proteger la información.</p>
        </div>
      </div>
    </div>
  )
}
