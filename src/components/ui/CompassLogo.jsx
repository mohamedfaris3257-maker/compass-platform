export default function CompassLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="20" cy="20" r="18" fill="url(#logoGrad)" />
      {/* Ring tick marks */}
      {[0, 90, 180, 270].map(deg => (
        <line
          key={deg}
          x1="20" y1="3.5" x2="20" y2="7"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      {/* North needle (teal-white) */}
      <path d="M20 7 L22.5 20 L20 18.5 L17.5 20 Z" fill="white" />
      {/* South needle (semi-transparent) */}
      <path d="M20 33 L17.5 20 L20 21.5 L22.5 20 Z" fill="rgba(255,255,255,0.4)" />
      {/* Center pivot */}
      <circle cx="20" cy="20" r="2.5" fill="white" opacity="0.95" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#229ebc" />
          <stop offset="100%" stopColor="#1a7a93" />
        </linearGradient>
      </defs>
    </svg>
  )
}
