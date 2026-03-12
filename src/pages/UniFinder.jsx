import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../services/supabase'
import { useToast } from '../components/ui/Toast'
import Badge from '../components/ui/Badge'
import Chip from '../components/ui/Chip'
import Spinner from '../components/ui/Spinner'
import { Heart, ExternalLink, X } from 'lucide-react'
import { clsx } from 'clsx'

const COUNTRIES = [
  { code: 'USA', label: 'USA', flag: '🇺🇸' },
  { code: 'UK', label: 'UK', flag: '🇬🇧' },
  { code: 'Canada', label: 'Canada', flag: '🇨🇦' },
  { code: 'India', label: 'India', flag: '🇮🇳' },
  { code: 'Australia', label: 'Australia', flag: '🇦🇺' },
  { code: 'UAE', label: 'UAE', flag: '🇦🇪' },
  { code: 'Germany', label: 'Germany', flag: '🇩🇪' },
]

const SUBJECT_AREAS = [
  'Technology', 'Business', 'Healthcare', 'Arts & Design', 'Education',
  'Science', 'Engineering', 'Law', 'Social Sciences',
]

const QS_FILTERS = [
  { value: '', label: 'Any Ranking' },
  { value: '50', label: 'Top 50' },
  { value: '100', label: 'Top 100' },
  { value: '200', label: 'Top 200' },
]

const TUITION_FILTERS = [
  { value: '', label: 'Any Tuition' },
  { value: 'free', label: 'Free / Low (≤$1k)' },
  { value: '10000', label: 'Under $10k' },
  { value: '30000', label: '$10k–$30k' },
  { value: '60000', label: '$30k–$60k' },
]

const SORTS = [
  { value: 'qs', label: 'QS Ranking' },
  { value: 'tuition_asc', label: 'Tuition: Low–High' },
  { value: 'tuition_desc', label: 'Tuition: High–Low' },
]

function getAdmitChance(qsRanking) {
  if (!qsRanking) return 'Varies'
  if (qsRanking <= 50) return 'Competitive'
  if (qsRanking <= 200) return 'Selective'
  return 'Accessible'
}

function getAdmitColor(chance) {
  if (chance === 'Competitive') return 'amber'
  if (chance === 'Selective') return 'blue'
  return 'green'
}

