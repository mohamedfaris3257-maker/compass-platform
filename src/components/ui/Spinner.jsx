const sizeMap = { sm: 24, md: 40, lg: 64 }

export default function Spinner({ size = 'md', className = '' }) {
  const px = sizeMap[size] || sizeMap.md
  const r = px * 0.4
  const circumference = 2 * Math.PI * r

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      className={`animate-spin ${className}`}
      style={{ animationDuration: '1s' }}
    >
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        fill="none"
        stroke="#DDD8CF"
        strokeWidth={px * 0.08}
      />
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        fill="none"
        stroke="#EDC163"
        strokeWidth={px * 0.08}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * 0.75}
        strokeLinecap="round"
      />
    </svg>
  )
}
