import { useState, useEffect } from 'react'
import Spinner from '../ui/Spinner'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n) return '—'
  return n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`
}

function salaryMid(career) {
  const lo = career.salary_usd_low  ?? 0
  const hi = career.salary_usd_high ?? 0
  if (!lo && !hi) return null
  return Math.round((lo + hi) / 2)
}

// Salary arcs (very rough heuristic — entry/mid/senior multipliers)
const SALARY_STAGES = [
  { label: 'Entry', mult: 0.70, years: '0–2 yrs' },
  { label: 'Mid',   mult: 1.00, years: '3–7 yrs' },
  { label: 'Senior',mult: 1.45, years: '8–15 yrs' },
  { label: 'Lead',  mult: 1.90, years: '15+ yrs' },
]

function SalaryArc({ career, color }) {
  const mid = salaryMid(career)
  if (!mid) return <p className="text-xs text-muted font-body italic">Salary data unavailable</p>

  return (
    <div>
      <div className="flex items-end gap-1 h-16 mt-2">
        {SALARY_STAGES.map((s, i) => {
          const val = Math.round(mid * s.mult)
          const heightPct = 25 + 75 * (i / (SALARY_STAGES.length - 1))
          return (
            <div key={s.label} className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs font-body" style={{ color, fontSize: 10 }}>{fmt(val)}</span>
              <div
                style={{ background: color, opacity: 0.15 + 0.2 * i, borderRadius: '4px 4px 0 0', width: '100%', height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1 mt-1">
        {SALARY_STAGES.map(s => (
          <div key={s.label} className="flex-1 text-center">
            <span className="font-body" style={{ fontSize: 9, color: '#64748b' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Demand dot ───────────────────────────────────────────────────────────────
const DEMAND_COLOR = { High: '#22c55e', Moderate: '#ffb705', Low: '#ef4444', Varies: '#8b5cf6' }
function DemandDot({ level }) {
  const color = DEMAND_COLOR[level] ?? '#64748b'
  return (
    <span className="inline-flex items-center gap-1.5 font-body text-xs" style={{ color }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {level ?? '—'}
    </span>
  )
}

// ─── Row component ────────────────────────────────────────────────────────────
function Row({ label, children, shade }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: '160px repeat(3, 1fr)', background: shade ? 'rgba(1,49,71,0.025)' : 'transparent' }}>
      <div className="px-4 py-3 flex items-center">
        <span className="font-body text-xs font-semibold text-muted uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Cell({ children }) {
  return (
    <div className="px-4 py-3 border-l border-cborder">
      {children}
    </div>
  )
}

// ─── Score bar (mini) ─────────────────────────────────────────────────────────
function MiniBar({ value, color }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(value), 300); return () => clearTimeout(t) }, [value])
  return (
    <div className="flex items-center gap-2">
      <div style={{ flex: 1, background: '#e8f4fa', borderRadius: 999, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${w}%`, background: color, height: '100%', borderRadius: 999, transition: 'width 1s ease' }} />
      </div>
      <span className="font-body text-xs font-bold" style={{ color, minWidth: 32 }}>{value}%</span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const CARD_COLORS = ['#229ebc', '#fb8403', '#8b5cf6']

