import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

// ─── Color palette ───────────────────────────────────────────────────────────
const C = {
  navy:   '#013147',
  teal:   '#229ebc',
  tealDark: '#1a7a93',
  orange: '#fb8403',
  yellow: '#ffb705',
  green:  '#22c55e',
  purple: '#8b5cf6',
  pink:   '#ec4899',
  bg:     '#f0f8ff',
  card:   '#ffffff',
  muted:  '#64748b',
  border: '#e0f0f8',
}

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pill(bg, color, text, size = 12) {
  return {
    display: 'inline-block',
    background: bg,
    color,
    borderRadius: 999,
    padding: size <= 12 ? '3px 10px' : '6px 16px',
    fontSize: size,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
  }
}

function card(extra = {}) {
  return {
    background: C.card,
    borderRadius: 20,
    boxShadow: '0 4px 24px rgba(1,49,71,0.09)',
    border: `1px solid ${C.border}`,
    ...extra,
  }
}

const DIFFICULTY_COLORS = {
  Easy: { bg: '#f0fdf4', color: '#16a34a' },
  Medium: { bg: '#fffde7', color: '#b45309' },
  Ambitious: { bg: '#fdf4ff', color: '#9333ea' },
}

const CATEGORY_ICON = {
  'Internship': '💼',
  'Competition': '🏆',
  'Project': '🔨',
  'Volunteering': '🤝',
  'Online Course': '💻',
  'Club/Society': '🎓',
}

// ─── COUNTRIES ───────────────────────────────────────────────────────────────
const COUNTRIES = ['UAE', 'UK', 'USA', 'Canada', 'Australia', 'Netherlands', 'Germany', 'Singapore', 'Other']

// ─── TIMELINES ───────────────────────────────────────────────────────────────
const TIMELINES = [
  { value: 'Committed (5+ years focused effort)',     label: 'Committed', icon: '🚀', sub: '5+ years focused' },
  { value: 'Exploring (flexible, open to changes)',   label: 'Exploring', icon: '🔭', sub: 'Flexible path' },
  { value: 'Fast-track (accelerated, intense focus)', label: 'Fast-track', icon: '⚡', sub: 'Accelerated' },
  { value: 'Balanced (career + other pursuits)',      label: 'Balanced', icon: '⚖️', sub: 'Career + life' },
]

// ─── PRIORITIES ──────────────────────────────────────────────────────────────
const PRIORITIES = [
  { value: 'Financial success first', label: 'Financial', icon: '💰', color: C.yellow },
  { value: 'Impact & purpose driven',  label: 'Impact',    icon: '🌍', color: C.green },
  { value: 'Work-life balance',        label: 'Balance',   icon: '🌿', color: C.teal },
  { value: 'Innovation & creativity',  label: 'Innovation',icon: '💡', color: C.purple },
  { value: 'Prestige & recognition',   label: 'Prestige',  icon: '🏅', color: C.orange },
]

// ─── Generation steps ────────────────────────────────────────────────────────
const GEN_STEPS = [
  { icon: '🔍', label: 'Analysing your profile...' },
  { icon: '🎯', label: 'Matching career fit...' },
  { icon: '📚', label: 'Mapping subject roadmap...' },
  { icon: '🏛️', label: 'Selecting universities...' },
  { icon: '🗓️', label: 'Building your timeline...' },
  { icon: '⚡', label: 'Generating quick-start plan...' },
]

