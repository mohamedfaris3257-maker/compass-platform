import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { riasecQuestions, riasecScale } from '../data/riasec-questions'
import { bigfiveQuestions, bigfiveScale } from '../data/bigfive-questions'
import { calculateRiasecScores, getTop3, getFullOrder, calculateOceanScores } from '../services/scoring'
import { supabase } from '../services/supabase'
import { useToast } from '../components/ui/Toast'
import ProgressHeader from '../components/assessment/ProgressHeader'
import QuestionCard from '../components/assessment/QuestionCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { calculateAge } from '../utils/ageCalc'

// Fisher-Yates shuffle
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const CURRICULA = ['IB', 'IGCSE', 'A-Levels', 'US Curriculum', 'Indian Curriculum', 'Other']
const GRADES    = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'Other']
const RIASEC_PER_PAGE = 5
const BF_PER_PAGE     = 5

// Step 0 — known interest areas (optional, used for Adjacent Pathways report section)
const KNOWN_INTERESTS_OPTIONS = [
  { emoji: '💻', label: 'Technology & Computing' },
  { emoji: '🏥', label: 'Healthcare & Medicine' },
  { emoji: '🎨', label: 'Arts & Creative Design' },
  { emoji: '💼', label: 'Business & Entrepreneurship' },
  { emoji: '🔬', label: 'Science & Research' },
  { emoji: '📚', label: 'Education & Teaching' },
  { emoji: '⚖️', label: 'Law & Policy' },
  { emoji: '🔧', label: 'Engineering & Architecture' },
  { emoji: '🌿', label: 'Environment & Sustainability' },
  { emoji: '🎬', label: 'Media & Entertainment' },
  { emoji: '💰', label: 'Finance & Economics' },
  { emoji: '✈️', label: 'Aviation & Tourism' },
]

// Step 3 data
const VALUES_OPTIONS = [
  'Making a social impact', 'Innovation & creativity', 'Financial success',
  'Helping people directly', 'Building/creating things', 'Advancing knowledge',
  'Leadership & influence', 'Stability & security', 'Entrepreneurship', 'Environmental sustainability',
]
const WORK_PREF_OPTIONS = [
  'Problem solving & analytical work', 'Technical & hands-on work', 'People & communication focused',
  'Creative & design work', 'Research & deep thinking', 'Management & organization',
  'Outdoor / fieldwork', 'Remote / independent work', 'Fast-paced & dynamic', 'Structured & predictable',
]

// Step 4 data
const HOBBIES_OPTIONS = [
  { emoji: '🎨', label: 'Art & Design' },
  { emoji: '📸', label: 'Photography' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🎭', label: 'Drama/Theatre' },
  { emoji: '✍️', label: 'Writing' },
  { emoji: '📚', label: 'Reading' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '🏃', label: 'Sports' },
  { emoji: '🤖', label: 'Robotics/Tech' },
  { emoji: '🔬', label: 'Science experiments' },
  { emoji: '🌿', label: 'Nature/Environment' },
  { emoji: '💻', label: 'Coding' },
  { emoji: '🎬', label: 'Film/Video' },
  { emoji: '🍳', label: 'Cooking' },
  { emoji: '🧩', label: 'Puzzles/Strategy' },
  { emoji: '🌍', label: 'Travel/Languages' },
  { emoji: '💰', label: 'Business/Entrepreneurship' },
  { emoji: '🎤', label: 'Public speaking/Debate' },
  { emoji: '🏋️', label: 'Fitness' },
  { emoji: '🎸', label: 'Instruments' },
]
const GOALS_OPTIONS = [
  'Working with technology', 'Helping/healing people', 'Creating art or media',
  'Running a business', 'Doing research or science', 'Teaching or mentoring',
  'Working in finance', 'Building physical things', 'Protecting the environment',
  'Working in law or policy', 'Working in sports or entertainment', 'Not sure yet',
]

// ── Shared white page background ──────────────────────────────────────────────
const pageBg = {
  minHeight: 'calc(100vh - 64px)',
  background: '#fff',
  paddingBottom: 80,
}

// Clean card style
const cardStyle = {
  background: '#fff',
  border: '1.5px solid #e8eef4',
  borderRadius: 20,
  padding: '28px',
  boxShadow: '0 2px 16px rgba(1,49,71,0.06)',
}

// Standard input style (light)
const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: '#fff',
  border: '1.5px solid #e2e8f0',
  borderRadius: 12,
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  color: '#013147',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#64748b',
  fontFamily: 'Inter, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 8,
}

