export default function LikertScale({ question, questionId, value, onChange, scaleLabels }) {
  return (
    <div>
      {question && (
        <p style={{
          color: '#013147',
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          lineHeight: 1.7,
          margin: '0 0 16px 0',
        }}>
          {question}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(questionId, n)}
            style={{
              flex: 1,
              minWidth: 44,
              padding: '13px 4px',
              borderRadius: 12,
              border: value === n
                ? '2px solid #229ebc'
                : '2px solid #e2e8f0',
              background: value === n
                ? 'linear-gradient(135deg, #229ebc, #1a7a93)'
                : '#fff',
              color: value === n ? '#fff' : '#94a3b8',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: 17,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: value === n ? '0 0 16px rgba(34,158,188,0.35)' : '0 1px 4px rgba(1,49,71,0.06)',
              transform: value === n ? 'scale(1.06)' : 'none',
              outline: 'none',
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {scaleLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 4px' }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
            {scaleLabels[0]}
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
            {scaleLabels[4]}
          </span>
        </div>
      )}
    </div>
  )
}
