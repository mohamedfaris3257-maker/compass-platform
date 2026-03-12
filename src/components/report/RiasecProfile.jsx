import RiasecRadar from '../charts/RiasecRadar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Spinner from '../ui/Spinner'
import { themeNames } from '../../data/riasec-questions'

function parseStrengths(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  // Plain text string — split by newline, filter blank lines
  return raw.split('\n').filter(s => s.trim().length > 0)
}

export default function RiasecProfile({ assessment, report, reportComplete }) {
  const scores = assessment?.riasec_scores || {}
  const top3 = assessment?.riasec_top3 || ''
  const fullOrder = assessment?.riasec_order || ''
  const strengths = parseStrengths(report?.ai_strengths)

  const barData = ['R','I','A','S','E','C'].map(k => ({
    name: k,
    fullName: themeNames[k],
    score: parseFloat((scores[k] || 0).toFixed(2)),
  }))

  return (
    <section id="riasec" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 border-gold pl-6 mb-8">
        <h2 className="font-display text-3xl text-navy">Your Career Interest Profile (RIASEC)</h2>
      </div>

      <div className="prose max-w-none mb-8">
        <h3 className="font-display text-xl text-navy mb-3">What is RIASEC?</h3>
        <p className="text-navy/80 font-body leading-relaxed mb-4">Developed by psychologist Dr. John L. Holland in 1959, the RIASEC model proposes that people and work environments can both be classified into six types: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. Holland's research — spanning decades and hundreds of thousands of participants — showed that when a person's interest profile closely matches their work environment, they tend to report higher job satisfaction, better performance, and greater career longevity.</p>
        <p className="text-navy/80 font-body leading-relaxed mb-4">The six themes form a hexagonal model where adjacent themes share more overlap than opposite ones. For example, Investigative and Artistic are adjacent and often appear together in research-creative roles. Realistic and Social are opposite, though individuals certainly can show strength in both — it simply means they may be versatile across very different types of work.</p>
        <p className="text-navy/80 font-body leading-relaxed mb-4">The O*NET system (the US Department of Labor's career database, used globally) assigns RIASEC scores to over 1,000 occupations, enabling direct matching between a student's profile and real career data. Compass uses O*NET-derived career profiles for our core matching engine.</p>

        <h4 className="font-display text-lg text-navy mb-3 mt-6">How to read this section</h4>
        <ul className="space-y-2 text-navy/80 font-body">
          {[
            "Your top-3 code matters most — these are your dominant interest themes.",
            "A high score means this type of work environment may energise you. A lower score simply means it's less central to your current interests.",
            "Interest scores can shift with experience — especially at secondary school age.",
            "Look for careers that touch 2 or more of your top themes for the best fit.",
            "Use this section as a starting point for conversations, not a final answer.",
          ].map((p, i) => <li key={i} className="flex items-start gap-2"><span className="text-gold mt-1">•</span><span>{p}</span></li>)}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="font-body font-semibold text-navy mb-3 text-sm">Radar View</h4>
          <RiasecRadar scores={scores} />
        </div>
        <div>
          <h4 className="font-body font-semibold text-navy mb-3 text-sm">Score Breakdown</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical" margin={{ top:5, right:50, bottom:5, left:80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CF" horizontal={false} />
              <XAxis type="number" domain={[0,7]} tick={{ fontSize:11, fill:'#6B7C8D' }} />
              <YAxis type="category" dataKey="fullName" tick={{ fontSize:12, fill:'#1D334F' }} width={80} />
              <Tooltip formatter={(v) => [`${v.toFixed(1)} / 7`]} />
              <Bar dataKey="score" radius={[0,4,4,0]}>
                {barData.map((_, i) => <Cell key={i} fill={i < 3 ? '#EDC163' : '#DDD8CF'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-cream rounded-xl p-5 mb-6">
        <h4 className="font-display text-lg text-navy mb-3">Strength Highlights</h4>
        {strengths.length > 0 ? (
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-navy/80 font-body text-sm">
                <span className="text-gold mt-1 shrink-0">•</span><span>{s}</span>
              </li>
            ))}
          </ul>
        ) : reportComplete ? (
          <p className="text-sm text-muted font-body italic">Analysis unavailable — retake the assessment for full results.</p>
        ) : (
          <div className="flex items-center gap-2 text-muted"><Spinner size="sm" /><span className="text-sm font-body">Generating strength highlights...</span></div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon:'📊', title:'What this IS', text:'A measure of your current interest patterns across six broad work themes.' },
          { icon:'🚫', title:"What this ISN'T", text:'A measure of intelligence, skill level, or potential. All scores reflect interest, not ability.' },
          { icon:'🔄', title:'Can it change?', text:'Yes — interests evolve, especially through exposure to new subjects, activities, and experiences.' },
        ].map(item => (
          <div key={item.title} className="border border-cborder rounded-xl p-4">
            <span className="text-2xl">{item.icon}</span>
            <p className="font-semibold text-navy text-sm font-body mt-2 mb-1">{item.title}</p>
            <p className="text-muted text-xs font-body leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