function onFocus(e)  { e.target.style.borderColor = '#229ebc' }
function onBlur(e)   { e.target.style.borderColor = '#e2e8f0' }

// ── Step badge ─────────────────────────────────────────────────────────────────
function StepBadge({ current, total }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#e8f6fb', border: '1px solid rgba(34,158,188,0.25)',
      borderRadius: 999, padding: '5px 14px', marginBottom: 16,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#229ebc', display: 'inline-block' }} />
      <span style={{ fontSize: 11, color: '#229ebc', fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>
        STEP {current} OF {total}
      </span>
    </div>
  )
}

// ── Step heading ───────────────────────────────────────────────────────────────
function StepHeading({ title, highlight, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{
        fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.65rem',
        color: '#013147', margin: '0 0 8px 0', lineHeight: 1.2,
      }}>
        {title}{highlight && (
          <> <span style={{ color: '#229ebc' }}>{highlight}</span></>
        )}
      </h2>
      {sub && (
        <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ── Section heading ────────────────────────────────────────────────────────────
function SectionHeading({ title, sub, counter }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ width: 3, height: 22, background: 'linear-gradient(to bottom, #229ebc, #1a7a93)', borderRadius: 4, flexShrink: 0 }} />
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#013147', margin: 0 }}>
          {title}
        </h3>
        {counter && (
          <span style={{ fontSize: 11, color: '#229ebc', fontFamily: 'IBM Plex Mono, monospace', background: '#e8f6fb', padding: '2px 8px', borderRadius: 6 }}>
            {counter}
          </span>
        )}
      </div>
      {sub && <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: '13px', margin: 0, paddingLeft: 13 }}>{sub}</p>}
    </div>
  )
}

// ── Chip toggle ────────────────────────────────────────────────────────────────
function ChipToggle({ label, selected, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center',
        borderRadius: '999px', padding: '8px 18px',
        fontFamily: 'Inter, sans-serif', fontWeight: selected ? 600 : 400, fontSize: '13px',
        border: selected ? '1.5px solid #229ebc' : '1.5px solid #e2e8f0',
        background: selected ? '#e8f6fb' : '#fff',
        color: selected ? '#1a7a93' : '#64748b',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(34,158,188,0.12)' : 'none',
      }}
    >
      {label}
    </button>
  )
}

