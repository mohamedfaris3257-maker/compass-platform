import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useToast } from '../components/ui/Toast'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { getTopClusters } from '../utils/clustering'
// PDF service lazy-loaded on demand to keep initial bundle small

import ReportCover from '../components/report/ReportCover'
import ReadFirst from '../components/report/ReadFirst'
import ExecutiveSnapshot from '../components/report/ExecutiveSnapshot'
import RiasecProfile from '../components/report/RiasecProfile'
import PersonalitySignals from '../components/report/PersonalitySignals'
import CareerMatches from '../components/report/CareerMatches'
import AdjacentPaths from '../components/report/AdjacentPaths'
import EmergingCareers from '../components/report/EmergingCareers'
import TryBeforeYouChoose from '../components/report/TryBeforeYouChoose'
import GapAnalysis from '../components/report/GapAnalysis'
import DayInTheLife from '../components/report/DayInTheLife'
import CareerComparison from '../components/report/CareerComparison'
import ChatWidget from '../components/report/ChatWidget'
import BringingItTogether from '../components/report/BringingItTogether'
import NextSteps from '../components/report/NextSteps'
import ImportantNotes from '../components/report/ImportantNotes'

const TOC_ITEMS = [
  { id: 'cover',              label: 'Cover' },
  { id: 'read-first',         label: 'Read First' },
  { id: 'snapshot',           label: 'Executive Snapshot' },
  { id: 'riasec',             label: 'RIASEC Profile' },
  { id: 'personality',        label: 'Personality Signals' },
  { id: 'careers',            label: 'Career Matches' },
  { id: 'comparison',         label: 'Career Comparison' },
  { id: 'adjacent',           label: 'Adjacent Paths' },
  { id: 'emerging',           label: 'Emerging Careers' },
  { id: 'try-before',         label: 'Try Before You Choose' },
  { id: 'gap-analysis',       label: 'Gap Analysis' },
  { id: 'day-in-life',        label: 'Day in the Life' },
  { id: 'bringing',           label: 'Bringing It Together' },
  { id: 'next-steps',         label: 'Next Steps' },
  { id: 'notes',              label: 'Important Notes' },
]

