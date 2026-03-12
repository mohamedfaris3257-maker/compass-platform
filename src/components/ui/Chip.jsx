import { clsx } from 'clsx'

const styleMap = {
  orange:        { background: '#fff3e0', color: '#fb8403' },
  yellow:        { background: '#fffde7', color: '#b45309' },
  teal:          { background: '#e0f7fa', color: '#229ebc' },
  navy:          { background: '#e8edf0', color: '#013147' },
  green:         { background: '#f0fdf4', color: '#16a34a' },
  red:           { background: '#fef2f2', color: '#dc2626' },
  // legacy aliases kept for existing usage
  gold:          { background: '#fff3e0', color: '#fb8403' },
  'navy-outline':{ background: 'transparent', color: '#013147', border: '1px solid #013147' },
  'gold-outline':{ background: 'transparent', color: '#fb8403', border: '1px solid #fb8403' },
  amber:         { background: '#fffde7', color: '#b45309' },
  blue:          { background: '#e0f7fa', color: '#229ebc' },
  gray:          { background: '#f1f5f9', color: '#64748b' },
  muted:         { background: '#f1f5f9', color: '#64748b' },
}

export default function Chip({ children, color = 'muted', className = '', style: extraStyle, ...props }) {
  const s = styleMap[color] || styleMap.muted
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '999px',
        padding: '4px 12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: '12px',
        lineHeight: 1.5,
        border: s.border || 'none',
        background: s.background,
        color: s.color,
        ...extraStyle,
      }}
      className={clsx(className)}
      {...props}
    >
      {children}
    </span>
  )
}