export default function UniFinder() {
  const toast = useToast()
  const [activeCountry, setActiveCountry] = useState('USA')
  const [unis, setUnis] = useState([])
  const [loading, setLoading] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [availablePrograms, setAvailablePrograms] = useState([])

  const [subjectArea, setSubjectArea] = useState('')
  const [programme, setProgramme] = useState('')
  const [qsFilter, setQsFilter] = useState('')
  const [tuitionFilter, setTuitionFilter] = useState('')
  const [scholarshipOnly, setScholarshipOnly] = useState(false)
  const [sortBy, setSortBy] = useState('qs')

  // Fetch all unis for the active country, apply all other filters client-side
  useEffect(() => { fetchUnis() }, [activeCountry])

  // Reset programme when country changes
  useEffect(() => { setProgramme('') }, [activeCountry])

  const fetchUnis = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('universities')
        .select('*')
        .eq('country', activeCountry)
        .order('qs_ranking', { ascending: true, nullsFirst: false })

      const { data, error } = await query
      if (error) throw error
      const results = data || []
      setUnis(results)

      // Collect unique programme names for the dropdown
      const allPrograms = new Set()
      results.forEach(u => {
        if (Array.isArray(u.programs)) {
          u.programs.forEach(p => allPrograms.add(p))
        }
      })
      setAvailablePrograms([...allPrograms].sort())
    } catch (err) {
      toast(`Error loading universities: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtering with AND logic for all active filters
  const filteredUnis = useMemo(() => {
    let result = [...unis]

    if (subjectArea) {
      result = result.filter(u => Array.isArray(u.subject_areas) && u.subject_areas.includes(subjectArea))
    }
    if (programme) {
      result = result.filter(u => Array.isArray(u.programs) && u.programs.includes(programme))
    }
    if (qsFilter) {
      result = result.filter(u => u.qs_ranking && u.qs_ranking <= parseInt(qsFilter))
    }
    if (tuitionFilter === 'free') {
      result = result.filter(u => u.tuition_usd_per_year <= 1000)
    } else if (tuitionFilter === '10000') {
      result = result.filter(u => u.tuition_usd_per_year <= 10000)
    } else if (tuitionFilter === '30000') {
      result = result.filter(u => u.tuition_usd_per_year >= 10000 && u.tuition_usd_per_year <= 30000)
    } else if (tuitionFilter === '60000') {
      result = result.filter(u => u.tuition_usd_per_year >= 30000 && u.tuition_usd_per_year <= 60000)
    }
    if (scholarshipOnly) {
      result = result.filter(u => u.scholarship_available === true)
    }

    // Sort
    if (sortBy === 'tuition_asc') {
      result.sort((a, b) => (a.tuition_usd_per_year ?? Infinity) - (b.tuition_usd_per_year ?? Infinity))
    } else if (sortBy === 'tuition_desc') {
      result.sort((a, b) => (b.tuition_usd_per_year ?? -Infinity) - (a.tuition_usd_per_year ?? -Infinity))
    }
    // 'qs' is already ordered from DB

    return result
  }, [unis, subjectArea, programme, qsFilter, tuitionFilter, scholarshipOnly, sortBy])

  const toggleWishlist = (uni) => {
    setWishlist(prev => {
      const exists = prev.find(u => u.id === uni.id)
      if (exists) return prev.filter(u => u.id !== uni.id)
      return [...prev, uni]
    })
  }

  const isWishlisted = (id) => wishlist.some(u => u.id === id)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-navy mb-2">University Finder</h1>
        <p className="text-muted font-body">Browse 70+ universities across 7 countries, matched to your career path.</p>
      </div>

      {/* Country tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-6 -webkit-overflow-scrolling-touch">
        {COUNTRIES.map(c => (
          <button
            key={c.code}
            onClick={() => setActiveCountry(c.code)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-body font-medium whitespace-nowrap transition-all shrink-0',
              activeCountry === c.code
                ? 'bg-navy text-white border-navy shadow-sm'
                : 'bg-white text-muted border-cborder hover:border-navy hover:text-navy'
            )}
          >
            <span className="text-base">{c.flag}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Germany note */}
      {activeCountry === 'Germany' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm text-blue-700 font-body">
          🇩🇪 Most German public universities charge €0–500/semester in tuition fees. This makes Germany one of the most affordable study destinations for international students.
        </div>
      )}

      {/* Sub-filters */}
      <div className="bg-white border border-cborder rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <select
          value={subjectArea}
          onChange={e => setSubjectArea(e.target.value)}
          className="border border-cborder rounded-xl px-3 py-2 text-sm font-body text-navy focus:outline-none focus:border-gold bg-white"
        >
          <option value="">All Subjects</option>
          {SUBJECT_AREAS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={programme}
          onChange={e => setProgramme(e.target.value)}
          className="border border-cborder rounded-xl px-3 py-2 text-sm font-body text-navy focus:outline-none focus:border-gold bg-white"
        >
          <option value="">All Programmes</option>
          {availablePrograms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={qsFilter}
          onChange={e => setQsFilter(e.target.value)}
          className="border border-cborder rounded-xl px-3 py-2 text-sm font-body text-navy focus:outline-none focus:border-gold bg-white"
        >
          {QS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <select
          value={tuitionFilter}
          onChange={e => setTuitionFilter(e.target.value)}
          className="border border-cborder rounded-xl px-3 py-2 text-sm font-body text-navy focus:outline-none focus:border-gold bg-white"
        >
          {TUITION_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <label className="flex items-center gap-2 text-sm font-body text-navy cursor-pointer">
          <input
            type="checkbox"
            checked={scholarshipOnly}
            onChange={e => setScholarshipOnly(e.target.checked)}
            className="accent-gold w-4 h-4"
          />
          Scholarship Available
        </label>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border border-cborder rounded-xl px-3 py-2 text-sm font-body text-navy focus:outline-none focus:border-gold bg-white ml-auto"
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Results count */}
      {!loading && filteredUnis.length > 0 && (
        <p className="text-sm text-muted font-body mb-4">{filteredUnis.length} universities in {activeCountry}</p>
      )}

      {/* Results grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUnis.map(uni => {
            const admitChance = getAdmitChance(uni.qs_ranking)
            const aedTuition = uni.tuition_usd_per_year ? Math.round(uni.tuition_usd_per_year * 3.67).toLocaleString() : null

            return (
              <div key={uni.id} className="bg-white border border-cborder rounded-xl p-5 hover:border-gold/50 hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className="font-display text-lg text-navy leading-tight">{uni.name}</h3>
                    <p className="text-sm text-muted font-body mt-0.5">{uni.city}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {uni.qs_ranking ? (
                      <Badge color={uni.qs_ranking <= 50 ? 'gold' : uni.qs_ranking <= 100 ? 'navy' : 'gray'}>
                        QS #{uni.qs_ranking}
                      </Badge>
                    ) : (
                      <Badge color="gray">Unranked</Badge>
                    )}
                    {uni.country === 'UAE' && (
                      <Badge color="blue" className="text-[10px]">🏛️ KHDA</Badge>
                    )}
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-cream rounded-lg p-2.5">
                    <p className="text-[10px] text-muted font-mono-data uppercase tracking-wide">Tuition/year</p>
                    <p className="text-sm font-bold text-navy font-mono-data mt-0.5">
                      {uni.tuition_usd_per_year === 0 ? 'Free / ~€500' : `$${uni.tuition_usd_per_year?.toLocaleString()}`}
                    </p>
                    {aedTuition && uni.tuition_usd_per_year > 0 && (
                      <p className="text-[10px] text-muted font-body">≈ AED {aedTuition}</p>
                    )}
                  </div>
                  <div className="bg-cream rounded-lg p-2.5">
                    <p className="text-[10px] text-muted font-mono-data uppercase tracking-wide">IELTS Min</p>
                    <p className="text-sm font-bold text-navy font-mono-data mt-0.5">
                      {uni.ielts_min ? `${uni.ielts_min}+` : 'Not required'}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {uni.scholarship_available && <Badge color="green" className="text-[10px]">Scholarship Available</Badge>}
                  <Badge color={getAdmitColor(admitChance)} className="text-[10px]">
                    {admitChance === 'Varies' ? '? Selectivity Varies' : `Admit: ${admitChance}`}
                  </Badge>
                </div>

                {/* Programs */}
                {uni.programs && Array.isArray(uni.programs) && (
                  <div className="mb-3">
                    <p className="text-[10px] text-muted font-mono-data uppercase tracking-wide mb-1.5">Programs</p>
                    <div className="flex flex-wrap gap-1">
                      {uni.programs.slice(0, 3).map((p, i) => (
                        <Chip
                          key={i}
                          color={programme && p === programme ? 'teal' : 'muted'}
                        >
                          {p}
                        </Chip>
                      ))}
                      {uni.programs.length > 3 && <Chip color="gray">+{uni.programs.length - 3}</Chip>}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-cborder">
                  <button
                    onClick={() => toggleWishlist(uni)}
                    className={clsx(
                      'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors font-body',
                      isWishlisted(uni.id)
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-cborder text-muted hover:text-red-400 hover:border-red-200'
                    )}
                  >
                    <Heart size={12} fill={isWishlisted(uni.id) ? 'currentColor' : 'none'} />
                    {isWishlisted(uni.id) ? 'Saved' : 'Add to Wishlist'}
                  </button>
                  {uni.website && (
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-cborder text-muted hover:text-navy hover:border-navy transition-colors font-body ml-auto"
                    >
                      Visit Website <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && filteredUnis.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏛️</div>
          <p className="font-display text-xl text-navy mb-2">No universities found</p>
          <p className="text-muted font-body text-sm">Try adjusting your filters</p>
        </div>
      )}

      {/* Floating wishlist bar */}
      {wishlist.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4 z-50">
          <Heart size={18} fill="currentColor" className="text-red-400" />
          <span className="font-body text-sm">
            {wishlist.length} {wishlist.length === 1 ? 'university' : 'universities'} saved
          </span>
          <button
            onClick={() => setWishlistOpen(true)}
            className="bg-gold text-navy text-xs px-3 py-1.5 rounded-full font-semibold hover:bg-goldLight transition-colors"
          >
            View Wishlist
          </button>
        </div>
      )}

      {/* Wishlist drawer */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setWishlistOpen(false)}>
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-cborder">
              <h3 className="font-display text-xl text-navy">My Wishlist ({wishlist.length})</h3>
              <button onClick={() => setWishlistOpen(false)} className="text-muted hover:text-navy p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {wishlist.map(uni => (
                <div key={uni.id} className="flex items-center justify-between border border-cborder rounded-xl p-4">
                  <div>
                    <p className="font-semibold text-navy font-body">{uni.name}</p>
                    <p className="text-sm text-muted">{uni.city}, {uni.country}</p>
                    <p className="text-sm text-success font-mono-data">
                      {uni.tuition_usd_per_year === 0 ? 'Free' : `$${uni.tuition_usd_per_year?.toLocaleString()}/yr`}
                    </p>
                  </div>
                  <button onClick={() => toggleWishlist(uni)} className="text-red-400 hover:text-red-600 p-2">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {wishlist.length >= 2 && (
                <div className="bg-cream rounded-xl p-3 text-center text-xs text-muted font-body">
                  Tip: Visit each university website to compare programs, entry requirements, and scholarships directly.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
