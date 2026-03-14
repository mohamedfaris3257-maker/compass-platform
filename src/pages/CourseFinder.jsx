import { useState } from 'react'
import { supabase } from '../services/supabase'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Chip from '../components/ui/Chip'
import Spinner from '../components/ui/Spinner'
import { Heart, ExternalLink, X } from 'lucide-react'
import { clsx } from 'clsx'

const COUNTRIES = [
  { code: 'USA', label: '🇺🇸 USA' },
  { code: 'UK', label: '🇬🇧 UK' },
  { code: 'Canada', label: '🇨🇦 Canada' },
  { code: 'India', label: '🇮🇳 India' },
  { code: 'Australia', label: '🇦🇺 Australia' },
  { code: 'UAE', label: '🇦🇪 UAE' },
  { code: 'Germany', label: '🇩🇪 Germany' },
]

const SUBJECT_AREAS = [
  'Technology', 'Business', 'Healthcare', 'Arts & Design', 'Education',
  'Science', 'Engineering', 'Law', 'Social Sciences',
]

const LEVELS = ['Undergraduate', 'Postgraduate', 'Both']

export default function CourseFinder() {
  const toast = useToast()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [shortlist, setShortlist] = useState([])
  const [showShortlist, setShowShortlist] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedCountries, setSelectedCountries] = useState([])
  const [level, setLevel] = useState('Undergraduate')
  const [tuitionMax, setTuitionMax] = useState(60000)
  const [careerInput, setCareerInput] = useState('')

  const toggleCountry = (c) => {
    setSelectedCountries(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  const handleSearch = async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      let query = supabase
        .from('universities')
        .select('*')
        .lte('tuition_usd_per_year', tuitionMax)
        .order('qs_ranking', { ascending: true, nullsFirst: false })

      if (selectedCountries.length > 0) {
        query = query.in('country', selectedCountries)
      }

      // Fetch broadly then filter client-side.
      // Server-side .contains() requires a jsonb column — client-side
      // filtering works regardless of how the DB stores subject_areas.
      const { data, error } = await query.limit(200)
      if (error) throw error

      let results = data || []

      // Client-side subject filter — handles array, string, or missing values
      if (selectedSubject) {
        const needle = selectedSubject.toLowerCase()
        results = results.filter(u => {
          if (Array.isArray(u.subject_areas)) {
            return u.subject_areas.some(s =>
              s.toLowerCase().includes(needle) || needle.includes(s.toLowerCase())
            )
          }
          if (typeof u.subject_areas === 'string') {
            return u.subject_areas.toLowerCase().includes(needle)
          }
          return false
        })
      }

      setResults(results.slice(0, 30))
    } catch (err) {
      toast(`Error searching programs: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleShortlist = (uni) => {
    setShortlist(prev => {
      const exists = prev.find(u => u.id === uni.id)
      if (exists) return prev.filter(u => u.id !== uni.id)
      return [...prev, uni]
    })
  }

  const isShortlisted = (id) => shortlist.some(u => u.id === id)

  const countryFlag = (c) => COUNTRIES.find(x => x.code === c)?.label?.split(' ')[0] || ''

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-navy mb-2">Course Finder</h1>
        <p className="text-muted font-body">Find university programs that match your career goals across 7 countries.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-cborder rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Career input */}
          <div>
            <label className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2 block">Career Goal</label>
            <input
              value={careerInput}
              onChange={e => setCareerInput(e.target.value)}
              placeholder="e.g. Software Developer, Nurse..."
              className="w-full border border-cborder rounded-xl px-3 py-2.5 text-sm font-body text-navy focus:outline-none focus:border-gold bg-white"
            />
          </div>

          {/* Subject area */}
          <div>
            <label className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2 block">Subject Area</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full border border-cborder rounded-xl px-3 py-2.5 text-sm font-body text-navy focus:outline-none focus:border-gold bg-white"
            >
              <option value="">All Subject Areas</option>
              {SUBJECT_AREAS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2 block">Level</label>
            <div className="flex gap-1.5">
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={clsx(
                    'flex-1 py-2 px-2 text-xs rounded-xl border font-body transition-colors',
                    level === l ? 'bg-navy text-white border-navy' : 'bg-white text-muted border-cborder hover:border-navy'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="md:col-span-2">
            <label className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2 block">Countries</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => toggleCountry(c.code)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-full border font-body transition-colors',
                    selectedCountries.includes(c.code)
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-muted border-cborder hover:border-navy'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tuition max */}
          <div>
            <label className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2 block">
              Max Tuition: ${tuitionMax.toLocaleString()}/year
            </label>
            <input
              type="range"
              min={0}
              max={60000}
              step={5000}
              value={tuitionMax}
              onChange={e => setTuitionMax(parseInt(e.target.value))}
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-[10px] text-muted mt-1">
              <span>Free</span><span>$60,000+</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleSearch} disabled={loading} size="md">
            {loading ? <><Spinner size="sm" /> Searching...</> : '🔍 Find Programs'}
          </Button>
        </div>
      </div>

      {/* Germany note */}
      {(selectedCountries.includes('Germany') || selectedCountries.length === 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700 font-body">
          🇩🇪 Most German public universities charge €0–500/semester in tuition fees — making Germany one of the most affordable options for international students.
        </div>
      )}

      {/* Shortlist button */}
      {shortlist.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowShortlist(true)}
            className="text-sm text-gold font-body font-medium hover:text-navy border border-gold/30 px-4 py-2 rounded-xl hover:bg-gold/5 transition-colors"
          >
            📋 Shortlist ({shortlist.length})
          </button>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted font-body">{results.length} programs found</p>
          {results.map(uni => (
            <div key={uni.id} className="bg-white border border-cborder rounded-xl p-5 hover:border-gold/50 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xl">{countryFlag(uni.country)}</span>
                    <h3 className="font-display text-lg text-navy">{uni.name}</h3>
                    {uni.qs_ranking && (
                      <Badge color={uni.qs_ranking <= 50 ? 'gold' : uni.qs_ranking <= 100 ? 'navy' : 'gray'}>
                        QS #{uni.qs_ranking}
                      </Badge>
                    )}
                    {uni.country === 'UAE' && (
                      <Badge color="green" className="text-[10px]">🏛️ KHDA Recognized</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted font-body">{uni.city}, {uni.country}</p>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted font-body">Tuition/year: </span>
                      <span className="font-semibold text-navy font-mono-data">
                        {uni.tuition_usd_per_year === 0 ? 'Free/Very Low' : `$${uni.tuition_usd_per_year?.toLocaleString()}`}
                      </span>
                      {uni.tuition_usd_per_year > 0 && (
                        <span className="text-muted text-xs ml-1">
                          (~AED {(uni.tuition_usd_per_year * 3.67).toLocaleString()})
                        </span>
                      )}
                    </div>
                    {uni.ielts_min && (
                      <div>
                        <span className="text-muted font-body">IELTS: </span>
                        <span className="font-semibold text-navy font-mono-data">{uni.ielts_min}+</span>
                      </div>
                    )}
                    {uni.scholarship_available && (
                      <Badge color="green" className="text-[10px]">Scholarship Available</Badge>
                    )}
                  </div>

                  {uni.programs && Array.isArray(uni.programs) && (
                    <div className="mt-3">
                      <p className="text-xs text-muted font-body mb-1.5">Programs offered:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {uni.programs.slice(0, 4).map((p, i) => <Chip key={i} color="muted">{p}</Chip>)}
                        {uni.programs.length > 4 && <Chip color="gray">+{uni.programs.length - 4} more</Chip>}
                      </div>
                    </div>
                  )}

                  {careerInput && (
                    <p className="text-xs text-muted font-body mt-2 italic">
                      ✓ This university may prepare you for <strong>{careerInput}</strong> roles
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => toggleShortlist(uni)}
                    className={clsx(
                      'p-2 rounded-lg border transition-colors',
                      isShortlisted(uni.id)
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'bg-white border-cborder text-muted hover:text-red-400 hover:border-red-200'
                    )}
                    title={isShortlisted(uni.id) ? 'Remove from shortlist' : 'Add to shortlist'}
                  >
                    <Heart size={18} fill={isShortlisted(uni.id) ? 'currentColor' : 'none'} />
                  </button>
                  {uni.website && (
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-cborder text-muted hover:text-navy hover:border-navy transition-colors"
                      title="Visit website"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <div className="text-center py-20 text-muted">
          <div className="text-5xl mb-4">🎓</div>
          <p className="font-display text-xl text-navy mb-2">No programs found</p>
          <p className="font-body text-sm">Try broadening your filters — for example, increase the tuition maximum or select more countries.</p>
        </div>
      )}

      {!loading && !hasSearched && (
        <div className="text-center py-20 text-muted">
          <div className="text-5xl mb-4">🎓</div>
          <p className="font-display text-xl text-navy mb-2">Find your perfect program</p>
          <p className="font-body text-sm">Use the filters above and click "Find Programs" to explore 70+ universities across 7 countries.</p>
        </div>
      )}

      {/* Shortlist modal */}
      {showShortlist && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowShortlist(false)}>
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-cborder sticky top-0 bg-white">
              <h3 className="font-display text-xl text-navy">My Shortlist ({shortlist.length})</h3>
              <button onClick={() => setShowShortlist(false)} className="text-muted hover:text-navy p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {shortlist.map(uni => (
                <div key={uni.id} className="border border-cborder rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy font-body">{uni.name}</p>
                    <p className="text-sm text-muted">{uni.city}, {uni.country}</p>
                    <p className="text-sm text-success font-mono-data">
                      {uni.tuition_usd_per_year === 0 ? 'Free' : `$${uni.tuition_usd_per_year?.toLocaleString()}/year`}
                    </p>
                  </div>
                  <button onClick={() => toggleShortlist(uni)} className="text-red-400 hover:text-red-600 p-2">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {shortlist.length >= 2 && (
                <div className="bg-cream rounded-xl p-4 text-center">
                  <p className="text-sm text-muted font-body">Compare feature coming soon. Visit each university's website to compare programs directly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
