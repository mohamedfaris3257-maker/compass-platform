import { clsx } from 'clsx'

const variantClasses = {
  primary:   'text-white active:scale-95 hover:opacity-90',
  secondary: 'bg-transparent text-teal border-2 border-teal hover:bg-teal hover:text-white active:scale-95',
  ghost:     'bg-transparent text-teal hover:bg-teal/10 active:scale-95',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:scale-95',
  success:   'bg-success text-white hover:bg-green-600 active:scale-95',
}

const variantInlineStyles = {
  primary:   { background: 'linear-gradient(135deg, #229ebc, #1a7a93)', boxShadow: '0 4px 16px rgba(34,158,188,0.35)', border: 'none' },
  secondary: {},
  ghost:     {},
  danger:    {},
  success:   {},
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: '12px',
        fontFamily: 'Montserrat, sans-serif',
        ...variantInlineStyles[variant],
        ...style,
      }}
      className={clsx(
        'transition-all duration-150 inline-flex items-center justify-center gap-2 font-semibold',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
