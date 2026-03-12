export default function WaveDivider({ color = '#229ebc', flip = false }) {
  return (
    <div style={{ transform: flip ? 'scaleY(-1)' : 'none', lineHeight: 0, overflow: 'hidden' }}>
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '60px', display: 'block' }}
      >
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill={color} opacity="0.18" />
        <path d="M0,40 C480,10 960,60 1440,40 L1440,60 L0,60 Z" fill={color} opacity="0.12" />
      </svg>
    </div>
  )
}
