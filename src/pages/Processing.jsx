import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { generateReport } from '../services/ai'
import Button from '../components/ui/Button'

const STATUS_MESSAGES = [
  'Calculating your RIASEC profile...',
  'Matching careers to your interests...',
  'Personalising your results with AI...',
  'Building your career clusters...',
  'Your report is almost ready...',
]

// Animated compass SVG
function CompassSpinner() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="compass-spin mb-8">
      {/* Outer ring */}
      <circle cx="60" cy="60" r="55" fill="none" stroke="#2A4A6B" strokeWidth="4" />
      {/* Tick marks */}
      {[0,45,90,135,180,225,270,315].map(deg => (
        <line
          key={deg}
          x1="60" y1="8" x2="60" y2="18"
          stroke="#EDC163" strokeWidth="2"
          transform={`rotate(${deg} 60 60)`}
        />
      ))}
      {/* N/S/E/W labels */}
      <text x="60" y="26" textAnchor="middle" fill="#EDC163" fontSize="10" fontFamily="IBM Plex Mono">N</text>
      <text x="60" y="98" textAnchor="middle" fill="#6B7C8D" fontSize="10" fontFamily="IBM Plex Mono">S</text>
      <text x="95" y="64" textAnchor="middle" fill="#6B7C8D" fontSize="10" fontFamily="IBM Plex Mono">E</text>
      <text x="25" y="64" textAnchor="middle" fill="#6B7C8D" fontSize="10" fontFamily="IBM Plex Mono">W</text>
      {/* Needle - North (gold) */}
      <polygon points="60,20 55,60 65,60" fill="#EDC163" />
      {/* Needle - South (muted) */}
      <polygon points="60,100 55,60 65,60" fill="#6B7C8D" opacity="0.6" />
      {/* Center pin */}
      <circle cx="60" cy="60" r="5" fill="#EDC163" />
    </svg>
  )
}

export default function Processing() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [msgIdx, setMsgIdx] = useState(0)
  const [error, setError]   = useState(null)

  // useRef instead of useState for the "has started" guard.
  // useState causes a stale closure issue: React 18 Strict Mode double-invokes
  // effects, and the second invocation would still see generating=false because
  // state updates don't synchronously reflect in the closure. A ref is mutated
  // in-place so the guard is reliable across the double-invoke.
  const hasStarted = useRef(false)

  // Advance status messages every 3 s
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx(prev => Math.min(prev + 1, STATUS_MESSAGES.length - 1))
    }, 3000)
    return () => clearInterval(msgInterval)
  }, [])

  // Kick off generation then poll for completion
  useEffect(() => {
    let pollInterval

    const kickoffAndPoll = async () => {
      // Guard: only fire generateReport once even if effect runs twice (Strict Mode)
      if (!hasStarted.current) {
        hasStarted.current = true
        console.log('[Processing] Calling generateReport for assessment', id)
        try {
          const { data, error: genErr } = await generateReport(id)
          if (genErr) {
            console.error('[Processing] generateReport returned error:', genErr)
          } else {
            console.log('[Processing] generateReport response:', data)
          }
        } catch (e) {
          // Non-fatal: the Edge Function may still complete asynchronously.
          // Polling will detect the final status either way.
          console.error('[Processing] generateReport threw:', e)
        }
      }

      // Poll the reports table every 3 s for status changes
      pollInterval = setInterval(async () => {
        try {
          const { data, error: pollErr } = await supabase
            .from('reports')
            .select('status')
            .eq('assessment_id', id)
            .single()

          if (pollErr) {
            console.warn('[Processing] Poll error:', pollErr.message)
            return
          }

          console.log('[Processing] Report status:', data?.status)

          if (data?.status === 'complete') {
            clearInterval(pollInterval)
            navigate(`/report/${id}`)
          } else if (data?.status === 'failed') {
            clearInterval(pollInterval)
            setError('Report generation failed. Please try again.')
          }
        } catch (e) {
          console.error('[Processing] Poll threw:', e)
        }
      }, 3000)
    }

    kickoffAndPoll()
    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [id, navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="font-display text-3xl text-gold mb-4">Something went wrong</h2>
        <p className="text-white/70 font-body mb-8 max-w-md">{error}</p>
        <Button onClick={() => navigate('/assessment')}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-center px-4">
      <CompassSpinner />
      <h2 className="font-display text-3xl text-gold mb-4">Generating your report...</h2>
      <p className="text-white/70 font-body text-lg mb-8 min-h-[2rem] transition-all duration-500">
        {STATUS_MESSAGES[msgIdx]}
      </p>
      {/* Progress dots */}
      <div className="flex gap-2 mt-4">
        {STATUS_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= msgIdx ? 'bg-gold' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
      <p className="text-white/40 text-sm mt-8 font-body">This usually takes 30–60 seconds</p>
    </div>
  )
}
