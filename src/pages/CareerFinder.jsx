import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Chip from '../components/ui/Chip'
import Spinner from '../components/ui/Spinner'
import MatchGauge from '../components/charts/MatchGauge'
import CareerChatWidget from '../components/careers/CareerChatWidget'
import DemandChip from '../components/careers/DemandChip'
import { Search, Filter, X, ChevronDown, ChevronUp, MessageSquare, Bookmark } from 'lucide-react'
import { clsx } from 'clsx'

const RIASEC_LETTERS = ['R', 'I', 'A', 'S', 'E', 'C']
const RIASEC_NAMES = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
}
const SOC_GROUPS = [
  { value: '', label: 'All Groups' },
  { value: '15', label: 'Tech (15)' },
  { value: '25', label: 'Education (25)' },
  { value: '29', label: 'Healthcare (29)' },
  { value: '13', label: 'Business (13)' },
  { value: '17', label: 'Engineering (17)' },
  { value: '27', label: 'Arts (27)' },
  { value: '19', label: 'Science (19)' },
  { value: '23', label: 'Law (23)' },
  { value: '11', label: 'Management (11)' },
  { value: 'modern', label: 'Modern ✨' },
]

const PAGE_SIZE = 24

function CareerSearchCard({ career, savedIds, onSave, studentProfile }) {
  const [expanded, setExpanded] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const topThemes = ['r', 'i', 'a', 's', 'e', 'c']
    .map(d => ({ key: d.toUpperCase(), score: career[`${d}_score`] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const isSaved = savedIds?.has(career.soc_code)

  return (
    <>
      <div
        className={clsx(
          'bg-white border rounded-xl shadow-sm hover:shadow-md transition-all',
          expanded ? 'border-gold' : 'border-cborder hover:border-gold/50'
        )}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              {career.source === 'modern' && (
                <Badge color="gold" className="mb-1 text-[10px]">
                  ✨ Emerging
                </Badge>
              )}
              {career.source === 'onet' && (
                <Badge color="navy" className="mb-1 text-[10px]">
                  O*NET
                </Badge>
              )}
              <h3 className="font-display text-base text-navy leading-tight">{career.title}</h3>
              <p className="text-xs font-mono-data text-muted mt-0.5">SOC {career.soc_code}</p>
            </div>
            {career.job_zone && (
              <Badge color="gray" className="shrink-0 text-[10px]">
                Zone {career.job_zone}
              </Badge>
            )}
          </div>

          {/* RIASEC themes */}
          <div className="flex gap-1 mb-2">
            {topThemes.map(t => (
              <Chip key={t.key} color="navy" className="text-[10px]">
                {t.key}
              </Chip>
            ))}
          </div>

          {/* Salary */}
          {career.salary_usd_low && (
            <div className="mb-2">
              <p className="text-sm text-success font-semibold">
                AED {Math.round(career.salary_usd_low * 3.67).toLocaleString()}k – AED {Math.round(career.salary_usd_high * 3.67).toLocaleString()}k / year
              </p>
              <p className="text-[10px] text-muted font-mono-data">
                (${career.salary_usd_low}k – ${career.salary_usd_high}k USD)
              </p>
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-muted font-body leading-relaxed line-clamp-2 mb-3">
            {career.description}
          </p>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setChatOpen(true)}
              className="text-xs text-muted hover:text-navy flex items-center gap-1 px-2 py-1 rounded border border-cborder hover:border-navy transition-colors"
            >
              <MessageSquare size={12} /> Ask AI
            </button>
            <button
              onClick={() => onSave(career.soc_code)}
              className={clsx(
                'text-xs flex items-center gap-1 px-2 py-1 rounded border transition-colors',
                isSaved
                  ? 'bg-gold text-navy border-gold'
                  : 'text-muted hover:text-navy border-cborder hover:border-navy'
              )}
            >
              <Bookmark size={12} /> {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-gold hover:text-navy flex items-center gap-1 px-2 py-1 rounded border border-gold/30 hover:border-navy transition-colors ml-auto"
            >
              {expanded ? (
                <>
                  <ChevronUp size={12} />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown size={12} />
                  Explore
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expanded */}
        {expanded && career.details && (
          <div className="border-t border-cborder px-4 py-4 space-y-3">
            <div>
              <p className="text-[10px] font-mono-data text-muted uppercase tracking-wide mb-1.5">
                Key Tasks
              </p>
              <ul className="space-y-1">
                {(career.details?.tasks || []).slice(0, 3).map((t, i) => (
                  <li key={i} className="text-xs text-navy/80 font-body flex gap-1.5">
                    <span className="text-gold shrink-0">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-mono-data text-muted uppercase tracking-wide mb-1.5">
                Education
              </p>
              <p className="text-xs text-navy/80 font-body">{career.details?.education_req}</p>
            </div>
            {career.details?.alt_titles?.length > 0 && (
              <div>
                <p className="text-[10px] font-mono-data text-muted uppercase tracking-wide mb-1.5">
                  Also known as
                </p>
                <div className="flex flex-wrap gap-1">
                  {career.details.alt_titles.map((t, i) => (
                    <Chip key={i} color="muted">
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CareerChatWidget
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        careerTitle={career.title}
        studentProfile={studentProfile}
      />
    </>
  )
}

export default function CareerFinder() {
  const toast = useToast()
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [savedIds, setSavedIds] = useState(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedThemes, setSelectedThemes] = useState([])
  const [socGroup, setSocGroup] = useState('')
  const [jobZone, setJobZone] = useState(0)
  const [source, setSource] = useState('all')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')

  // Student profile from localStorage
  const [myProfile, setMyProfile] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('compass_assessment')
    if (stored) {
      try {
        setMyProfile(JSON.parse(stored))
      } catch {}
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchCareers = useCallback(
    async (reset = false) => {
      setLoading(true)
      try {
        const currentPage = reset ? 0 : page
        const from = currentPage * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        let query = supabase.from('careers').select('*').range(from, to)

        if (debouncedSearch) {
          query = query.ilike('title', `%${debouncedSearch}%`)
        }
        // NOTE: RIASEC theme filter is applied client-side (see below) to avoid
        // PostgREST .or() format issues across different Supabase client versions.
        if (socGroup && socGroup !== 'modern') {
          query = query.like('soc_code', `${socGroup}%`)
        }
        if (socGroup === 'modern') {
          query = query.eq('source', 'modern')
        }
        if (jobZone > 0) {
          query = query.lte('job_zone', jobZone)
        }
        if (source !== 'all') {
          query = query.eq('source', source)
        }
        if (salaryMin) {
          query = query.gte('salary_usd_low', parseInt(salaryMin))
        }
        if (salaryMax) {
          query = query.lte('salary_usd_high', parseInt(salaryMax))
        }

        const { data, error } = await query

        if (error) throw error

        // Client-side RIASEC theme filter — at least one selected theme must score ≥ 4
        let filtered = data || []
        if (selectedThemes.length > 0) {
          filtered = filtered.filter(c =>
            selectedThemes.some(t => (c[`${t.toLowerCase()}_score`] || 0) >= 4)
          )
        }

        if (reset) {
          setCareers(filtered)
          setPage(0)
        } else {
          setCareers(prev => [...prev, ...filtered])
        }
        setHasMore((data || []).length === PAGE_SIZE)
      } catch (err) {
        toast(`Error loading careers: ${err.message}`, 'error')
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, selectedThemes, socGroup, jobZone, source, salaryMin, salaryMax, page]
  )

  useEffect(() => {
    fetchCareers(true)
  }, [debouncedSearch, selectedThemes, socGroup, jobZone, source, salaryMin, salaryMax])

  const toggleTheme = t => {
    setSelectedThemes(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]))
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedThemes([])
    setSocGroup('')
    setJobZone(0)
    setSource('all')
    setSalaryMin('')
    setSalaryMax('')
  }

  const useMyProfile = () => {
    if (!myProfile?.top3) return
    setSelectedThemes(myProfile.top3.split(''))
  }

  const handleSave = socCode => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(socCode)) next.delete(socCode)
      else next.add(socCode)
      return next
    })
  }

  const studentProfile = myProfile
    ? {
        top3: myProfile.top3,
        dominantTrait: myProfile.dominantTrait,
        hobbies: '',
      }
    : {}

  const FilterSidebar = () => (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search careers..."
          className="w-full pl-9 pr-3 py-2.5 border border-cborder rounded-xl text-sm font-body text-navy focus:outline-none focus:border-gold bg-white"
        />
      </div>

      {/* My Profile toggle */}
      {myProfile && (
        <button
          onClick={useMyProfile}
          className="w-full text-sm text-gold border border-gold/30 rounded-xl py-2 px-3 hover:bg-gold/10 transition-colors font-body text-left"
        >
          🎯 Filter by my profile ({myProfile.top3})
        </button>
      )}

      {/* RIASEC themes */}
      <div>
        <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">
          Interest Themes
        </p>
        <div className="flex flex-wrap gap-1.5">
          {RIASEC_LETTERS.map(t => (
            <button
              key={t}
              onClick={() => toggleTheme(t)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                selectedThemes.includes(t)
                  ? 'bg-gold text-navy border-gold'
                  : 'bg-white text-muted border-cborder hover:border-gold hover:text-navy'
              )}
              title={RIASEC_NAMES[t]}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SOC Group */}
      <div>
        <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">SOC Group</p>
        <select
          value={socGroup}
          onChange={e => setSocGroup(e.target.value)}
          className="w-full border border-cborder rounded-xl px-3 py-2 text-sm font-body text-navy focus:outline-none focus:border-gold bg-white"
        >
          {SOC_GROUPS.map(g => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* Job Zone */}
      <div>
        <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">
          Preparation Level (Zone {jobZone || 'Any'})
        </p>
        <input
          type="range"
          min={0}
          max={5}
          value={jobZone}
          onChange={e => setJobZone(parseInt(e.target.value))}
          className="w-full accent-gold"
        />
        <div className="flex justify-between text-[10px] text-muted">
          <span>Any</span>
          <span>Zone 5</span>
        </div>
      </div>

      {/* Source */}
      <div>
        <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">Source</p>
        <div className="flex gap-1.5">
          {['all', 'onet', 'modern'].map(s => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors flex-1',
                source === s
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-muted border-cborder hover:border-navy'
              )}
            >
              {s === 'all' ? 'All' : s === 'onet' ? 'O*NET' : '✨ Modern'}
            </button>
          ))}
        </div>
      </div>

      {/* Salary range */}
      <div>
        <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">
          Salary Range (USD k)
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            value={salaryMin}
            onChange={e => setSalaryMin(e.target.value)}
            placeholder="Min"
            className="w-1/2 border border-cborder rounded-lg px-2 py-2 text-sm font-body focus:outline-none focus:border-gold"
          />
          <input
            type="number"
            value={salaryMax}
            onChange={e => setSalaryMax(e.target.value)}
            placeholder="Max"
            className="w-1/2 border border-cborder rounded-lg px-2 py-2 text-sm font-body focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="w-full text-sm text-muted hover:text-navy border border-cborder rounded-xl py-2 px-3 hover:bg-cream transition-colors font-body"
      >
        Clear All Filters
      </button>

      <p className="text-xs text-muted font-mono-data text-center">
        Showing {careers.length} careers
      </p>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-white border-r border-cborder p-5">
        <h2 className="font-display text-lg text-navy mb-4">Filter Careers</h2>
        <FilterSidebar />
      </aside>

      {/* Main */}
      <main className="flex-1 px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-navy">Career Finder</h1>
            <p className="text-muted font-body text-sm mt-1">
              Explore {careers.length}+ careers matched to your interests
            </p>
          </div>
          <button
            className="md:hidden flex items-center gap-2 text-sm font-body border border-cborder rounded-xl px-3 py-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {loading && careers.length === 0 ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : careers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-display text-xl text-navy mb-2">No careers found</p>
            <p className="text-muted font-body text-sm mb-6">Try adjusting your filters</p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {careers.map(career => (
                <CareerSearchCard
                  key={career.soc_code}
                  career={career}
                  savedIds={savedIds}
                  onSave={handleSave}
                  studentProfile={studentProfile}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPage(p => p + 1)
                    fetchCareers()
                  }}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-navy/50" />
          <div
            className="absolute left-0 top-0 bottom-0 w-80 bg-white p-5 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-navy">Filters</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-muted" />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  )
}
