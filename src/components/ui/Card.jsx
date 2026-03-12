import { clsx } from 'clsx'

const variants = {
  default:     'bg-white',
  elevated:    'bg-white hover:-translate-y-0.5',
  highlighted: 'bg-white border-l-4 border-l-orange',
  navy:        'text-white',
}

export default function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(1,49,71,0.07)',
        padding: '24px',
        backgroundColor: variant === 'navy' ? '#013147' : '#ffffff',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      className={clsx(
        variants[variant],
        onClick && 'cursor-pointer hover:shadow-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
