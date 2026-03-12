import Spinner from '../ui/Spinner'

const ACTIVITY_ICONS = {
  watch:   { emoji: '📹', label: 'Watch' },
  read:    { emoji: '📖', label: 'Read' },
  build:   { emoji: '🔨', label: 'Build' },
  talk_to: { emoji: '🗣️', label: 'Talk To' },
  course:  { emoji: '🏫', label: 'Course' },
}

export default function TryBeforeYouChoose({ report, reportComplete }) {
  const data = report?.ai_try_before

  return (
    <section id="try-before" className="report-section px-4 md:px-8 py-10" style={{ background: '#fff' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-1">Section 9</p>
          <h2 className="font-display text-2xl" style={{ color: '#013147' }}>Try Before You Choose</h2>
          <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'Inter, sans-serif', marginTop: '6px' }}>
            Five low-commitment ways to explore each of your top career matches before committing to a path.
          </p>
        </div>

        {!data ? (
          reportComplete ? (
            <div style={{ background: '#f5f4f0', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                Exploration activities will appear here after retaking the assessment with the updated platform.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3" style={{ padding: '32px', background: '#f5f4f0', borderRadius: '16px' }}>
              <Spinner size="sm" />
              <span style={{ color: '#64748b', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>Generating personalised exploration activities...</span>
            </div>
          )
        ) : (
          <div className="space-y-6">
            {Object.entries(data).map(([careerTitle, activities]) => (
              <div
                key={careerTitle}
                style={{ background: '#f5f4f0', borderRadius: '16px', padding: '20px' }}
              >
                <h3 className="font-display text-base mb-4" style={{ color: '#013147' }}>{careerTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(ACTIVITY_ICONS).map(([key, { emoji, label }]) => {
                    const text = activities?.[key]
                    if (!text) return null
                    return (
                      <div
                        key={key}
                        style={{ background: '#fff', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(1,49,71,0.06)' }}
                      >
                        <div style={{ fontSize: '22px', marginBottom: '8px' }}>{emoji}</div>
                        <p style={{ color: '#229ebc', fontSize: '10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                          {label}
                        </p>
                        <p style={{ color: '#013147', fontSize: '12px', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                          {text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
