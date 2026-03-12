import { clsx } from 'clsx'

const colorMap = {
  gold: 'bg-gold text-navy',
  navy: 'bg-navy text-white',
  green: 'bg-success text-white',
  amber: 'bg-amber text-white',
  blue: 'bg-blue-500 text-white',
  gray: 'bg-gray-200 text-gray-700',
  red: 'bg-red-500 text-white',
  cream: 'bg-cream text-navy border border-cborder',
}

export default function Badge({ children, color = 'navy', className = '', ...props }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-body',
        colorMap[color] || colorMap.navy,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
