import { useState, useRef, useEffect } from 'react'

// Hardcoded to avoid undefined URL if env vars not set in production
const CAREER_CHAT_URL = 'https://glyhxqxpqxccxvupcadf.supabase.co/functions/v1/career-chat'
const SUPABASE_ANON   = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdseWh4cXhwcXhjY3h2dXBjYWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzQzODIsImV4cCI6MjA4ODYxMDM4Mn0.JvZPQn-0kFgLufU4Z2rcc_MbOpMI36Xd9dG-poIL-as'

// ─── Minor-friendly quick prompts ────────────────────────────────────────────
const QUICK_PROMPTS = [
  '🎓 What subjects do I need?',
  '💰 What does it pay?',
  '📅 How long is the study?',
  '☀️ What does a typical day look like?',
  '🌍 Where can I work in the world?',
  '🎯 How do I know if it\'s right for me?',
]

// ─── Avatar ───────────────────────────────────────────────────────────────────
function BotAvatar() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #229ebc, #1a7a93)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, boxShadow: '0 2px 8px rgba(34,158,188,0.35)' }}>
      🧭
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
      <BotAvatar />
      <div style={{ background: '#fff', border: '1px solid #e0f0f8', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="typing-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#229ebc', display: 'inline-block', animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8, marginBottom: 14 }}>
      {!isUser && <BotAvatar />}
      <div style={{
        maxWidth: '80%',
        background: isUser ? 'linear-gradient(135deg, #229ebc, #1a7a93)' : '#fff',
        color: isUser ? '#fff' : '#013147',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '12px 16px',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.65,
        boxShadow: isUser ? '0 2px 12px rgba(34,158,188,0.3)' : '0 1px 6px rgba(1,49,71,0.08)',
        border: isUser ? 'none' : '1px solid #e0f0f8',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

// ─── Main widget ──────────────────────────────────────────────────────────────
export default function ChatWidget({ assessment, student, matches }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [hasGreeted, setHasGreeted] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Top 3 blended careers
  const topCareers = (matches ?? [])
    .filter(m => m.match_type === 'blended')
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    .slice(0, 3)

  // Default to top career
  useEffect(() => {
    if (topCareers.length > 0 && !selectedCareer) {
      setSelectedCareer(topCareers[0].title)
    }
  }, [matches])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Greet on first open
  useEffect(() => {
    if (open && !hasGreeted && selectedCareer) {
      const name = student?.full_name?.split(' ')[0] ?? 'there'
      setMessages([{
        role: 'assistant',
        content: `Hi ${name}! 👋 I'm your Compass AI guide. I'm here to help you explore ${selectedCareer} — one of your top career matches.\n\nYou can ask me anything: what the day-to-day is like, how to get there, what to study, salaries, and more. What would you like to know?`,
      }])
      setHasGreeted(true)
    }
  }, [open, hasGreeted, selectedCareer])

  // When career changes, reset conversation
  function handleCareerChange(career) {
    setSelectedCareer(career)
    setHasGreeted(false)
    setMessages([])
  }

  // Re-greet after career change
  useEffect(() => {
    if (open && !hasGreeted && selectedCareer && messages.length === 0) {
      const name = student?.full_name?.split(' ')[0] ?? 'there'
      setMessages([{
        role: 'assistant',
        content: `Let's explore ${selectedCareer}! Ask me anything about this career — I'm here to help. 🎯`,
      }])
      setHasGreeted(true)
    }
  }, [selectedCareer, hasGreeted, open, messages.length])

  async function sendMessage(text) {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    setInput('')

    // conversation_history = everything BEFORE this new message
    const conversationHistory = messages.slice(-6)
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    const requestBody = {
      assessment_id: assessment?.id ?? null,
      career_title:  selectedCareer,
      message:       userText,
      conversation_history: conversationHistory,
      career_description: topCareers.find(c => c.title === selectedCareer)?.description ?? '',
      student_profile: {
        riasec_top3: assessment?.riasec_top3 ?? '',
        hobbies: Array.isArray(assessment?.hobbies_tags)
          ? assessment.hobbies_tags.join(', ')
          : (assessment?.hobbies ?? ''),
        curriculum: student?.curriculum ?? '',
        age: student?.date_of_birth
          ? new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()
          : 16,
      },
    }

    // ── Debug logging ────────────────────────────────────────────────────────
    console.log('[ChatWidget] ▶ Calling career-chat')
    console.log('[ChatWidget] URL:', CAREER_CHAT_URL)
    console.log('[ChatWidget] ANON key present:', !!SUPABASE_ANON, '| first 20 chars:', SUPABASE_ANON?.slice(0, 20))
    console.log('[ChatWidget] Request body:', JSON.stringify(requestBody, null, 2))
    // ────────────────────────────────────────────────────────────────────────

    try {
      const res = await fetch(CAREER_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log('[ChatWidget] Response status:', res.status, res.statusText)

      const data = await res.json()
      console.log('[ChatWidget] Response data:', data)

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        throw new Error(data.error ?? `No reply field in response: ${JSON.stringify(data)}`)
      }
    } catch (e) {
      console.error('[ChatWidget] ✖ Error:', e.message ?? e)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I hit a snag! Please try again in a moment. 🔄`,
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── Floating button ────────────────────────────────────── */}
      <div
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999 }}
        className="no-print"
      >
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #229ebc, #1a7a93)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 24px rgba(34,158,188,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(34,158,188,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,158,188,0.5)' }}
            title="Ask your AI career guide"
          >
            🧭
          </button>
        ) : (
          <button
            onClick={() => setOpen(false)}
            style={{ width: 60, height: 60, borderRadius: '50%', background: '#013147', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(1,49,71,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', transition: 'transform 0.2s' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Chat panel ─────────────────────────────────────────── */}
      {open && (
        <div
          className="no-print"
          style={{ position: 'fixed', bottom: 96, right: 24, width: 360, maxHeight: 560, background: '#f0f9ff', borderRadius: 24, boxShadow: '0 20px 60px rgba(1,49,71,0.2)', border: '1px solid rgba(34,158,188,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 998, animation: 'slideUpFade 0.25s ease' }}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #013147, #1a4a63)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(34,158,188,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                🧭
              </div>
              <div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>AI Career Guide</div>
                <div style={{ fontSize: 11, color: '#8ec9e6', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  Student-friendly guide
                </div>
              </div>
            </div>

            {/* Career selector */}
            {topCareers.length > 1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {topCareers.map((c, i) => (
                  <button
                    key={c.title}
                    onClick={() => handleCareerChange(c.title)}
                    style={{ background: selectedCareer === c.title ? 'rgba(34,158,188,0.4)' : 'rgba(255,255,255,0.08)', border: selectedCareer === c.title ? '1px solid #229ebc' : '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '3px 10px', fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: selectedCareer === c.title ? 700 : 400, color: selectedCareer === c.title ? '#fff' : '#8ec9e6', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                  >
                    #{i + 1} {c.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{ background: 'rgba(255,183,5,0.08)', borderBottom: '1px solid rgba(255,183,5,0.15)', padding: '7px 14px', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
              This AI provides general guidance only. For important career decisions, also speak with a school counsellor or qualified advisor.
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts (show when few messages) */}
          {messages.length <= 2 && !loading && (
            <div style={{ padding: '4px 14px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {QUICK_PROMPTS.slice(0, 3).map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q.replace(/^[^ ]+ /, ''))}
                  style={{ background: '#fff', border: '1px solid #e0f0f8', borderRadius: 999, padding: '5px 11px', fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#1a7a93', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', fontWeight: 500 }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e0f5fb'; e.currentTarget.style.borderColor = '#229ebc' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e0f0f8' }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(34,158,188,0.12)', display: 'flex', gap: 8, alignItems: 'flex-end', background: '#fff' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this career..."
              rows={1}
              disabled={loading}
              style={{ flex: 1, border: '1.5px solid #e0f0f8', borderRadius: 12, padding: '9px 12px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#013147', resize: 'none', outline: 'none', background: '#f8fdff', lineHeight: 1.4, maxHeight: 80, transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#229ebc'}
              onBlur={e => e.target.style.borderColor = '#e0f0f8'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ width: 38, height: 38, borderRadius: '50%', background: !input.trim() || loading ? '#e0f0f8' : 'linear-gradient(135deg, #229ebc, #1a7a93)', border: 'none', cursor: !input.trim() || loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.15s', flexShrink: 0 }}
            >
              {loading ? '⏳' : '→'}
            </button>
          </div>
        </div>
      )}

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media print { .no-print { display: none !important; } }
      `}</style>
    </>
  )
}
