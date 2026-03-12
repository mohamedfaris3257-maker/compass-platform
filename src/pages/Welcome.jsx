import { useNavigate } from 'react-router-dom'
import CompassLogo from '../components/ui/CompassLogo'

// ─── Scrolling career ticker ──────────────────────────────────────────────────
const TICKER_ITEMS = [
  '🧬 Biomedical Engineer', '💻 Software Developer', '🏛️ Urban Planner', '🎬 Film Director',
  '🌍 Environmental Scientist', '💊 Pharmacist', '🎨 UX Designer', '📈 Financial Analyst',
  '🤖 AI Researcher', '🏥 Surgeon', '⚖️ Barrister', '🚀 Aerospace Engineer',
  '🎓 Educational Psychologist', '🌱 Sustainability Consultant', '🔬 Forensic Scientist',
  '📡 Data Scientist', '🏗️ Structural Engineer', '🎵 Music Producer', '🧠 Neuroscientist',
  '🌐 Cybersecurity Analyst',
]

const FEATURES = [
  { icon: '🧭', title: 'Psychometric Assessment', desc: 'RIASEC interest profiling + Big Five personality science. 40 questions, research-backed, built for ages 14–18.', color: '#229ebc', bg: '#e0f5fb' },
  { icon: '🤖', title: 'AI-Powered Report', desc: '16 sections of personalised insights: career matches, gap analysis, day-in-the-life narratives, university pathways and more.', color: '#8b5cf6', bg: '#f3eeff' },
  { icon: '🗺️', title: 'Career Builder', desc: 'Pick a career and get a custom roadmap: subjects, universities, skills timeline, experiences and a 30-day quick-start plan.', color: '#ffb705', bg: '#fffbea' },
  { icon: '🏛️', title: 'University Finder', desc: '70+ universities across 7 countries, filtered by your programme, budget, and QS ranking.', color: '#22c55e', bg: '#f0fdf4' },
]

const STEPS = [
  { n: '01', icon: '📝', label: 'Tell us about yourself', sub: 'Name, school, curriculum, grade', color: '#229ebc' },
  { n: '02', icon: '🧩', label: 'Complete the assessment', sub: '40 psychometric questions (~15 min)', color: '#8b5cf6' },
  { n: '03', icon: '⚡', label: 'AI analyses your profile', sub: 'Groq AI runs 5 specialist calls', color: '#ffb705' },
  { n: '04', icon: '📊', label: 'Get your personalised report', sub: '16 sections of career insights', color: '#22c55e' },
]

const STATS = [
  { value: '100+', label: 'Career Paths', icon: '🎯' },
  { value: '70+',  label: 'Universities',  icon: '🏛️' },
  { value: '16',   label: 'Report Sections', icon: '📊' },
  { value: '3',    label: 'AI Scoring Tracks', icon: '🤖' },
]