// ─── Animated score bar ───────────────────────────────────────────────────────
function ScoreBar({ label, value, color, delay = 0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 400 + delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: C.navy, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color, fontFamily: 'Montserrat, sans-serif' }}>{value}%</span>
      </div>
      <div style={{ background: '#e8f4fa', borderRadius: 999, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${width}%`, background: color, height: '100%', borderRadius: 999, transition: 'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  )
}

// ─── Timeline node ───────────────────────────────────────────────────────────
function TimelineNode({ icon, title, items, color, index, total }) {
  return (
    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
      {/* Left connector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: `0 4px 14px ${color}55`, flexShrink: 0 }}>
          {icon}
        </div>
        {index < total - 1 && (
          <div style={{ width: 2, flexGrow: 1, background: `linear-gradient(to bottom, ${color}88, transparent)`, minHeight: 32, marginTop: 4 }} />
        )}
      </div>
      {/* Content */}
      <div style={{ paddingLeft: 16, paddingBottom: 32, flex: 1 }}>
        <h4 style={{ margin: 0, marginBottom: 10, fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: 'Montserrat, sans-serif' }}>{title}</h4>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {(items || []).map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: C.muted, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
              <span style={{ color, flexShrink: 0, marginTop: 2 }}>▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Chip selector ────────────────────────────────────────────────────────────
function ChipSelector({ options, selected, onToggle, single = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {options.map(opt => {
        const isSelected = single ? selected === opt.value : selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            style={{
              border: isSelected ? `2px solid ${opt.color || C.teal}` : `2px solid ${C.border}`,
              background: isSelected ? `${opt.color || C.teal}18` : C.card,
              color: isSelected ? (opt.color || C.teal) : C.navy,
              borderRadius: 14,
              padding: '10px 18px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: isSelected ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.sub && <span style={{ fontSize: 11, opacity: 0.7 }}>{opt.sub}</span>}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CareerBuilder() {
  const { assessment_id } = useParams()
  const navigate = useNavigate()

  // Data
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [topCareers, setTopCareers] = useState([])

  // Step
  const [step, setStep] = useState(1)

  // Step 1
  const [selectedCareer, setSelectedCareer] = useState(null)

  // Step 2
  const [targetCountry, setTargetCountry] = useState('UAE')
  const [timeline, setTimeline] = useState('')
  const [priority, setPriority] = useState('')

  // Step 3
  const [genStep, setGenStep] = useState(0)
  const [genDone, setGenDone] = useState(false)

  // Step 4
  const [roadmap, setRoadmap] = useState(null)
  const [error, setError] = useState(null)

  const genInterval = useRef(null)

  // ── Load top careers ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!assessment_id) { navigate('/'); return }
    loadData()
  }, [assessment_id])

  async function loadData() {
    setLoading(true)
    try {
      const { data: assessment } = await supabase
        .from('assessments')
        .select('*, students(*)')
        .eq('id', assessment_id)
        .single()

      if (!assessment) throw new Error('Assessment not found')
      setStudent(assessment.students)

      // Get top blended matches
      const { data: matches } = await supabase
        .from('career_matches')
        .select('match_score, match_type, careers(title, description, soc_code)')
        .eq('assessment_id', assessment_id)
        .eq('match_type', 'blended')
        .order('match_score', { ascending: false })
        .limit(5)

      if (matches) {
        setTopCareers(matches.map(m => ({
          title: m.careers?.title,
          description: m.careers?.description,
          soc_code: m.careers?.soc_code,
          score: m.match_score,
        })).filter(c => c.title))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Generate roadmap ──────────────────────────────────────────────────────
  async function generateRoadmap() {
    setStep(3)
    setGenStep(0)
    setGenDone(false)

    // Animate generation steps
    let i = 0
    genInterval.current = setInterval(() => {
      i++
      if (i < GEN_STEPS.length) setGenStep(i)
      else clearInterval(genInterval.current)
    }, 1200)

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/career-builder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify({
          assessment_id,
          selected_career: selectedCareer.title,
          target_country: targetCountry,
          timeline,
          priority,
        }),
      })

      clearInterval(genInterval.current)
      const data = await res.json()

      if (!res.ok || data.error) throw new Error(data.error || 'Generation failed')

      setRoadmap(data.roadmap)
      setGenDone(true)

      // Brief pause then show roadmap
      setTimeout(() => setStep(4), 1200)
    } catch (e) {
      clearInterval(genInterval.current)
      setError(e.message)
      setStep(2)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
        <p style={{ color: C.teal, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 18 }}>Loading Career Builder...</p>
      </div>
    </div>
  )

  if (error && step !== 2) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...card({ padding: 40, textAlign: 'center', maxWidth: 480 }) }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: C.navy, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Something went wrong</p>
        <p style={{ color: C.muted, fontFamily: 'Inter, sans-serif', fontSize: 14, marginBottom: 24 }}>{error}</p>
        <button onClick={() => { setError(null); setStep(1) }} style={{ background: C.orange, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1a4a63 60%, ${C.tealDark} 100%)`, padding: '32px 24px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>🗺️</span>
            <div>
              <h1 style={{ margin: 0, color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 26 }}>Career Builder</h1>
              {student && <p style={{ margin: 0, color: '#8ec9e6', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>For {student.full_name}</p>}
            </div>
          </div>

          {/* Step indicator */}
          {step < 4 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 20 }}>
              {['Choose Career', 'Set Preferences', 'Generating', 'Your Roadmap'].map((label, i) => {
                const idx = i + 1
                const isActive = step === idx
                const isDone = step > idx
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: isActive ? C.orange : isDone ? '#229ebc22' : 'rgba(255,255,255,0.1)',
                      borderRadius: 999,
                      padding: '5px 12px',
                      transition: 'all 0.3s ease',
                    }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: isActive ? '#fff' : isDone ? C.teal : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: isActive ? C.orange : isDone ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                        {isDone ? '✓' : idx}
                      </span>
                      <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : isDone ? '#8ec9e6' : 'rgba(255,255,255,0.5)' }}>
                        {label}
                      </span>
                    </div>
                    {i < 3 && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>›</span>}
                  </div>
                )
              })}
            </div>
          )}

          {step === 4 && roadmap && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
              <div style={{ ...pill('#fb840333', C.orange, `🎯 ${selectedCareer?.title}`, 13) }} />
              <div style={{ ...pill('#229ebc22', C.teal, `🌍 ${targetCountry}`, 13) }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STEP 1 — Career Selection                                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ margin: 0, color: C.navy, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 24 }}>Which career do you want to explore?</h2>
              <p style={{ margin: '8px 0 0', color: C.muted, fontFamily: 'Inter, sans-serif', fontSize: 15 }}>Your top 5 matches from the assessment</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topCareers.map((career, i) => {
                const isSelected = selectedCareer?.title === career.title
                const colors = [C.teal, C.orange, C.purple, C.green, C.pink]
                const color = colors[i % colors.length]
                return (
                  <button
                    key={career.title}
                    onClick={() => setSelectedCareer(career)}
                    style={{
                      ...card({ padding: '20px 24px', textAlign: 'left', cursor: 'pointer', border: isSelected ? `2px solid ${color}` : `2px solid ${C.border}`, background: isSelected ? `${color}08` : C.card, transition: 'all 0.2s ease', width: '100%' }),
                      display: 'flex', alignItems: 'center', gap: 20,
                    }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${color}33, ${color}66)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 18, color, flexShrink: 0 }}>
                      #{i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 17, color: C.navy }}>{career.title}</h3>
                        <span style={{ ...pill(`${color}22`, color, `${career.score}% match`, 11) }} />
                      </div>
                      {career.description && (
                        <p style={{ margin: 0, fontSize: 13, color: C.muted, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                          {career.description.slice(0, 120)}{career.description.length > 120 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, flexShrink: 0 }}>✓</div>
                    )}
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedCareer}
                style={{ background: selectedCareer ? C.orange : '#ccc', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 36px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, cursor: selectedCareer ? 'pointer' : 'not-allowed', boxShadow: selectedCareer ? `0 4px 20px ${C.orange}55` : 'none', transition: 'all 0.2s ease' }}
              >
                Next: Set Preferences →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STEP 2 — Preferences                                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ margin: 0, color: C.navy, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 24 }}>Personalise your roadmap</h2>
              <p style={{ margin: '8px 0 0', color: C.muted, fontFamily: 'Inter, sans-serif', fontSize: 15 }}>Tell us where you want to study and what drives you</p>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: '#dc2626', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                ⚠️ {error} — please try again.
              </div>
            )}

            {/* Country */}
            <div style={{ ...card({ padding: '24px' }), marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: C.navy }}>🌍 Target Country</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {COUNTRIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setTargetCountry(c)}
                    style={{ border: targetCountry === c ? `2px solid ${C.teal}` : `2px solid ${C.border}`, background: targetCountry === c ? `${C.teal}18` : C.card, color: targetCountry === c ? C.teal : C.navy, borderRadius: 12, padding: '8px 18px', fontFamily: 'Inter, sans-serif', fontWeight: targetCountry === c ? 600 : 400, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ ...card({ padding: '24px' }), marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: C.navy }}>⏱️ Your Career Timeline</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {TIMELINES.map(t => {
                  const isSelected = timeline === t.value
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTimeline(t.value)}
                      style={{ border: isSelected ? `2px solid ${C.teal}` : `2px solid ${C.border}`, background: isSelected ? `${C.teal}10` : C.card, borderRadius: 14, padding: '14px 16px', fontFamily: 'Inter, sans-serif', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                      <div style={{ fontWeight: 700, color: isSelected ? C.teal : C.navy, fontSize: 14, marginBottom: 3 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{t.sub}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Priority */}
            <div style={{ ...card({ padding: '24px' }), marginBottom: 28 }}>
              <h3 style={{ margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: C.navy }}>🎯 Your Career Priority</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {PRIORITIES.map(p => {
                  const isSelected = priority === p.value
                  return (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      style={{ border: isSelected ? `2px solid ${p.color}` : `2px solid ${C.border}`, background: isSelected ? `${p.color}18` : C.card, color: isSelected ? p.color : C.navy, borderRadius: 999, padding: '10px 18px', fontFamily: 'Inter, sans-serif', fontWeight: isSelected ? 600 : 400, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ background: 'transparent', color: C.navy, border: `2px solid ${C.border}`, borderRadius: 14, padding: '12px 24px', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                ← Back
              </button>
              <button
                onClick={generateRoadmap}
                disabled={!timeline || !priority}
                style={{ background: !timeline || !priority ? '#ccc' : `linear-gradient(135deg, ${C.orange}, #ff6b2b)`, color: '#fff', border: 'none', borderRadius: 14, padding: '14px 36px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, cursor: !timeline || !priority ? 'not-allowed' : 'pointer', boxShadow: timeline && priority ? `0 4px 20px ${C.orange}55` : 'none', transition: 'all 0.2s' }}
              >
                🚀 Build My Roadmap
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STEP 3 — Generation                                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 24, animation: 'spin 3s linear infinite' }}>🗺️</div>
            <h2 style={{ margin: '0 0 8px', color: C.navy, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 24 }}>
              Building your roadmap for <span style={{ color: C.teal }}>{selectedCareer?.title}</span>
            </h2>
            <p style={{ margin: '0 0 40px', color: C.muted, fontFamily: 'Inter, sans-serif', fontSize: 15 }}>This takes about 30–60 seconds — sit tight!</p>

            <div style={{ maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {GEN_STEPS.map((s, i) => {
                const isDone = i < genStep
                const isActive = i === genStep
                return (
                  <div key={i} style={{ ...card({ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, opacity: i > genStep ? 0.4 : 1, transition: 'all 0.4s', border: isActive ? `2px solid ${C.teal}` : `2px solid ${C.border}` }) }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <span style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 14, color: isActive ? C.teal : C.navy, fontWeight: isActive ? 600 : 400 }}>{s.label}</span>
                    {isDone && <span style={{ color: C.green, fontSize: 18 }}>✓</span>}
                    {isActive && !genDone && (
                      <span style={{ width: 18, height: 18, border: `2px solid ${C.teal}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    )}
                  </div>
                )
              })}
            </div>

            {genDone && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <p style={{ color: C.green, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 18 }}>Roadmap ready!</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STEP 4 — Roadmap Display                                        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {step === 4 && roadmap && (
          <div>
            {/* ── Section 1: Career Fit Breakdown ───────────────────────── */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎯</div>
                <div>
                  <h2 style={{ margin: 0, color: C.navy, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22 }}>Career Fit Breakdown</h2>
                  <p style={{ margin: 0, color: C.muted, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>How well {selectedCareer?.title} matches your profile</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                <div style={{ ...card({ padding: 24 }) }}>
                  <ScoreBar label="RIASEC Interest Match" value={roadmap.riasec_match_pct || 0} color={C.teal} delay={0} />
                  <ScoreBar label="Personality Alignment" value={roadmap.personality_match_pct || 0} color={C.purple} delay={200} />
                  <ScoreBar label="Values Compatibility" value={roadmap.values_match_pct || 0} color={C.orange} delay={400} />
                  <div style={{ borderTop: `2px solid ${C.border}`, paddingTop: 16, marginTop: 4 }}>
                    <ScoreBar label="Overall Fit Score" value={roadmap.overall_fit_pct || 0} color={C.green} delay={600} />
                  </div>
                </div>
                <div style={{ ...card({ padding: 24, background: `linear-gradient(135deg, ${C.teal}0d, ${C.teal}06)` }) }}>
                  <h4 style={{ margin: '0 0 12px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: C.navy, fontSize: 15 }}>Why this career fits you</h4>
                  <p style={{ margin: 0, color: C.navy, fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.7 }}>
                    {roadmap.fit_explanation || 'This career aligns well with your assessment results.'}
                  </p>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ ...pill(`${C.green}22`, C.green, `${roadmap.overall_fit_pct || 0}% Overall Match`, 13) }} />
                    <span style={{ ...pill(`${C.teal}22`, C.teal, targetCountry, 13) }} />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section 2: Subject Roadmap ─────────────────────────────── */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.orange}, #ff6b2b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📚</div>
                <div>
                  <h2 style={{ margin: 0, color: C.navy, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22 }}>Subject Roadmap</h2>
                  <p style={{ margin: 0, color: C.muted, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Essential and recommended subjects for your curriculum</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{ ...card({ padding: 24 }) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange, display: 'inline-block' }} />
                    <h4 style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: C.navy }}>Must-Have Subjects</h4>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(roadmap.must_have_subjects || []).map((s, i) => (
                      <span key={i} style={{ ...pill(`${C.orange}18`, C.orange, s, 12) }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ ...card({ padding: 24 }) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, display: 'inline-block' }} />
                    <h4 style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: C.navy }}>Recommended Subjects</h4>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(roadmap.recommended_subjects || []).map((s, i) => (
                      <span key={i} style={{ ...pill(`${C.teal}18`, C.teal, s, 12) }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              {roadmap.subject_advice && (
                <div style={{ ...card({ padding: 20, marginTop: 16, background: `${C.yellow}10`, border: `1px solid ${C.yellow}33` }) }}>
                  <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.navy, lineHeight: 1.7 }}>
                    💡 {roadmap.subject_advice}
                  </p>
                </div>
              )}
            </section>

            {/* ── Section 3: University Pathway ─────────────────────────── */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏛️</div>
                <div>
                  <h2 style={{ margin: 0, color: C.navy, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22 }}>University Pathway</h2>
                  <p style={{ margin: 0, color: C.muted, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Three tiers for {targetCountry}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Reach', key: 'reach', icon: '🌟', color: '#8b5cf6', noteKey: 'reach_note' },
                  { label: 'Target', key: 'target', icon: '🎯', color: C.teal, noteKey: 'target_note' },
                  { label: 'Safety', key: 'safety', icon: '✅', color: C.green, noteKey: 'safety_note' },
                ].map(tier => (
                  <div key={tier.key} style={{ ...card({ padding: 22 }) }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 20 }}>{tier.icon}</span>
                      <div>
                        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: tier.color, display: 'block' }}>{tier.label}</span>
                        <span style={{ fontSize: 11, color: C.muted, fontFamily: 'Inter, sans-serif' }}>Universities</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                      {(roadmap[`${tier.key}_universities`] || []).map((uni, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: `${tier.color}0a`, borderRadius: 10 }}>
                          <span style={{ color: tier.color, fontSize: 12 }}>●</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.navy }}>{uni}</span>
                        </div>
                      ))}
                    </div>
                    {roadmap[tier.noteKey] && (
                      <p style={{ margin: 0, fontSize: 12, color: C.muted, fontFamily: 'Inter, sans-serif', lineHeight: 1.5, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                        {roadmap[tier.noteKey]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ── Section 4: Skills Timeline ─────────────────────────────── */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.green}, #15803d)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🗓️</div>
                <div>
                  <h2 style={{ margin: 0, color: C.navy, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22 }}>Skills Timeline</h2>
                  <p style={{ margin: 0, color: C.muted, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Your journey from now to first job</p>
                </div>
              </div>
              <div style={{ ...card({ padding: '28px 28px 8px' }) }}>
                {[
                  { icon: '📍', title: 'Right Now', items: roadmap.timeline_now, color: C.teal },
                  { icon: '📈', title: 'Senior Years (Y11–13)', items: roadmap.timeline_senior, color: C.orange },
                  { icon: '🎓', title: 'University Years', items: roadmap.timeline_university, color: C.purple },
                  { icon: '💼', title: 'Landing Your First Job', items: roadmap.timeline_firstjob, color: C.green },
                ].map((node, i, arr) => (
                  <TimelineNode key={i} {...node} index={i} total={arr.length} />
                ))}
              </div>
            </section>

            {/* ── Section 5: Experience Builder ──────────────────────────── */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.yellow}, #d97706)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
                <div>
                  <h2 style={{ margin: 0, color: C.navy, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22 }}>Experience Builder</h2>
                  <p style={{ margin: 0, color: C.muted, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>6 hands-on activities to build your profile</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {(roadmap.experiences || []).map((exp, i) => {
                  const diff = DIFFICULTY_COLORS[exp.difficulty] || DIFFICULTY_COLORS.Medium
                  const icon = CATEGORY_ICON[exp.category] || '📌'
                  return (
                    <div key={i} style={{ ...card({ padding: 20 }) }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{icon}</span>
                          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13, color: C.navy }}>{exp.category}</span>
                        </div>
                        <span style={{ ...pill(diff.bg, diff.color, exp.difficulty, 11) }} />
                      </div>
                      <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{exp.suggestion}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ── Section 6: 30-Day Quick Start ───────────────────────────── */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ ...card({ padding: 28, background: `linear-gradient(135deg, ${C.navy} 0%, #1a4a63 100%)` }) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.orange}, #ff6b2b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚀</div>
                  <div>
                    <h2 style={{ margin: 0, color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22 }}>30-Day Quick Start</h2>
                    <p style={{ margin: 0, color: '#8ec9e6', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Three actions to kickstart your journey this month</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(roadmap.quick_start || []).map((qs, i) => {
                    const timeLabels = ['This Week', 'This Month', 'This Term']
                    const timeColors = [C.orange, C.yellow, C.teal]
                    return (
                      <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: timeColors[i] || C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div>
                          <span style={{ ...pill(`${timeColors[i] || C.teal}33`, timeColors[i] || C.teal, timeLabels[i] || `Step ${i+1}`, 11), marginBottom: 6, display: 'inline-block' }} />
                          <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.6 }}>
                            {qs.replace(/^Action \d+:\s*/i, '')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 40 }}>
              <button
                onClick={() => { setStep(1); setSelectedCareer(null); setRoadmap(null) }}
                style={{ background: 'transparent', color: C.navy, border: `2px solid ${C.border}`, borderRadius: 14, padding: '12px 24px', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}
              >
                🔄 Build Another
              </button>
              <button
                onClick={() => navigate(`/report/${assessment_id}`)}
                style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 14, padding: '12px 24px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 4px 16px ${C.teal}44` }}
              >
                📊 View Full Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
