import { useState } from 'react'
import Spinner from '../ui/Spinner'

export default function PersonalStatement({ report, reportComplete }) {
  const data = report?.ai_personal_statement
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!data?.opening) return
    navigator.clipboard.writeText(data.opening).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section id="personal-statement" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 pl-6 mb-8" style={{ borderColor: '#fb8403' }}>
        <h2 className="font-display text-3xl text-navy">Personal Statement Starter</h2>
        <p className="text-muted font-body mt-2">
          A 150-word opening paragraph{data?.career ? ` tailored for ${data.career}` : ''} — edit and make it your own
        </p>
      </div>

      <div className="rounded-xl p-4 mb-8" style={{ background: 'rgba(255,183,5,0.08)', border: '1px solid rgba(255,183,5,0.25)' }}>
        <ul className="space-y-1 text-xs text-muted font-body">
          {[
            'This is a starting point — not a finished statement. Add your own specific experiences.',
            'Universities want your authentic voice. Use this as scaffolding, then replace with your own words.',
            'Aim for 4,000 characters (about 650 words) total for UK UCAS. This gives you ~850 words of space to continue.',
          ].map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <span style={{ color: '#ffb705' }}>•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {!data ? (
        reportComplete ? (
          <div className="text-center py-8 text-muted">
            <p className="font-body text-sm">Personal Statement unavailable — retake the assessment for full results.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted py-8 justify-center">
            <Spinner size="sm" />
            <span className="font-body text-sm">Drafting your opening paragraph...</span>
          </div>
        )
      ) : (
        <div>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e0f0f8', padding: '28px 32px', position: 'relative', boxShadow: '0 2px 16px rgba(1,49,71,0.06)' }}>
            {/* Opening quote mark */}
            <div style={{ fontSize: 64, lineHeight: 1, color: '#229ebc', opacity: 0.2, fontFamily: 'Georgia, serif', position: 'absolute', top: 12, left: 20, userSelect: 'none' }}>"</div>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#013147', lineHeight: 1.85, margin: 0, position: 'relative', zIndex: 1, paddingTop: 8 }}>
              {data.opening}
            </p>

            {/* Continuation hint */}
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#229ebc', margin: '16px 0 0', fontStyle: 'italic', opacity: 0.8 }}>
              ✏️ Continue writing here — describe a specific moment or experience that drew you to this field...
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(34,158,188,0.1)', color: copied ? '#16a34a' : '#229ebc', border: 'none', borderRadius: 10, padding: '9px 18px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {copied ? '✓ Copied!' : '📋 Copy to clipboard'}
            </button>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748b', alignSelf: 'center' }}>
              ~{data.opening?.split(/\s+/).length ?? 0} words
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
