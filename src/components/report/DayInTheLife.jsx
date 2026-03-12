import { useState } from 'react'
import Spinner from '../ui/Spinner'

const PHASE_CONFIG = [
  { key: 'morning',     label: 'Morning',      icon: '🌅', color: '#229ebc', bg: 'rgba(34,158,188,0.07)', border: 'rgba(34,158,188,0.2)' },
  { key: 'core_work',   label: 'Core Work',    icon: '⚡', color: '#8b5cf6', bg: 'rgba(139,92,246,0.07)',  border: 'rgba(139,92,246,0.2)' },
  { key: 'reflection',  label: 'End of Day',   icon: '🌙', color: '#ffb705', bg: 'rgba(255,183,5,0.07)',   border: 'rgba(255,183,5,0.2)' },
]

export default function DayInTheLife({ report, reportComplete, matches }) {
  const rawData = report?.ai_day_in_life   // object keyed by career title, or legacy single-career object

  // Build list of careers from matches (top 3 blended) or from the data keys
  const blendedTop3 = (matches ?? [])
    .filter(m => m.match_type === 'blended')
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    .slice(0, 3)

  // Normalise: if legacy format (has 'career' key directly), wrap it
  let dayData = null
  if (rawData) {
    if (rawData.morning || rawData.core_work) {
      // Legacy single-career format — wrap it
      const careerName = rawData.career ?? blendedTop3[0]?.title ?? 'Top Career'
      dayData = { [careerName]: rawData }
    } else {
      dayData = rawData
    }
  }

  const careerKeys = dayData ? Object.keys(dayData) : blendedTop3.map(m => m.title)
  const [activeIdx, setActiveIdx] = useState(0)
  const activeCareer = careerKeys[activeIdx]
  const activeData = dayData?.[activeCareer]

  return (
    <section id="day-in-life" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 pl-6 mb-8" style={{ borderColor: '#229ebc' }}>
        <h2 className="font-display text-3xl text-navy">A Day in the Life</h2>
        <p className="text-muted font-body mt-2 text-sm">A first-person look at what your top matched careers feel like day-to-day</p>
      </div>

      {/* Career toggle tabs */}
      {careerKeys.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {careerKeys.map((career, i) => (
            <button
              key={career}
              onClick={() => setActiveIdx(i)}
              style={{
                background: activeIdx === i ? '#013147' : '#fff',
                color: activeIdx === i ? '#fff' : '#013147',
                border: activeIdx === i ? '2px solid #013147' : '2px solid #e0f0f8',
                borderRadius: 12,
                padding: '8px 18px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: activeIdx === i ? 700 : 400,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: ['#229ebc', '#8b5cf6', '#ffb705'][i] ?? '#229ebc', display: 'inline-block' }} />
              {career}
              {blendedTop3[i] && (
                <span style={{ fontSize: 11, opacity: 0.7 }}>#{i + 1}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {!dayData ? (
        reportComplete ? (
          <div className="text-center py-8 text-muted">
            <p className="font-body text-sm">Day in the Life unavailable — retake the assessment for full results.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted py-8 justify-center">
            <Spinner size="sm" />
            <span className="font-body text-sm">Writing your career stories...</span>
          </div>
        )
      ) : !activeData ? (
        <div className="text-center py-8 text-muted">
          <p className="font-body text-sm">Story for this career is unavailable.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PHASE_CONFIG.map((phase, i, arr) => (
              <div key={phase.key} style={{ display: 'flex', gap: 0 }}>
                {/* Timeline spine */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: phase.bg, border: `2px solid ${phase.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {phase.icon}
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 2, height: 36, background: `linear-gradient(to bottom, ${phase.color}44, transparent)`, marginTop: 2 }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ paddingLeft: 20, paddingBottom: 28, flex: 1 }}>
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color: phase.color, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
                    {phase.label}
                  </span>
                  <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#013147', lineHeight: 1.8 }}>
                    {activeData[phase.key] ?? '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
