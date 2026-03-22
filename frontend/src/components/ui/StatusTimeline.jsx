import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

export default function StatusTimeline({ steps = [] }) {
  return (
    <ol className="relative flex flex-col gap-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1

        return (
          <li key={index} className="flex gap-4">
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : step.active ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 my-1 ${
                    step.completed ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-600'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`text-sm font-semibold leading-tight ${
                  step.completed
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : step.active
                    ? 'text-primary'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </p>
              {step.date && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{step.date}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
