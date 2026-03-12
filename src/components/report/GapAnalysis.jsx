import Spinner from '../ui/Spinner'

export default function GapAnalysis({ report, reportComplete }) {
  const data = report?.ai_gap_analysis

  return (
    <section id="gap-analysis" className="report-section px-4 md:px-8 py-10" style={{ background: '#f5f4f0' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-1">Section 10</p>
          <h2 className="font-display text-2xl" style={{ color: '#013147' }}>Gap Analysis</h2>
          <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'Inter, sans-serif', marginTop: '6px' }}>
            How your self-stated goals align with your psychometric profile — and what to do if they differ.
          </p>
        </div>

        {!data ? (
          reportComplete ? (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 2px 12px rgba(1,49,71,0.07)' }}>
              <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                Gap analysis will appear here after retaking the assessment with the updated platform.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3" style={{ padding: '32px', background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(1,49,71,0.07)' }}>
              <Spinner size="sm" />
              <span style={{ color: '#64748b', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>Analysing alignment between your goals and profile...</span>
            </div>
          )
        ) : data.has_gap === false ? (
          /* No gap — great alignment */
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '28px' }}>
            <div className="flex items-start gap-4">
              <span style={{ fontSize: '32px' }}>✅</span>
              <div>
                <h3 className="font-display text-lg mb-2" style={{ color: '#16a34a' }}>Strong Alignment</h3>
                <p style={{ color: '#166534', fontSize: '14px', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                  {data.alignment_message}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Gap found */
          <div>
            <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(1,49,71,0.07)', padding: '28px', marginBottom: '16px' }}>
              <div className="flex items-start gap-4 mb-4">
                <span style={{ fontSize: '32px' }}>🔍</span>
                <div>
                  <h3 className="font-display text-lg mb-2" style={{ color: '#013147' }}>Interesting Tension Found</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                    {data.alignment_message}
                  </p>
                </div>
              </div>

              {data.bridge_steps?.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ color: '#013147', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    Bridge Steps
                  </p>
                  <div className="space-y-2">
                    {data.bridge_steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span style={{ background: '#fb8403', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>
                          {i + 1}
                        </span>
                        <p style={{ color: '#013147', fontSize: '13px', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {data.hybrid_careers?.length > 0 && (
              <div style={{ background: '#e0f7fa', borderRadius: '12px', padding: '16px' }}>
                <p style={{ color: '#0e7490', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Hybrid Careers Worth Exploring
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.hybrid_careers.map((career, i) => (
                    <span
                      key={i}
                      style={{ background: '#fff', color: '#0e7490', border: '1px solid #a5f3fc', borderRadius: '999px', fontSize: '12px', padding: '4px 12px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                    >
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
