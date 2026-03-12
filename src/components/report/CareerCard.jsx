import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import MatchGauge from '../charts/MatchGauge'
import DemandChip from '../careers/DemandChip'
import Chip from '../ui/Chip'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import CareerChatWidget from '../careers/CareerChatWidget'

const AI_EXPOSURE = {
  high_resilient: ['29', '25', '21', '27', '33', '47', '49'],
  adjacent:       ['11', '13', '17', '19', '23', '41'],
  exposed:        ['15', '43', '51', '53'],
}

function getAIBadge(socCode) {
  if (!socCode) return null
  const prefix = socCode.split('-')[0]
  if (AI_EXPOSURE.high_resilient.includes(prefix)) {
    return { label: '🛡️ AI-Resilient', bg: '#f0fdf4', color: '#16a34a' }
  }
  if (AI_EXPOSURE.adjacent.includes(prefix)) {
    return { label: '⚡ AI-Adjacent', bg: '#fffde7', color: '#b45309' }
  }
  if (AI_EXPOSURE.exposed.includes(prefix)) {
    return { label: '🤖 AI-Exposed', bg: '#fef2f2', color: '#dc2626' }
  }
  return null
}

const REGIONS = [
  { key: 'UAE_MENA', label: 'UAE/MENA' },
  { key: 'North_America', label: 'N.America' },
  { key: 'Europe', label: 'Europe' },
  { key: 'South_Asia', label: 'S.Asia' },
  { key: 'SE_Asia', label: 'SE Asia' },
  { key: 'Africa', label: 'Africa' },
  { key: 'Oceania', label: 'Oceania' },
]

export default function CareerCard({ career, rank, rationale, skillsData, demandData, studentProfile, reportComplete }) {
  const [expanded, setExpanded] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const score = career.match_score || 0
  const title = career.title || 'Career'

  return (
    <>
      <div className="bg-white border border-cborder rounded-xl shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono-data text-muted bg-cream px-1.5 py-0.5 rounded">#{rank}</span>
              {career.source === 'modern' && (
                <span className="text-xs bg-gold/20 text-navy px-2 py-0.5 rounded-full font-body">✨ Emerging</span>
              )}
              {(() => {
                const badge = getAIBadge(career.soc_code)
                return badge ? (
                  <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {badge.label}
                  </span>
                ) : null
              })()}
            </div>
            <h4 className="font-display text-lg text-navy">{title}</h4>
            {career.soc_code && (
              <p className="text-xs text-muted font-mono-data mt-0.5">SOC {career.soc_code}</p>
            )}
            {career.salary_usd_low && (
              <p className="text-sm text-success font-semibold mt-1">
                ${career.salary_usd_low?.toLocaleString()}k – ${career.salary_usd_high?.toLocaleString()}k / year
              </p>
            )}
          </div>
          <MatchGauge score={score} size={56} />
        </div>

        {/* Why this fits */}
        <div className="px-5 pb-3">
          <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-1.5">Why this might fit</p>
          {rationale ? (
            <p className="text-sm text-navy/80 font-body leading-relaxed">{rationale}</p>
          ) : reportComplete ? (
            <p className="text-xs text-muted font-body italic">Analysis unavailable — retake the assessment for full results.</p>
          ) : (
            <div className="flex items-center gap-2 text-muted">
              <Spinner size="sm" />
              <span className="text-xs font-body">Generating personalised insight...</span>
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <div className="px-5 pb-4">
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-sm text-gold hover:text-navy font-body font-medium transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-cborder px-5 py-4 space-y-4">
            {/* Skills */}
            {skillsData?.skills?.length > 0 && (
              <div>
                <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">Key Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skillsData.skills.map((s, i) => <Chip key={i} color="navy">{s}</Chip>)}
                </div>
              </div>
            )}

            {/* Programs */}
            {skillsData?.programs?.length > 0 && (
              <div>
                <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">University Programs</p>
                <ul className="space-y-1">
                  {skillsData.programs.map((p, i) => (
                    <li key={i} className="text-sm text-navy font-body flex items-center gap-2">
                      <span className="text-gold">•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subjects */}
            {skillsData && (
              <div>
                <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">Subjects</p>
                <div className="space-y-2">
                  {skillsData.subjects_must?.length > 0 && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-xs text-muted font-body whitespace-nowrap">Must-Have:</span>
                      {skillsData.subjects_must.map((s, i) => <Chip key={i} color="gold">{s}</Chip>)}
                    </div>
                  )}
                  {skillsData.subjects_recommended?.length > 0 && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-xs text-muted font-body whitespace-nowrap">Recommended:</span>
                      {skillsData.subjects_recommended.map((s, i) => <Chip key={i} color="navy-outline">{s}</Chip>)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Demand */}
            <div>
              <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">Demand by Region</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {REGIONS.map(r => (
                  <DemandChip
                    key={r.key}
                    region={r.label}
                    level={demandData?.[r.key] || 'Moderate'}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-cborder flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatOpen(true)}
            className="text-xs"
          >
            <MessageSquare size={14} /> Ask AI about this career
          </Button>
        </div>
      </div>

      <CareerChatWidget
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        careerTitle={title}
        studentProfile={studentProfile}
      />
    </>
  )
}
