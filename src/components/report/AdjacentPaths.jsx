import Spinner from '../ui/Spinner'
import Chip from '../ui/Chip'
import { Link } from 'react-router-dom'
import { SOC_GROUP_NAMES } from '../../utils/clustering'

export default function AdjacentPaths({ clusters = [], report, reportComplete }) {
  const aiClusters = report?.ai_clusters || {}

  return (
    <section id="adjacent" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 border-gold pl-6 mb-8">
        <h2 className="font-display text-3xl text-navy">Adjacent & Alternative Paths</h2>
        <p className="text-muted font-body mt-2">Careers in the same clusters as your top matches</p>
      </div>

      <p className="text-navy/80 font-body leading-relaxed mb-6">
        Your top career matches tend to cluster around 2–3 occupational families. Within each cluster, there are many more roles that share similar skills, work environments, and interest themes — some of which may fit you even better once you explore them.
      </p>

      <div className="bg-cream rounded-xl p-4 mb-8">
        <h4 className="font-body font-semibold text-navy mb-2 text-sm">How we built this</h4>
        <ul className="space-y-1 text-xs text-muted font-body">
          {[
            "We grouped your top matches by US Department of Labor SOC occupational family codes.",
            "Careers within the same family share broadly similar skill requirements and work environments.",
            "Adjacent careers are those in the same family but not in your top matches — worth exploring.",
            "AI generated a name and summary for each cluster based on your specific interest profile.",
          ].map((p, i) => <li key={i} className="flex items-start gap-2"><span className="text-gold">•</span><span>{p}</span></li>)}
        </ul>
      </div>

      {clusters.length === 0 ? (
        reportComplete ? (
          <div className="text-center py-8 text-muted">
            <p className="font-body text-sm">Cluster data unavailable — retake the assessment for full results.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted py-8 justify-center">
            <Spinner size="sm" /> <span className="font-body text-sm">Building your career clusters...</span>
          </div>
        )
      ) : (
        <div className="space-y-8">
          {clusters.slice(0, 3).map((cluster, idx) => {
            const clusterKey = cluster.prefix
            const aiData = aiClusters[clusterKey] || {}
            const groupName = SOC_GROUP_NAMES[clusterKey] || `Group ${clusterKey}`

            return (
              <div key={clusterKey} className="border border-cborder rounded-xl overflow-hidden">
                <div className="bg-navyMid/5 px-5 py-4 border-b border-cborder">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono-data bg-navy text-white px-2 py-0.5 rounded">{clusterKey}-xxxx</span>
                    <h3 className="font-display text-xl text-navy">
                      {aiData.name || groupName}
                    </h3>
                  </div>
                  {aiData.one_line && (
                    <p className="text-sm text-muted font-body mt-1">{aiData.one_line}</p>
                  )}
                </div>

                <div className="px-5 py-4 space-y-4">
                  {aiData.why_appears ? (
                    <p className="text-sm text-navy/80 font-body leading-relaxed">{aiData.why_appears}</p>
                  ) : reportComplete ? (
                    <p className="text-xs text-muted font-body italic">Analysis unavailable — retake the assessment for full results.</p>
                  ) : (
                    <div className="flex items-center gap-2 text-muted"><Spinner size="sm" /><span className="text-xs">Generating cluster analysis...</span></div>
                  )}

                  <div>
                    <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">Seed roles from your results</p>
                    <div className="flex flex-wrap gap-2">
                      {(cluster.seedCareers || []).map(c => (
                        <Chip key={c.soc_code} color="gold">{c.title}</Chip>
                      ))}
                    </div>
                  </div>

                  {(cluster.adjacentCareers || []).length > 0 && (
                    <div>
                      <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-2">More to explore in this cluster</p>
                      <div className="flex flex-wrap gap-2">
                        {cluster.adjacentCareers.map(c => (
                          <Chip key={c.soc_code} color="muted">{c.title}</Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to="/careers"
                    className="inline-flex items-center gap-1 text-sm text-gold font-body font-medium hover:text-navy transition-colors"
                  >
                    Explore in Career Finder →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
