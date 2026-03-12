import { clsx } from 'clsx'

export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={clsx('flex gap-0 border-b border-cborder', className)}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'px-4 py-2.5 text-sm font-medium font-body border-b-2 -mb-px transition-colors',
            active === tab.value
              ? 'border-gold text-gold'
              : 'border-transparent text-muted hover:text-navy hover:border-cborder'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
