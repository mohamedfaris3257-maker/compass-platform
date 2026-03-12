import LikertScale from './LikertScale'

export default function QuestionCard({ questions, answers, onAnswer, scaleLabels }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {questions.map((q) => (
        <div
          key={q.id}
          style={{
            background: '#fff',
            border: '1.5px solid #e8eef4',
            borderRadius: 18,
            padding: '22px 22px 18px',
            boxShadow: '0 2px 12px rgba(1,49,71,0.05)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(34,158,188,0.35)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,158,188,0.1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e8eef4'
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(1,49,71,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <span style={{
              fontSize: 10,
              fontFamily: 'IBM Plex Mono, monospace',
              fontWeight: 700,
              color: '#229ebc',
              background: '#e8f6fb',
              border: '1px solid rgba(34,158,188,0.2)',
              padding: '3px 8px',
              borderRadius: 6,
              flexShrink: 0,
              marginTop: 3,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>{q.id}</span>
            <p style={{
              color: '#013147',
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              lineHeight: 1.7,
              margin: 0,
            }}>{q.text}</p>
          </div>
          <LikertScale
            question={null}
            questionId={q.id}
            value={answers[q.id] || null}
            onChange={onAnswer}
            scaleLabels={scaleLabels}
          />
        </div>
      ))}
    </div>
  )
}