const REPORT_SECTIONS = [
  { label: 'RIASEC Profile', icon: '📐' },
  { label: 'Career Matches', icon: '🎯' },
  { label: 'Career Comparison', icon: '⚖️' },
  { label: 'Gap Analysis', icon: '🔍' },
  { label: 'Emerging Careers', icon: '🚀' },
  { label: 'Day in the Life', icon: '☀️' },
  { label: 'Try Before You Choose', icon: '🎮' },
  { label: 'Skills Timeline', icon: '🗓️' },
  { label: 'University Pathway', icon: '🏛️' },
  { label: 'Experience Builder', icon: '⚡' },
]

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', overflowX: 'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #013147 0%, #1a4a63 55%, #229ebc 100%)', padding: '72px 24px 0', minHeight: '86vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Dot grid bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center', position: 'relative', zIndex: 1, paddingBottom: 56 }}>

          {/* Copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,158,188,0.18)', borderRadius: 999, padding: '5px 14px', marginBottom: 22, border: '1px solid rgba(34,158,188,0.4)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffb705', display: 'inline-block', boxShadow: '0 0 6px #ffb705' }} />
              <span style={{ color: '#8ec9e6', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600 }}>AI-Powered Career Guidance for Students</span>
            </div>

            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,5vw,3.6rem)', color: '#fff', lineHeight: 1.1, margin: 0 }}>
              Find Your
            </h1>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,5vw,3.6rem)', lineHeight: 1.1, margin: '0 0 20px', background: 'linear-gradient(135deg, #ffb705, #ffd041)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Direction.
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              Compass combines <strong style={{ color: '#fff' }}>RIASEC interest profiling</strong>, <strong style={{ color: '#fff' }}>Big Five personality science</strong>, and <strong style={{ color: '#fff' }}>Groq AI</strong> to help secondary students discover careers that genuinely fit — not just what's popular.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <button
                onClick={() => navigate('/start')}
                style={{ background: 'linear-gradient(135deg, #229ebc, #1a7a93)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 32px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(34,158,188,0.45)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(34,158,188,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,158,188,0.45)' }}
              >
                Start Free Assessment →
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ background: 'transparent', color: '#8ec9e6', border: '1.5px solid rgba(142,201,230,0.4)', borderRadius: 14, padding: '14px 26px', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8ec9e6'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(142,201,230,0.4)'; e.currentTarget.style.color = '#8ec9e6' }}
              >
                See how it works
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>Free · No sign-up required · ~15 minutes</p>
          </div>

          {/* Floating preview cards */}
          <div style={{ position: 'relative', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Main match card */}
            <div className="float-card" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 250, background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: '0 8px 32px rgba(1,49,71,0.18)', border: '1px solid rgba(34,158,188,0.15)', zIndex: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <CompassLogo size={24} />
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, color: '#64748b' }}>TOP CAREER MATCH</span>
              </div>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: '#013147', marginBottom: 8 }}>Biomedical Engineer</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ flex: 1, background: '#e0f5fb', borderRadius: 999, height: 6 }}>
                  <div style={{ width: '87%', background: 'linear-gradient(90deg, #229ebc, #1a7a93)', height: '100%', borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#229ebc', fontFamily: 'Montserrat, sans-serif' }}>87%</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {['RIASEC: IRS', '🛡️ AI-Resilient', 'High Demand'].map(t => (
                  <span key={t} style={{ background: '#e0f5fb', color: '#1a7a93', borderRadius: 999, padding: '2px 7px', fontSize: 9, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* RIASEC bar card */}
            <div className="float-card-alt" style={{ position: 'absolute', bottom: 20, left: 0, width: 180, background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 6px 24px rgba(1,49,71,0.14)', border: '1px solid rgba(34,158,188,0.12)', zIndex: 2 }}>
              <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 8 }}>RIASEC PROFILE</div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 32 }}>
                {[{ l: 'I', h: 90, c: '#229ebc' }, { l: 'R', h: 70, c: '#1a7a93' }, { l: 'S', h: 55, c: '#8b5cf6' }, { l: 'A', h: 45, c: '#ffb705' }, { l: 'E', h: 30, c: '#22c55e' }, { l: 'C', h: 20, c: '#94a3b8' }].map(b => (
                  <div key={b.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: '100%', height: `${b.h * 0.32}px`, background: b.c, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                    <span style={{ fontSize: 8, color: '#64748b', fontFamily: 'IBM Plex Mono, monospace' }}>{b.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Career builder card */}
            <div className="float-card-slow" style={{ position: 'absolute', bottom: 25, right: 0, width: 170, background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 6px 24px rgba(1,49,71,0.12)', border: '1px solid rgba(255,183,5,0.2)', zIndex: 2 }}>
              <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 8 }}>CAREER ROADMAP</div>
              {['📚 Subject Path', '🏛️ 3 University Tiers', '⚡ 6 Experiences'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ width: 13, height: 13, borderRadius: '50%', background: '#e0f5fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#229ebc', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 10, color: '#013147', fontFamily: 'Inter, sans-serif' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Curved bottom separator */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0 56L1440 56L1440 18C1200 50 720 64 480 40C240 16 0 46 0 18Z" fill="#fff" />
          </svg>
        </div>
      </section>

      {/* ── CAREER TICKER ─────────────────────────────────────────── */}
      <div style={{ background: '#013147', padding: '11px 0', overflow: 'hidden' }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8ec9e6', whiteSpace: 'nowrap', padding: '0 28px' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section style={{ padding: '60px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          {STATS.map(s => (
            <div key={s.label}
              style={{ background: '#fff', borderRadius: 18, padding: '22px 16px', textAlign: 'center', boxShadow: '0 2px 16px rgba(1,49,71,0.07)', border: '1px solid rgba(34,158,188,0.1)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(34,158,188,0.14)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(1,49,71,0.07)' }}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 30, color: '#013147', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748b', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 72px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,4vw,2.3rem)', color: '#013147', marginBottom: 10 }}>
            Everything you need to choose with confidence
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto' }}>
            One platform. Science-backed assessment. AI-powered insights. Real career data.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }}>
          {FEATURES.map(f => (
            <div key={f.title}
              style={{ background: '#fff', borderRadius: 20, padding: '26px 22px', boxShadow: '0 2px 16px rgba(1,49,71,0.06)', border: `1px solid ${f.color}20`, transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(1,49,71,0.11)'; e.currentTarget.style.borderColor = `${f.color}55` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(1,49,71,0.06)'; e.currentTarget.style.borderColor = `${f.color}20` }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 15, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: '#013147', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,4vw,2.3rem)', color: '#013147', marginBottom: 10 }}>
              From zero to career clarity in 4 steps
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: '0.95rem' }}>No consultants needed. No waiting. Instant, personalised results.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: 20 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ background: '#f8fafc', borderRadius: 20, padding: '26px 18px', textAlign: 'center', border: `1px solid ${s.color}25` }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 4px 16px ${s.color}44` }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                </div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: s.color, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8 }}>{s.n}</div>
                <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: '#013147', marginBottom: 6 }}>{s.label}</h4>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{s.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button
              onClick={() => navigate('/start')}
              style={{ background: 'linear-gradient(135deg, #229ebc, #1a7a93)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 36px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(34,158,188,0.4)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              Start Your Assessment — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* ── REPORT PREVIEW CHIPS ──────────────────────────────────── */}
      <section style={{ padding: '72px 24px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-block', background: 'rgba(34,158,188,0.1)', border: '1px solid rgba(34,158,188,0.3)', borderRadius: 999, padding: '5px 16px', marginBottom: 14 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#1a7a93', fontWeight: 600 }}>📊 Your Report Includes</span>
          </div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem,4vw,2.1rem)', color: '#013147', marginBottom: 10 }}>
            16 sections of insights, all personalised by AI
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: '0.9rem' }}>Every report is unique — no generic advice, no cookie-cutter guidance</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {REPORT_SECTIONS.map(s => (
            <div key={s.label}
              style={{ background: '#fff', borderRadius: 12, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 2px 10px rgba(1,49,71,0.06)', border: '1px solid rgba(34,158,188,0.1)', transition: 'transform 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#229ebc55' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(34,158,188,0.1)' }}
            >
              <span style={{ fontSize: 15 }}>{s.icon}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#013147' }}>{s.label}</span>
            </div>
          ))}
          <div style={{ background: 'rgba(34,158,188,0.06)', border: '1px dashed #229ebc44', borderRadius: 12, padding: '9px 16px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#229ebc', fontWeight: 600 }}>+ 6 more sections</span>
          </div>
        </div>
      </section>

      {/* ── SCIENCE STRIP ─────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderTop: '1px solid rgba(34,158,188,0.12)', borderBottom: '1px solid rgba(34,158,188,0.12)', padding: '22px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Built on</span>
          {['RIASEC Interest Theory', 'Big Five Personality Science', 'O*NET Occupational Data', 'Groq AI (llama-3.3-70b)'].map(tag => (
            <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#229ebc', display: 'inline-block' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#013147', fontWeight: 500 }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #013147 0%, #1a4a63 55%, #229ebc 100%)', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <CompassLogo size={34} />
          </div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 'clamp(1.7rem,4vw,2.5rem)', color: '#fff', marginBottom: 14 }}>
            Ready to find your direction?
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 32 }}>
            Join students across the UAE and beyond who have used Compass to discover careers that actually match who they are — not just what's expected.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/start')}
              style={{ background: 'linear-gradient(135deg, #ffb705, #ffd041)', color: '#013147', border: 'none', borderRadius: 14, padding: '14px 34px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,183,5,0.4)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              Start Free Assessment
            </button>
            <button
              onClick={() => navigate('/careers')}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 14, padding: '14px 26px', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            >
              Explore Careers
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
