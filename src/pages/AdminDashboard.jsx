import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useToast } from '../components/ui/Toast'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Download, Users, FileText, TrendingUp, Database, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { formatDate } from '../utils/ageCalc'

const TABS = [
  { id: 'overview', label: 'Overview', Icon: TrendingUp },
  { id: 'students', label: 'Students', Icon: Users },
  { id: 'insights', label: 'Insights', Icon: Database },
  { id: 'reports', label: 'Reports', Icon: FileText },
  { id: 'export', label: 'Export', Icon: Download },
]

export default function AdminDashboard() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [assessments, setAssessments] = useState([])
  const [reports, setReports] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [curriculumFilter, setCurriculumFilter] = useState('')

  // Insights tab filters
  const [insightSchool, setInsightSchool] = useState('')
  const [insightCurriculum, setInsightCurriculum] = useState('')
  const [insightGrade, setInsightGrade] = useState('')
  const [topCareers, setTopCareers] = useState([])
  const [topCareersLoading, setTopCareersLoading] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [{ data: studentsData }, { data: assessmentsData }, { data: reportsData }] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('assessments').select('*, students(full_name, school_name, curriculum, grade)').order('completed_at', { ascending: false }),
        supabase.from('reports').select('*, assessments(student_id, students(full_name))').order('generated_at', { ascending: false }),
      ])
      setStudents(studentsData || [])
      setAssessments(assessmentsData || [])
      setReports(reportsData || [])
    } catch (err) {
      toast(`Error loading admin data: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Insights-filtered assessments (applied client-side)
  const insightAssessments = assessments.filter(a => {
    if (insightSchool && !a.students?.school_name?.toLowerCase().includes(insightSchool.toLowerCase())) return false
    if (insightCurriculum && a.students?.curriculum !== insightCurriculum) return false
    if (insightGrade && a.students?.grade !== insightGrade) return false
    return true
  })

  // RIASEC distribution on filtered assessments
  const riasecDistRaw = ['R','I','A','S','E','C'].map(letter => ({
    theme: letter,
    count: insightAssessments.filter(a => a.riasec_top3?.charAt(0) === letter).length,
  }))
  const mostCommonCode = [...riasecDistRaw].sort((a, b) => b.count - a.count)[0]?.theme || '—'

  // Fetch top careers when insights tab is active and filters change
  useEffect(() => {
    if (activeTab !== 'insights') return
    fetchTopCareers()
  }, [activeTab, insightSchool, insightCurriculum, insightGrade, insightAssessments.length])

  const fetchTopCareers = async () => {
    if (insightAssessments.length === 0) { setTopCareers([]); return }
    setTopCareersLoading(true)
    try {
      const assessmentIds = insightAssessments.map(a => a.id)
      const { data } = await supabase
        .from('career_matches')
        .select('careers(title)')
        .in('assessment_id', assessmentIds)
        .eq('match_type', 'blended')
      if (data) {
        const counts = {}
        data.forEach(row => {
          const title = row.careers?.title
          if (title) counts[title] = (counts[title] || 0) + 1
        })
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))
        setTopCareers(sorted)
      }
    } catch (err) {
      console.error('Top careers fetch error:', err)
    } finally {
      setTopCareersLoading(false)
    }
  }

  // Filtered students
  const filteredStudents = students.filter(s => {
    const matchSearch = !searchQuery ||
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.school_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCurriculum = !curriculumFilter || s.curriculum === curriculumFilter
    return matchSearch && matchCurriculum
  })

  const exportCSV = (data, filename) => {
    if (!data?.length) { toast('No data to export', 'info'); return }
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object')
    const csv = [
      keys.join(','),
      ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
    toast(`${filename} downloaded`, 'success')
  }

  const getAssessmentForStudent = (studentId) =>
    assessments.find(a => a.student_id === studentId)

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left sidebar */}
      <aside className="w-48 shrink-0 bg-navy flex flex-col">
        <div className="p-4 border-b border-navyMid">
          <p className="text-gold font-display text-base">🧭 Admin Panel</p>
        </div>
        <nav className="flex flex-col py-2">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 text-sm font-body transition-colors text-left',
                activeTab === id
                  ? 'bg-gold/20 text-gold border-r-2 border-gold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-cream">
        {/* Warning banner */}
        <div className="bg-amber/10 border-b border-amber/30 px-6 py-2 flex items-center gap-2">
          <AlertCircle size={15} className="text-amber" />
          <p className="text-xs text-amber font-body">
            Admin access is unrestricted in this version. Add Supabase Auth before sharing with schools.
          </p>
        </div>

        <div className="p-6 max-w-5xl">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : (
            <>
              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div>
                  <h2 className="font-display text-2xl text-navy mb-6">Overview</h2>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Total Students', value: students.length, bg: 'bg-navy text-white' },
                      { label: 'Assessments Completed', value: assessments.length, bg: 'bg-gold text-navy' },
                      { label: 'Most Common Code', value: mostCommonCode || '—', bg: 'bg-success text-white' },
                      { label: 'Reports Generated', value: reports.filter(r => r.status === 'complete').length, bg: 'bg-navyMid text-white' },
                    ].map(card => (
                      <div key={card.label} className={`rounded-xl p-5 ${card.bg}`}>
                        <p className="text-xs opacity-60 font-body uppercase tracking-wide mb-2">{card.label}</p>
                        <p className="font-display text-4xl">{card.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* RIASEC chart */}
                    <div className="bg-white rounded-xl border border-cborder p-5">
                      <h3 className="font-display text-lg text-navy mb-4">RIASEC Distribution</h3>
                      {assessments.length === 0 ? (
                        <p className="text-muted text-sm font-body text-center py-8">No assessments yet</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={riasecDistRaw} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CF" vertical={false} />
                            <XAxis dataKey="theme" tick={{ fontSize: 13, fontFamily: 'DM Sans' }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip
                              formatter={(v) => [v, 'Students']}
                              contentStyle={{ fontFamily: 'DM Sans', fontSize: 12 }}
                            />
                            <Bar dataKey="count" fill="#EDC163" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Recent submissions */}
                    <div className="bg-white rounded-xl border border-cborder p-5">
                      <h3 className="font-display text-lg text-navy mb-4">Recent Submissions</h3>
                      {assessments.length === 0 ? (
                        <p className="text-muted text-sm font-body text-center py-8">No submissions yet</p>
                      ) : (
                        <div className="space-y-0 max-h-52 overflow-y-auto">
                          {assessments.slice(0, 8).map(a => (
                            <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-cborder last:border-0">
                              <div>
                                <p className="text-sm text-navy font-body font-medium leading-tight">
                                  {a.students?.full_name || 'Unknown Student'}
                                </p>
                                <p className="text-xs text-muted font-body">{a.students?.school_name}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {a.riasec_top3 && <Badge color="gold">{a.riasec_top3}</Badge>}
                                <a
                                  href={`/report/${a.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-gold hover:text-navy font-body"
                                >
                                  View
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STUDENTS ── */}
              {activeTab === 'students' && (
                <div>
                  <h2 className="font-display text-2xl text-navy mb-6">Students</h2>
                  <div className="flex gap-3 mb-5 flex-wrap">
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by name or school..."
                      className="flex-1 min-w-[200px] border border-cborder rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none focus:border-gold bg-white"
                    />
                    <select
                      value={curriculumFilter}
                      onChange={e => setCurriculumFilter(e.target.value)}
                      className="border border-cborder rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:border-gold bg-white"
                    >
                      <option value="">All Curricula</option>
                      {['IB','IGCSE','A-Levels','US Curriculum','Indian Curriculum','Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white rounded-xl border border-cborder overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead className="bg-cream border-b border-cborder">
                        <tr>
                          {['Name','Age','School','Curriculum','Top Code','Test Date','Report'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-mono-data text-muted uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map(student => {
                          const assessment = getAssessmentForStudent(student.id)
                          return (
                            <tr key={student.id} className="border-b border-cborder hover:bg-cream/50 font-body transition-colors">
                              <td className="px-4 py-3 font-medium text-navy">{student.full_name}</td>
                              <td className="px-4 py-3 text-muted">{student.age || '—'}</td>
                              <td className="px-4 py-3 text-muted max-w-[150px] truncate">{student.school_name}</td>
                              <td className="px-4 py-3">
                                <Badge color="navy" className="text-[10px]">{student.curriculum}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                {assessment?.riasec_top3 ? (
                                  <Badge color="gold">{assessment.riasec_top3}</Badge>
                                ) : <span className="text-muted">—</span>}
                              </td>
                              <td className="px-4 py-3 text-muted whitespace-nowrap">
                                {formatDate(assessment?.completed_at) || '—'}
                              </td>
                              <td className="px-4 py-3">
                                {assessment && (
                                  <a
                                    href={`/report/${assessment.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-gold hover:text-navy font-medium transition-colors"
                                  >
                                    View →
                                  </a>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {filteredStudents.length === 0 && (
                      <p className="text-center text-muted py-12 font-body text-sm">
                        {students.length === 0 ? 'No students have completed assessments yet.' : 'No students match your search.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── INSIGHTS ── */}
              {activeTab === 'insights' && (
                <div>
                  <h2 className="font-display text-2xl text-navy mb-4">Insights</h2>

                  {/* Filters */}
                  <div className="bg-white rounded-xl border border-cborder p-4 mb-6 flex flex-wrap gap-3 items-center">
                    <input
                      value={insightSchool}
                      onChange={e => setInsightSchool(e.target.value)}
                      placeholder="Filter by school..."
                      className="border border-cborder rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:border-gold bg-white"
                    />
                    <select
                      value={insightCurriculum}
                      onChange={e => setInsightCurriculum(e.target.value)}
                      className="border border-cborder rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:border-gold bg-white"
                    >
                      <option value="">All Curricula</option>
                      {['IB','IGCSE','A-Levels','US Curriculum','Indian Curriculum','Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <select
                      value={insightGrade}
                      onChange={e => setInsightGrade(e.target.value)}
                      className="border border-cborder rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:border-gold bg-white"
                    >
                      <option value="">All Grades</option>
                      {['9','10','11','12','Year 9','Year 10','Year 11','Year 12','Year 13','Grade 9','Grade 10','Grade 11','Grade 12'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted font-body ml-auto">{insightAssessments.length} assessments</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* RIASEC chart */}
                    <div className="bg-white rounded-xl border border-cborder p-5">
                      <h3 className="font-display text-lg text-navy mb-4">RIASEC Top Code Distribution</h3>
                      {insightAssessments.length === 0 ? (
                        <p className="text-muted text-sm font-body text-center py-8">No assessments match current filters.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={riasecDistRaw} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CF" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="theme" tick={{ fontSize: 13 }} width={30} />
                            <Tooltip formatter={(v) => [v, 'Students']} />
                            <Bar dataKey="count" fill="#fb8403" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Top 5 Careers chart */}
                    <div className="bg-white rounded-xl border border-cborder p-5">
                      <h3 className="font-display text-lg text-navy mb-4">Top 5 Matched Careers</h3>
                      {topCareersLoading ? (
                        <div className="flex justify-center py-8"><Spinner size="md" /></div>
                      ) : topCareers.length === 0 ? (
                        <p className="text-muted text-sm font-body text-center py-8">No career data for this cohort yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={topCareers} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CF" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                            <Tooltip formatter={(v) => [v, 'Students matched']} />
                            <Bar dataKey="count" fill="#229ebc" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: 'Report Success Rate',
                        value: insightAssessments.length > 0
                          ? `${Math.round((reports.filter(r => r.status === 'complete').length / assessments.length) * 100)}%`
                          : '—',
                      },
                      {
                        label: 'Curricula Represented',
                        value: new Set(insightAssessments.map(a => a.students?.curriculum).filter(Boolean)).size || '—',
                      },
                      {
                        label: 'Pending Reports',
                        value: reports.filter(r => r.status === 'pending' || r.status === 'generating').length,
                      },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white border border-cborder rounded-xl p-5 text-center">
                        <p className="text-muted text-xs font-body uppercase tracking-wide mb-2">{stat.label}</p>
                        <p className="font-display text-4xl text-navy">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── REPORTS ── */}
              {activeTab === 'reports' && (
                <div>
                  <h2 className="font-display text-2xl text-navy mb-6">Reports</h2>
                  <div className="bg-white rounded-xl border border-cborder overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-cream border-b border-cborder">
                        <tr>
                          {['Student','Generated','Status','Action'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-mono-data text-muted uppercase tracking-wide">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map(report => (
                          <tr key={report.id} className="border-b border-cborder hover:bg-cream/50 font-body">
                            <td className="px-4 py-3 text-navy font-medium">
                              {report.assessments?.students?.full_name || 'Unknown'}
                            </td>
                            <td className="px-4 py-3 text-muted whitespace-nowrap">
                              {formatDate(report.generated_at) || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                color={
                                  report.status === 'complete' ? 'green'
                                  : report.status === 'failed' ? 'red'
                                  : 'amber'
                                }
                              >
                                {report.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {report.assessment_id && (
                                <a
                                  href={`/report/${report.assessment_id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-gold hover:text-navy font-medium"
                                >
                                  View Report →
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reports.length === 0 && (
                      <p className="text-center text-muted py-12 font-body text-sm">No reports yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── EXPORT ── */}
              {activeTab === 'export' && (
                <div>
                  <h2 className="font-display text-2xl text-navy mb-6">Export Data</h2>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Export Students CSV',
                        desc: 'All student records including name, school, curriculum, and DOB',
                        data: students,
                        filename: 'compass_students.csv',
                      },
                      {
                        label: 'Export Assessments CSV',
                        desc: 'All assessment records with RIASEC top codes and Big Five levels',
                        data: assessments.map(a => ({
                          id: a.id,
                          student_id: a.student_id,
                          riasec_top3: a.riasec_top3,
                          riasec_order: a.riasec_order,
                          hobbies: a.hobbies,
                          completed_at: a.completed_at,
                        })),
                        filename: 'compass_assessments.csv',
                      },
                      {
                        label: 'Export Reports CSV',
                        desc: 'All report statuses and generation dates',
                        data: reports.map(r => ({
                          id: r.id,
                          assessment_id: r.assessment_id,
                          status: r.status,
                          generated_at: r.generated_at,
                        })),
                        filename: 'compass_reports.csv',
                      },
                    ].map(item => (
                      <div key={item.label} className="bg-white border border-cborder rounded-xl p-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-navy font-body">{item.label}</p>
                          <p className="text-sm text-muted font-body mt-0.5">{item.desc}</p>
                          <p className="text-xs text-muted font-mono-data mt-1">{item.data.length} rows</p>
                        </div>
                        <Button
                          onClick={() => exportCSV(item.data, item.filename)}
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                        >
                          <Download size={14} /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
