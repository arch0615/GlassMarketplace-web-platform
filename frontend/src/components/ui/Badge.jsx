const variantClasses = {
  success: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-100 text-amber-700 ring-amber-200',
  danger: 'bg-red-100 text-red-700 ring-red-200',
  info: 'bg-sky-100 text-sky-700 ring-sky-200',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  purple: 'bg-purple-100 text-purple-700 ring-purple-200',
}

export default function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