export default function CareerComparison({ matches, report }) {
  const [activeTab, setActiveTab] = useState(null)

  // Top 3 blended careers
  const top3 = matches
    .filter(m => m.match_type === 'blended')
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    .slice(0, 3)

  if (top3.length === 0) return null

  const skillsPrograms = report?.ai_skills_programs ?? {}
  const demand         = report?.ai_demand          ?? {}

  const DEMAND_REGIONS = ['UAE_MENA', 'North_America', 'Europe', 'South_Asia']
  const DEMAND_LABELS  = { UAE_MENA: 'UAE / MENA', North_America: 'North America', Europe: 'Europe', South_Asia: 'South Asia' }

  return (
    <section id="comparison" className="report-section max-w-5xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 pl-6 mb-8" style={{ borderColor: '#8b5cf6' }}>
        <h2 className="font-display text-3xl text-navy">Career Comparison</h2>
        <p className="text-muted font-body mt-2">Side-by-side breakdown of your top 3 matches</p>
      </div>

      {/* ── Sticky column headers ───────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e0f0f8', boxShadow: '0 4px 24px rgba(1,49,71,0.08)' }}>
        {/* Header row */}
        <div className="grid sticky top-16 z-20" style={{ gridTemplateColumns: '160px repeat(3, 1fr)', background: '#013147' }}>
          <div className="px-4 py-5" />
          {top3.map((career, i) => (
            <div key={career.soc_code} className="px-4 py-5 border-l border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: CARD_COLORS[i], display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', fontFamily: 'Montserrat, sans-serif' }}>
                  #{i + 1}
                </span>
                <span style={{ color: CARD_COLORS[i], fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {career.match_score}% match
                </span>
              </div>
              <h3 className="font-display text-white" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{career.title}</h3>
            </div>
          ))}
        </div>

        {/* ── Match Scores ─────────────────────────────────── */}
        <Row label="Overall Fit" shade>
          {top3.map((c, i) => (
            <Cell key={c.soc_code}>
              <MiniBar value={c.match_score ?? 0} color={CARD_COLORS[i]} />
            </Cell>
          ))}
        </Row>

        {/* ── Salary Range ─────────────────────────────────── */}
        <Row label="Salary Range">
          {top3.map(c => (
            <Cell key={c.soc_code}>
              <span className="font-body text-sm font-semibold text-navy">
                {(c.salary_usd_low && c.salary_usd_high)
                  ? `${fmt(c.salary_usd_low)} – ${fmt(c.salary_usd_high)}`
                  : '—'}
              </span>
              <span className="font-body text-xs text-muted block">USD / year</span>
            </Cell>
          ))}
        </Row>

        {/* ── Salary Trajectory ────────────────────────────── */}
        <Row label="Salary Arc" shade>
          {top3.map((c, i) => (
            <Cell key={c.soc_code}>
              <SalaryArc career={c} color={CARD_COLORS[i]} />
            </Cell>
          ))}
        </Row>

        {/* ── Must-have Subjects ───────────────────────────── */}
        <Row label="Key Subjects">
          {top3.map(c => {
            const sp = skillsPrograms[c.soc_code] ?? {}
            const subjects = [...(sp.subjects_must ?? []), ...(sp.subjects_recommended ?? [])].slice(0, 3)
            return (
              <Cell key={c.soc_code}>
                {subjects.length ? (
                  <div className="flex flex-wrap gap-1">
                    {subjects.map((s, i) => (
                      <span key={i} style={{ display: 'inline-block', background: 'rgba(34,158,188,0.1)', color: '#1a7a93', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  !report ? <Spinner size="sm" /> : <span className="text-xs text-muted font-body italic">Unavailable</span>
                )}
              </Cell>
            )
          })}
        </Row>

        {/* ── Top Skills ───────────────────────────────────── */}
        <Row label="Skills to Build" shade>
          {top3.map(c => {
            const skills = (skillsPrograms[c.soc_code]?.skills ?? []).slice(0, 3)
            return (
              <Cell key={c.soc_code}>
                {skills.length ? (
                  <ul className="space-y-1">
                    {skills.map((s, i) => (
                      <li key={i} className="font-body text-xs text-navy flex items-start gap-1.5">
                        <span style={{ color: '#fb8403', marginTop: 2 }}>▸</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !report ? <Spinner size="sm" /> : <span className="text-xs text-muted font-body italic">Unavailable</span>
                )}
              </Cell>
            )
          })}
        </Row>

        {/* ── Degree Programs ──────────────────────────────── */}
        <Row label="Degree Path">
          {top3.map(c => {
            const progs = (skillsPrograms[c.soc_code]?.programs ?? []).slice(0, 2)
            return (
              <Cell key={c.soc_code}>
                {progs.length ? (
                  <div className="space-y-1">
                    {progs.map((p, i) => (
                      <div key={i} style={{ background: 'rgba(139,92,246,0.07)', borderRadius: 8, padding: '4px 8px' }}>
                        <span className="font-body text-xs text-navy">{p}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  !report ? <Spinner size="sm" /> : <span className="text-xs text-muted font-body italic">Unavailable</span>
                )}
              </Cell>
            )
          })}
        </Row>

        {/* ── Job Demand ───────────────────────────────────── */}
        {DEMAND_REGIONS.map((region, ri) => (
          <Row key={region} label={DEMAND_LABELS[region]} shade={ri % 2 === 0}>
            {top3.map(c => {
              const d = demand[c.soc_code]
              return (
                <Cell key={c.soc_code}>
                  {d
                    ? <DemandDot level={d[region]} />
                    : !report
                      ? <Spinner size="sm" />
                      : <span className="text-xs text-muted font-body">—</span>
                  }
                </Cell>
              )
            })}
          </Row>
        ))}

        {/* ── Job Zone ─────────────────────────────────────── */}
        <Row label="Education Level">
          {top3.map(c => (
            <Cell key={c.soc_code}>
              <span className="font-body text-sm text-navy">
                {c.job_zone ? `Zone ${c.job_zone}` : '—'}
              </span>
              <span className="font-body text-xs text-muted block">
                {c.job_zone === 1 ? 'Little/no prep'
                  : c.job_zone === 2 ? 'Some prep'
                  : c.job_zone === 3 ? 'Medium prep'
                  : c.job_zone === 4 ? 'Considerable prep'
                  : c.job_zone === 5 ? 'Extensive prep'
                  : ''}
              </span>
            </Cell>
          ))}
        </Row>
      </div>

      <p className="text-xs text-muted font-body mt-4 text-center">
        Salary data in USD. Salary arc shows approximate income trajectory — actual figures vary significantly by location, specialisation, and employer.
      </p>
    </section>
  )
}
