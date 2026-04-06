import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'
import Card from './Card'

export default function ErrorState({
  message = 'Ocurrió un error al cargar los datos.',
  onRetry,
}) {
  return (
    <Card className="p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500 dark:text-red-400" />
      </div>
      <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="w-3.5 h-3.5" />
          Reintentar
        </Button>
      )}
    </Card>
  )
}
