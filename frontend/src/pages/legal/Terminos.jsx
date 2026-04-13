import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Terminos() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Términos y Condiciones</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          <p>Lensia es una plataforma digital que conecta usuarios con ópticas para solicitar y comparar presupuestos de productos y servicios ópticos.</p>

          <p>Lensia no fabrica, vende ni entrega productos directamente. Los servicios y productos son ofrecidos por ópticas independientes registradas en la plataforma.</p>

          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-8">El usuario acepta que:</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>La información proporcionada es veraz.</li>
            <li>Los presupuestos son orientativos y pueden estar sujetos a cambios.</li>
            <li>La contratación final del servicio se realiza con la óptica seleccionada.</li>
          </ul>

          <p>Lensia actúa como intermediario y no es responsable por la calidad final del producto, tiempos de entrega o servicios prestados por terceros.</p>

          <p>El pago de la seña dentro de la plataforma permite acceder a los datos de contacto de la óptica para coordinar el trabajo.</p>

          <p>El uso de la plataforma implica la aceptación de estos términos.</p>

          <hr className="my-8 border-slate-200 dark:border-slate-700" />

          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Política de Cancelación</h2>

          <p>El usuario puede cancelar su solicitud antes de confirmar el pedido sin costo.</p>

          <p>Una vez abonada la seña, el pedido se considera confirmado con la óptica seleccionada.</p>

          <p>La devolución de la seña quedará sujeta a las condiciones de la óptica y al estado del trabajo solicitado.</p>

          <p>En caso de que la óptica no pueda cumplir con el servicio, el usuario podrá solicitar la devolución de la seña o elegir una nueva opción dentro de la plataforma.</p>

          <p>Lensia actúa como intermediario y facilitará la comunicación entre las partes en caso de cancelaciones.</p>

          <hr className="my-8 border-slate-200 dark:border-slate-700" />

          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Política de Garantía</h2>

          <p>Las garantías de los productos y servicios ofrecidos a través de Lensia son responsabilidad exclusiva de cada óptica.</p>

          <p>Cada óptica podrá establecer sus propias condiciones de garantía, las cuales deberán ser informadas al cliente al momento de la entrega.</p>

          <p>Lensia no garantiza productos ni servicios, pero promueve la transparencia y calidad en las operaciones realizadas dentro de la plataforma.</p>

          <p>En caso de inconvenientes, el usuario podrá contactar a la óptica directamente o solicitar asistencia a través de Lensia.</p>

          <hr className="my-8 border-slate-200 dark:border-slate-700" />

          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Política de Reclamos</h2>

          <p>En caso de inconvenientes con un producto o servicio, el usuario deberá comunicarse en primera instancia con la óptica responsable.</p>

          <p>Si el problema no se resuelve, el usuario podrá reportarlo a través de Lensia.</p>

          <p>Lensia podrá intervenir como mediador para facilitar una solución, pero no es responsable directo del resultado final del servicio.</p>

          <p>Se recomienda realizar reclamos dentro de los 15 días posteriores a la entrega del producto o servicio.</p>
        </div>
      </div>
    </div>
  )
}
