import RiasecRadar from '../charts/RiasecRadar'
import BigFiveBars from '../charts/BigFiveBars'
import Spinner from '../ui/Spinner'
import { themeNames } from '../../data/riasec-questions'

export default function ExecutiveSnapshot({ assessment, report, reportComplete }) {
  const scores = assessment?.riasec_scores || {}
  const top3 = assessment?.riasec_top3 || ''
  const fullOrder = assessment?.riasec_order || ''
  const oceanScores = assessment?.ocean_scores || {}
  const oceanLevels = assessment?.ocean_levels || {}

  return (
    <section id="snapshot" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 border-gold pl-6 mb-8">
        <h2 className="font-display text-3xl text-navy">Executive Snapshot</h2>
        <p className="text-muted font-body mt-2">Your results at a glance</p>
      </div>

      <div className="bg-cream rounded-xl p-4 mb-6 text-sm font-body text-muted">
        <strong className="text-navy">What is RIASEC?</strong> RIASEC is a six-theme model of career interests developed by psychologist John Holland. Each letter represents a broad category of interests and work environments. Most people show strength in 2–3 themes, which together form a "Holland code" that can guide career exploration.
      </div>

      {/* Top-3 Code */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {top3.split('').map(letter => (
          <div key={letter} className="flex flex-col items-center bg-white border-2 border-gold rounded-xl px-6 py-4 min-w-[80px]">
            <span className="font-display text-5xl text-navy">{letter}</span>
            <span className="text-xs text-muted font-body mt-1">{themeNames[letter]}</span>
            <span className="text-sm font-mono-data text-gold font-bold mt-1">{scores[letter]?.toFixed(1)}/7</span>
          </div>
        ))}
        <div className="flex flex-col justify-center ml-4">
          <p className="text-xs text-muted font-body mb-1">Your Holland Code</p>
          <p className="font-mono-data text-navy font-bold text-lg">{top3}</p>
          <p className="text-xs text-muted font-body mt-2 mb-1">Full Order</p>
          <p className="font-mono-data text-xs text-muted">{fullOrder}</p>
        </div>
      </div>

      {/* AI Snapshot */}
      <div className="bg-navyMid/5 border border-navyMid/20 rounded-xl p-5 mb-8">
        <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">AI Analysis</p>
        {report?.ai_snapshot ? (
          <p className="text-navy font-body leading-relaxed">{report.ai_snapshot}</p>
        ) : reportComplete ? (
          <p className="text-sm text-muted font-body italic">Analysis unavailable — retake the assessment for full results.</p>
        ) : (
          <div className="flex items-center gap-2 text-muted">
            <Spinner size="sm" /> <span className="text-sm font-body">Generating personalised analysis...</span>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        <div>
          <h4 className="font-body font-semibold text-navy mb-3 text-sm">Interest Profile (RIASEC)</h4>
          <RiasecRadar scores={scores} />
        </div>
        <div>
          <h4 className="font-body font-semibold text-navy mb-3 text-sm">Personality Signals (Big Five)</h4>
          <BigFiveBars scores={oceanScores} levels={oceanLevels} />
        </div>
      </div>
      <p className="text-xs text-muted font-body text-center italic">These charts are indicators, not grades.</p>
    </section>
  )
}
