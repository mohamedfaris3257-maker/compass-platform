import { clsx } from 'clsx'

const levelColors = {
  High: 'bg-success/10 text-green-700 border-success/30',
  Moderate: 'bg-amber/10 text-amber border-amber/30',
  Low: 'bg-gray-100 text-gray-500 border-gray-200',
  Varies: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function DemandChip({ region, level = 'Moderate' }) {
  return (
    <div className={clsx(
      'flex flex-col items-center px-2 py-1 rounded-lg border text-center',
      levelColors[level] || levelColors.Moderate
    )}>
      <span className="text-[10px] font-body font-medium leading-tight">{region}</span>
      <span className="text-[10px] font-semibold font-mono-data leading-tight mt-0.5">{level}</span>
    </div>
  )
}
