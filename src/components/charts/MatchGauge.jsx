const getColor = (pct) => {
  if (pct >= 75) return '#22C55E'
  if (pct >= 55) return '#EDC163'
  return '#9CA3AF'
}

export default function MatchGauge({ score = 0, size = 56 }) {
  const r = size * 0.4
  const circumference = 2 * Math.PI * r
  const filled = (score / 100) * circumference
  const color = getColor(score)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#DDD8CF"
          strokeWidth={size * 0.1}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.1}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute font-mono-data text-navy font-bold"
        style={{ fontSize: size * 0.22 }}
      >
        {score}%
      </span>
    </div>
  )
}
