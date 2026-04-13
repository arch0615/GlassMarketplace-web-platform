import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'

export default function Contacto() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Contacto</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">Email</p>
              <a href="mailto:Lensia.arg@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">Lensia.arg@gmail.com</a>
            </div>
          </div>

          <p className="text-slate-500 dark:text-slate-400">
            También podés escribirnos desde la plataforma y te responderemos a la brevedad.
          </p>
        </div>
      </div>
    </div>
  )
}