// ── Emoji chip ─────────────────────────────────────────────────────────────────
function EmojiChip({ emoji, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        borderRadius: '999px', padding: '8px 16px',
        fontFamily: 'Inter, sans-serif', fontWeight: selected ? 600 : 400, fontSize: '13px',
        border: selected ? '1.5px solid #ffb705' : '1.5px solid #e2e8f0',
        background: selected ? '#fffbea' : '#fff',
        color: selected ? '#92630a' : '#64748b',
        cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(255,183,5,0.15)' : 'none',
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}

// ── Instruction banner ─────────────────────────────────────────────────────────
function InfoBanner({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24,
      padding: '12px 16px',
      background: '#f0f9ff',
      borderRadius: 12, border: '1px solid rgba(34,158,188,0.2)',
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
      <p style={{ color: '#0369a1', fontSize: 13, fontFamily: 'Inter, sans-serif', margin: 0, lineHeight: 1.6 }}>
        {children}
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Assessment() {
  const navigate = useNavigate()
  const toast    = useToast()

  const shuffledRiasec = useMemo(() => shuffle(riasecQuestions), [])

  const [step, setStep] = useState(0)
  const [studentInfo, setStudentInfo] = useState({
    full_name: '', date_of_birth: '', school_name: '', curriculum: '', grade: '', section: '',
  })
  const [riasecAnswers, setRiasecAnswers]     = useState({})
  const [bigfiveAnswers, setBigfiveAnswers]   = useState({})
  const [selectedValues,   setSelectedValues]   = useState([])
  const [selectedWorkPrefs, setSelectedWorkPrefs] = useState([])
  const [selectedHobbies,  setSelectedHobbies]  = useState([])
  const [selectedGoals,    setSelectedGoals]     = useState([])
  const [knownInterests,   setKnownInterests]   = useState([])
  const [riasecPage, setRiasecPage] = useState(0)
  const [bfPage,     setBfPage]     = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const age = studentInfo.date_of_birth ? calculateAge(studentInfo.date_of_birth) : null

  const riasecTotalPages    = Math.ceil(shuffledRiasec.length / RIASEC_PER_PAGE)
  const riasecPageQuestions = shuffledRiasec.slice(riasecPage * RIASEC_PER_PAGE, (riasecPage + 1) * RIASEC_PER_PAGE)
  const riasecPageAnswered  = riasecPageQuestions.every(q => riasecAnswers[q.id] !== undefined)
  const riasecTotalAnswered = Object.keys(riasecAnswers).length

  const bfTotalPages    = Math.ceil(bigfiveQuestions.length / BF_PER_PAGE)
  const bfPageQuestions = bigfiveQuestions.slice(bfPage * BF_PER_PAGE, (bfPage + 1) * BF_PER_PAGE)
  const bfPageAnswered  = bfPageQuestions.every(q => bigfiveAnswers[q.id] !== undefined)

  const infoValid = studentInfo.full_name && studentInfo.date_of_birth && studentInfo.school_name && studentInfo.curriculum

  const toggle = (arr, setArr, val, max = 999) => {
    if (arr.includes(val)) setArr(arr.filter(v => v !== val))
    else if (arr.length < max) setArr([...arr, val])
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const { scores: riasecScores } = calculateRiasecScores(riasecAnswers)
      const top3      = getTop3(riasecScores)
      const fullOrder = getFullOrder(riasecScores)
      const { scores: oceanScores, levels: oceanLevels } = calculateOceanScores(bigfiveAnswers)

      const { data: studentData, error: studentErr } = await supabase
        .from('students')
        .insert({
          full_name:   studentInfo.full_name,
          date_of_birth: studentInfo.date_of_birth,
          school_name: studentInfo.school_name,
          curriculum:  studentInfo.curriculum,
          grade:       studentInfo.grade || null,
          section:     studentInfo.section || null,
        })
        .select('id')
        .single()

      if (studentErr) throw studentErr

      const { data: assessmentData, error: assessmentErr } = await supabase
        .from('assessments')
        .insert({
          student_id:       studentData.id,
          riasec_raw:       riasecAnswers,
          riasec_scores:    riasecScores,
          riasec_top3:      top3,
          riasec_order:     fullOrder,
          ocean_raw:        bigfiveAnswers,
          ocean_scores:     oceanScores,
          ocean_levels:     oceanLevels,
          hobbies:          selectedHobbies.join(', '),
          hobbies_tags:     selectedHobbies,
          work_preferences: selectedWorkPrefs,
          values_alignment: selectedValues,
          self_stated_goals: selectedGoals,
          known_interests:  knownInterests,
        })
        .select('id')
        .single()

      if (assessmentErr) throw assessmentErr

      await supabase.from('reports').insert({ assessment_id: assessmentData.id, status: 'pending' })

      localStorage.setItem('compass_assessment', JSON.stringify({
        assessmentId: assessmentData.id,
        riasecScores, top3, oceanScores, oceanLevels,
      }))

      navigate(`/processing/${assessmentData.id}`)
    } catch (err) {
      console.error(err)
      toast(`Error saving your assessment: ${err.message}`, 'error')
      setSubmitting(false)
    }
  }

  // ─── STEP 0: Student Info ────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div style={pageBg}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 16px 0' }}>
          <StepBadge current={1} total={6} />
          <StepHeading
            title="Tell us about"
            highlight="yourself"
            sub="A few quick details to personalise your career report. This takes about 1 minute."
          />

          <div style={cardStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  value={studentInfo.full_name}
                  onChange={e => setStudentInfo(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Your full name"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label style={labelStyle}>Date of Birth *</label>
                <input
                  type="date"
                  value={studentInfo.date_of_birth}
                  onChange={e => setStudentInfo(p => ({ ...p, date_of_birth: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
                {age !== null && (
                  <p style={{ fontSize: 12, marginTop: 6, color: '#229ebc', fontFamily: 'Inter, sans-serif' }}>
                    Age: <strong>{age}</strong>
                  </p>
                )}
              </div>

              {/* School Name */}
              <div>
                <label style={labelStyle}>School Name *</label>
                <input
                  value={studentInfo.school_name}
                  onChange={e => setStudentInfo(p => ({ ...p, school_name: e.target.value }))}
                  placeholder="Your school's name"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Curriculum + Grade */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Curriculum *</label>
                  <select
                    value={studentInfo.curriculum}
                    onChange={e => setStudentInfo(p => ({ ...p, curriculum: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={onFocus} onBlur={onBlur}
                  >
                    <option value="">Select...</option>
                    {CURRICULA.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Grade / Year</label>
                  <select
                    value={studentInfo.grade}
                    onChange={e => setStudentInfo(p => ({ ...p, grade: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={onFocus} onBlur={onBlur}
                  >
                    <option value="">Select...</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Section (optional) */}
              <div>
                <label style={labelStyle}>
                  Section / Class{' '}
                  <span style={{ color: '#cbd5e1', fontSize: 10, textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
                </label>
                <input
                  value={studentInfo.section}
                  onChange={e => setStudentInfo(p => ({ ...p, section: e.target.value }))}
                  placeholder="e.g. 11A, Science Stream"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

            </div>
          </div>

          {/* Known Interests — optional chip selector */}
          <div style={{ ...cardStyle, marginTop: 20 }}>
            <SectionHeading
              title="Do you already know what interests you?"
              sub="Select any fields you're already drawn to (optional — skip if unsure)"
            />
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8,
            }}>
              {KNOWN_INTERESTS_OPTIONS.map(({ emoji, label }) => {
                const sel = knownInterests.includes(label)
                return (
                  <EmojiChip
                    key={label}
                    emoji={emoji}
                    label={label}
                    selected={sel}
                    onClick={() => toggle(knownInterests, setKnownInterests, label)}
                  />
                )
              })}
            </div>
            {knownInterests.length > 0 && (
              <p style={{ fontSize: 12, color: '#229ebc', fontFamily: 'Inter, sans-serif', marginTop: 10 }}>
                ✓ We'll include an Adjacent Pathways section in your report based on your selections.
              </p>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <Button
              size="lg"
              disabled={!infoValid}
              onClick={() => setStep(1)}
              style={{ width: '100%' }}
            >
              Continue to Assessment →
            </Button>
          </div>

          {/* Steps preview */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 28 }}>
            {['Info', 'Interests', 'Work Style', 'Values', 'Hobbies', 'Review'].map((s, i) => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: i === 0 ? 'linear-gradient(135deg, #229ebc, #1a7a93)' : '#f1f5f9',
                  border: i === 0 ? '2px solid #229ebc' : '2px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
                  color: i === 0 ? '#fff' : '#94a3b8',
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 9, color: i === 0 ? '#229ebc' : '#94a3b8', fontFamily: 'Inter, sans-serif', fontWeight: i === 0 ? 700 : 400 }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── STEP 1: RIASEC ─────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={pageBg}>
        <ProgressHeader
          sectionName={`Interest Themes · Page ${riasecPage + 1} of ${riasecTotalPages}`}
          currentQ={riasecTotalAnswered}
          totalQ={shuffledRiasec.length}
          onBack={() => riasecPage > 0 ? setRiasecPage(p => p - 1) : setStep(0)}
          progress={(riasecTotalAnswered / shuffledRiasec.length) * 100}
        />
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}>
          <InfoBanner>
            Rate each statement from <strong>1 (Strongly Disagree)</strong> to <strong>5 (Strongly Agree)</strong>. There are no right or wrong answers — just be honest!
          </InfoBanner>

          <QuestionCard
            questions={riasecPageQuestions}
            answers={riasecAnswers}
            onAnswer={(id, val) => setRiasecAnswers(prev => ({ ...prev, [id]: val }))}
            scaleLabels={riasecScale}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            {riasecPage > 0 && (
              <Button variant="secondary" onClick={() => setRiasecPage(p => p - 1)}>← Previous</Button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              {riasecPage < riasecTotalPages - 1
                ? <Button disabled={!riasecPageAnswered} onClick={() => setRiasecPage(p => p + 1)}>Next Page →</Button>
                : <Button disabled={!riasecPageAnswered} onClick={() => setStep(2)}>Continue to Work Style →</Button>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── STEP 2: Big Five ────────────────────────────────────────────────────────
  if (step === 2) {
    const bfAnswered = Object.keys(bigfiveAnswers).length
    return (
      <div style={pageBg}>
        <ProgressHeader
          sectionName={`Work Style · Page ${bfPage + 1} of ${bfTotalPages}`}
          currentQ={bfAnswered}
          totalQ={bigfiveQuestions.length}
          onBack={() => bfPage > 0 ? setBfPage(p => p - 1) : setStep(1)}
          progress={(bfAnswered / bigfiveQuestions.length) * 100}
        />
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}>
          <InfoBanner>
            Rate how much each statement describes <strong>your personality and work style</strong>. Answer instinctively — your first response is usually the most accurate.
          </InfoBanner>

          <QuestionCard
            questions={bfPageQuestions}
            answers={bigfiveAnswers}
            onAnswer={(id, val) => setBigfiveAnswers(prev => ({ ...prev, [id]: val }))}
            scaleLabels={bigfiveScale}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            {bfPage > 0 && (
              <Button variant="secondary" onClick={() => setBfPage(p => p - 1)}>← Previous</Button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              {bfPage < bfTotalPages - 1
                ? <Button disabled={!bfPageAnswered} onClick={() => setBfPage(p => p + 1)}>Next Page →</Button>
                : <Button disabled={!bfPageAnswered} onClick={() => setStep(3)}>Continue →</Button>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── STEP 3: Values & Work Preferences ──────────────────────────────────────
  if (step === 3) {
    return (
      <div style={pageBg}>
        <ProgressHeader
          sectionName="Your Values & Work Preferences · Section 3 of 6"
          currentQ={40} totalQ={40} onBack={() => setStep(2)} progress={100}
        />
        <div style={{ maxWidth: 660, margin: '0 auto', padding: '40px 16px' }}>
          <StepBadge current={4} total={6} />
          <StepHeading
            title="What drives"
            highlight="you?"
            sub="These signals help us match careers that align with your values and how you like to work."
          />

          {/* Values */}
          <div style={{ marginBottom: 44 }}>
            <SectionHeading
              title="What matters most to you?"
              sub="Select up to 3 values that feel most important in your future career."
              counter={selectedValues.length > 0 ? `${selectedValues.length}/3` : null}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {VALUES_OPTIONS.map(v => (
                <ChipToggle
                  key={v} label={v} selected={selectedValues.includes(v)}
                  onClick={() => toggle(selectedValues, setSelectedValues, v, 3)}
                  disabled={selectedValues.length >= 3 && !selectedValues.includes(v)}
                />
              ))}
            </div>
          </div>

          {/* Work Preferences */}
          <div style={{ marginBottom: 44 }}>
            <SectionHeading
              title="How do you prefer to work?"
              sub="Select all that apply."
              counter={selectedWorkPrefs.length > 0 ? `${selectedWorkPrefs.length} selected` : null}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {WORK_PREF_OPTIONS.map(w => (
                <ChipToggle
                  key={w} label={w} selected={selectedWorkPrefs.includes(w)}
                  onClick={() => toggle(selectedWorkPrefs, setSelectedWorkPrefs, w)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button onClick={() => setStep(4)}>Continue →</Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── STEP 4: Hobbies & Goals ─────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div style={pageBg}>
        <ProgressHeader
          sectionName="Your Interests & Goals · Section 4 of 6"
          currentQ={40} totalQ={40} onBack={() => setStep(3)} progress={100}
        />
        <div style={{ maxWidth: 660, margin: '0 auto', padding: '40px 16px' }}>
          <StepBadge current={5} total={6} />
          <StepHeading
            title="What lights you"
            highlight="up?"
            sub="Your passions and ambitions help us tailor career matches just for you."
          />

          {/* Hobbies */}
          <div style={{ marginBottom: 44 }}>
            <SectionHeading
              title="What do you enjoy in your free time?"
              sub="Select all that apply."
              counter={selectedHobbies.length > 0 ? `${selectedHobbies.length} selected` : null}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {HOBBIES_OPTIONS.map(h => (
                <EmojiChip
                  key={h.label} emoji={h.emoji} label={h.label}
                  selected={selectedHobbies.includes(h.label)}
                  onClick={() => toggle(selectedHobbies, setSelectedHobbies, h.label)}
                />
              ))}
            </div>
          </div>

          {/* Self-stated goals */}
          <div style={{ marginBottom: 44 }}>
            <SectionHeading
              title="What do you see yourself doing?"
              sub="Select up to 3 — we'll check how well your goals align with your personality profile."
              counter={selectedGoals.length > 0 ? `${selectedGoals.length}/3` : null}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {GOALS_OPTIONS.map(g => (
                <ChipToggle
                  key={g} label={g} selected={selectedGoals.includes(g)}
                  onClick={() => toggle(selectedGoals, setSelectedGoals, g, 3)}
                  disabled={selectedGoals.length >= 3 && !selectedGoals.includes(g)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" onClick={() => setStep(3)}>← Back</Button>
            <Button onClick={() => setStep(5)}>Review My Answers →</Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── STEP 5: Review & Submit ─────────────────────────────────────────────────
  return (
    <div style={pageBg}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '56px 16px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'linear-gradient(135deg, #229ebc, #1a7a93)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, margin: '0 auto 18px', boxShadow: '0 6px 24px rgba(34,158,188,0.3)',
          }}>
            🚀
          </div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.9rem', color: '#013147', margin: '0 0 8px' }}>
            Almost <span style={{ color: '#229ebc' }}>there!</span>
          </h1>
          <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: '15px', margin: 0 }}>
            Review your information, then generate your personalised career report.
          </p>
        </div>

        {/* Student Info card */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>👤</div>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#013147', margin: 0 }}>Your Information</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['Name', studentInfo.full_name],
              ['Age', age ? `${age} years old` : '—'],
              ['School', studentInfo.school_name],
              ['Curriculum', studentInfo.curriculum],
              studentInfo.grade ? ['Grade', studentInfo.grade] : null,
              studentInfo.section ? ['Section', studentInfo.section] : null,
            ].filter(Boolean).map(([k, v]) => (
              <div key={k}>
                <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                <p style={{ color: '#013147', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, margin: '3px 0 0' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment summary */}
        <div style={{ ...cardStyle, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>✅</div>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#013147', margin: 0 }}>Assessment Complete</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { icon: '🧭', text: `${shuffledRiasec.length} RIASEC interest questions answered`, done: true },
              { icon: '🧠', text: `${bigfiveQuestions.length} personality questions answered`, done: true },
              { icon: '⭐', text: selectedValues.length > 0 ? `Values: ${selectedValues.join(', ')}` : 'Values — skipped', done: selectedValues.length > 0 },
              { icon: '⚡', text: selectedWorkPrefs.length > 0 ? `${selectedWorkPrefs.length} work preferences selected` : 'Work prefs — skipped', done: selectedWorkPrefs.length > 0 },
              { icon: '🎯', text: selectedHobbies.length > 0 ? `${selectedHobbies.length} hobbies & interests selected` : 'Hobbies — skipped', done: selectedHobbies.length > 0 },
              { icon: '🚀', text: selectedGoals.length > 0 ? `Goals: ${selectedGoals.join(', ')}` : 'Goals — skipped', done: selectedGoals.length > 0 },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{item.icon}</span>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 13,
                  color: item.done ? '#013147' : '#94a3b8', flex: 1,
                }}>
                  {item.text}
                </span>
                {item.done && (
                  <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="secondary" onClick={() => setStep(4)}>← Back</Button>
          <Button
            size="lg"
            disabled={submitting}
            onClick={handleSubmit}
            style={{ minWidth: 220 }}
          >
            {submitting
              ? <><Spinner size="sm" /> Saving...</>
              : '🚀 Generate My Report'
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
