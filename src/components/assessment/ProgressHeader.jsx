import { ArrowLeft } from 'lucide-react'

export default function ProgressHeader({ sectionName, currentQ, totalQ, onBack, progress }) {
  return (
    <div style={{
      position: 'sticky',
      top: 64,
      zIndex: 40,
      background: 'linear-gradient(135deg, #011f2e, #013147)',
      borderBottom: '1px solid rgba(34,158,188,0.2)',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      boxShadow: '0 4px 24px rgba(1,31,46,0.6)',
    }}>
      <button
        onClick={onBack}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginRight: 14,
          flexShrink: 0,
          color: '#8ec9e6',
          transition: 'all 0.15s',
        }}
      >
        <ArrowLeft size={16} />
      </button>

      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 10,
          color: '#8ec9e6',
          fontFamily: 'Inter, sans-serif',
          margin: '0 0 6px 0',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>{sectionName}</p>
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 999,
          height: 4,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #229ebc, #ffb705)',
            borderRadius: 999,
            width: `${progress}%`,
            transition: 'width 0.5s ease',
            boxShadow: '0 0 8px rgba(34,158,188,0.6)',
          }} />
        </div>
      </div>

      <span style={{
        marginLeft: 16,
        fontSize: 12,
        fontFamily: 'IBM Plex Mono, monospace',
        color: '#8ec9e6',
        whiteSpace: 'nowrap',
      }}>{currentQ} / {totalQ}</span>
    </div>
  )
}
