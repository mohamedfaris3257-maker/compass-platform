import { clsx } from 'clsx'

export default function ProgressBar({ value = 0, max = 100, showLabel = true, className = '', height = 8 }) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  return (
    <div className={clsx('w-full', className)}>
      <div
        className="w-full bg-cream rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full bg-gold rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted mt-1 font-mono-data">{pct}%</span>
      )}
    </div>
  )
}
