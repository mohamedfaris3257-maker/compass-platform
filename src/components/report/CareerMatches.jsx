import { useState } from 'react'
import Tabs from '../ui/Tabs'
import CareerCard from './CareerCard'
import Spinner from '../ui/Spinner'

const TABS = [
  { value: 'blended', label: '⭐ Blended (Recommended)' },
  { value: 'holland', label: '🔬 Pure Holland' },
  { value: 'personality', label: '🧠 Personality & Work Style' },
]

export default function CareerMatches({ matches = [], report, assessment, reportComplete }) {
  const [activeTab, setActiveTab] = useState('blended')

  const byType = (type) => matches.filter(m => m.match_type === type).slice(0, 5)

  const studentProfile = {
    top3: assessment?.riasec_top3,
    dominantTrait: Object.entries(assessment?.ocean_scores || {}).sort((a,b) => b[1]-a[1])[0]?.[0],
    hobbies: assessment?.hobbies,
  }

  return (
    <section id="careers" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 border-gold pl-6 mb-8">
        <h2 className="font-display text-3xl text-navy">Your Top Career Matches</h2>
        <p className="text-muted font-body mt-2">Three views of your career matches, each using a different lens</p>
      </div>

      <p className="text-navy/80 font-body leading-relaxed mb-6">
        We use three matching approaches: <strong>Blended</strong> combines all your data for the most holistic match (40% RIASEC + 35% personality + 25% hobby relevance). <strong>Pure Holland</strong> matches purely on RIASEC interest themes. <strong>Personality & Work Style</strong> matches on Big Five dimensions. Each view may surface different careers — explore all three.
      </p>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} className="mb-6" />

      <div className="space-y-4">
        {byType(activeTab).length > 0 ? (
          byType(activeTab).map((match, i) => (
            <CareerCard
              key={`${match.soc_code || match.career_id}-${activeTab}`}
              career={match}
              rank={i + 1}
              rationale={
                // Support both nested {soc_code: {tab: text}} and flat {soc_code: text} formats
                report?.ai_career_rationale?.[match.soc_code || match.career_id]?.[activeTab]
                ?? report?.ai_career_rationale?.[match.soc_code || match.career_id]
              }
              skillsData={report?.ai_skills_programs?.[match.soc_code || match.career_id]}
              demandData={report?.ai_demand?.[match.soc_code || match.career_id]}
              studentProfile={studentProfile}
              reportComplete={reportComplete}
            />
          ))
        ) : reportComplete ? (
          <div className="text-center py-12 text-muted">
            <p className="font-body text-sm">No career matches available — retake the assessment for full results.</p>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 gap-3 text-muted">
            <Spinner size="sm" />
            <span className="font-body text-sm">Loading career matches...</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted font-body mt-6 text-center italic">
        Demand chips are indicators, not promises, and may change over time.
      </p>
    </section>
  )
}