export default function Report() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [report, setReport] = useState(null)
  const [matches, setMatches] = useState([])
  const [clusters, setClusters] = useState([])
  const [allCareers, setAllCareers] = useState([])
  const [activeSection, setActiveSection] = useState('cover')
  const [tocOpen, setTocOpen] = useState(false)
  const mainRef = useRef(null)

  useEffect(() => {
    if (!id) return
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      // Fetch assessment
      const { data: assessmentData, error: assessmentErr } = await supabase
        .from('assessments')
        .select('*, students(*)')
        .eq('id', id)
        .single()

      if (assessmentErr) throw assessmentErr

      setAssessment(assessmentData)
      setStudent(assessmentData.students)

      // Fetch report
      const { data: reportData } = await supabase
        .from('reports')
        .select('*')
        .eq('assessment_id', id)
        .single()

      setReport(reportData)

      // Fetch career matches with career data
      const { data: matchData } = await supabase
        .from('career_matches')
        .select('*, careers(*)')
        .eq('assessment_id', id)
        .order('rank', { ascending: true })

      if (matchData) {
        const expanded = matchData.map(m => ({
          ...m.careers,
          match_score: m.match_score,
          match_type: m.match_type,
          rank: m.rank,
        }))
        setMatches(expanded)

        // Fetch all careers for clustering
        const { data: careersData } = await supabase
          .from('careers')
          .select('soc_code, title')
          .limit(200)

        if (careersData) {
          setAllCareers(careersData)
          // Cluster only on blended matches to avoid tripling seedCareers across 3 match types
          const blendedMatches = expanded.filter(m => m.match_type === 'blended')
          const topClusters = getTopClusters(blendedMatches, careersData)
          setClusters(topClusters)
        }
      }
    } catch (err) {
      console.error(err)
      toast(`Error loading report: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // True once the edge function has finished (success or failure)
  const reportComplete = report?.status === 'complete' || report?.status === 'failed'

  // Scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    TOC_ITEMS.forEach(item => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [loading])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setTocOpen(false)
  }

  const handleDownloadPDF = async () => {
    try {
      toast('Generating PDF…', 'info')
      const { downloadCompassPDF } = await import('../services/pdf.jsx')
      await downloadCompassPDF({ student, assessment, report, careerMatches: matches })
    } catch (e) {
      toast('PDF download failed. Try printing from your browser instead.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted font-body">Loading your report...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="text-5xl mb-4">🧭</div>
        <h2 className="font-display text-2xl text-navy mb-4">Report not found</h2>
        <p className="text-muted font-body mb-6">The assessment ID may be incorrect or the report has been removed.</p>
        <Button onClick={() => navigate('/assessment')}>Take the Assessment</Button>
      </div>
    )
  }

  if (report?.status === 'pending' || report?.status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <Spinner size="lg" className="mx-auto mb-4" />
        <h2 className="font-display text-2xl text-navy mb-4">Report still generating...</h2>
        <p className="text-muted font-body mb-2">This usually takes 30–60 seconds.</p>
        <p className="text-xs text-muted font-body">This page will refresh automatically.</p>
        <Button className="mt-6" onClick={fetchData} variant="secondary">Refresh</Button>
      </div>
    )
  }

  return (
    <div className="flex relative">
      {/* TOC Sidebar (desktop) */}
      <aside
        className="hidden lg:flex flex-col w-52 shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto py-6 px-3"
        style={{ background: '#011f2e', borderRight: '1px solid rgba(34,158,188,0.2)' }}
      >
        <p style={{ fontSize: 10, color: '#8ec9e6', fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 14 }}>
          Contents
        </p>
        {TOC_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 10,
              fontFamily: 'Inter, sans-serif', fontSize: 12, marginBottom: 2, cursor: 'pointer',
              border: 'none', background: activeSection === item.id ? 'rgba(34,158,188,0.18)' : 'transparent',
              color: activeSection === item.id ? '#fff' : '#8ec9e6',
              fontWeight: activeSection === item.id ? 700 : 400,
              borderLeft: activeSection === item.id ? '3px solid #229ebc' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {item.label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0" ref={mainRef}>
        {/* Top action bar */}
        <div
          className="sticky top-16 z-30 px-4 h-12 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #011f2e, #013147)', borderBottom: '1px solid rgba(34,158,188,0.2)', boxShadow: '0 2px 12px rgba(1,31,46,0.4)' }}
        >
          <span style={{ fontSize: 13, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {student?.full_name}
          </span>
          <div className="flex items-center gap-2">
            {/* Mobile TOC toggle */}
            <button
              className="lg:hidden"
              style={{ color: '#8ec9e6', fontSize: 12, fontFamily: 'Inter, sans-serif', padding: '5px 11px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }}
              onClick={() => setTocOpen(true)}
            >
              📋 Contents
            </button>
            <button
              onClick={() => navigate(`/career-builder/${id}`)}
              style={{ background: 'linear-gradient(135deg, #ffb705, #ffd041)', color: '#013147', border: 'none', borderRadius: 10, padding: '6px 14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🗺️ Career Builder
            </button>
            <Button size="sm" onClick={handleDownloadPDF}>
              Download PDF
            </Button>
          </div>
        </div>

        {/* Report sections */}
        <ReportCover student={student} assessment={assessment} />
        <ReadFirst />
        <ExecutiveSnapshot assessment={assessment} report={report} reportComplete={reportComplete} />
        <RiasecProfile assessment={assessment} report={report} reportComplete={reportComplete} />
        <PersonalitySignals assessment={assessment} />
        <CareerMatches matches={matches} report={report} assessment={assessment} reportComplete={reportComplete} />
        <CareerComparison matches={matches} report={report} />
        <AdjacentPaths clusters={clusters} report={report} reportComplete={reportComplete} />
        <EmergingCareers clusters={clusters} />
        <TryBeforeYouChoose report={report} reportComplete={reportComplete} />
        <GapAnalysis report={report} reportComplete={reportComplete} />
        <DayInTheLife report={report} reportComplete={reportComplete} matches={matches} />
        <BringingItTogether />
        <NextSteps />
        <ImportantNotes />
      </div>

      {/* Floating AI Chat Widget */}
      <ChatWidget assessment={assessment} student={student} matches={matches} />

      {/* Mobile TOC Drawer */}
      {tocOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" onClick={() => setTocOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(1,31,46,0.75)' }} />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto"
            style={{ background: '#011f2e', borderTop: '1px solid rgba(34,158,188,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontSize: 10, color: '#8ec9e6', fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              Report Contents
            </p>
            {TOC_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{ width: '100%', textAlign: 'left', padding: '12px 12px', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#e8f6fb', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: 2 }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
