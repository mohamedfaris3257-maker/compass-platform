export default function ImportantNotes() {
  return (
    <section id="notes" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 border-gold pl-6 mb-8">
        <h2 className="font-display text-3xl text-navy">Important Notes & Support</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-red-200 bg-red-50 rounded-xl p-5">
          <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
            <span>🚫</span> This assessment does NOT...
          </h3>
          <ul className="space-y-3">
            {[
              "Measure intelligence, academic ability, or potential for success in any field.",
              "Make career decisions for you — it provides data to inform your own thinking.",
              "Predict your future or limit your options in any way. Low scores in one area don't close doors.",
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy/80 font-body">
                <span className="text-red-400 mt-1 shrink-0">✕</span><span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-success/30 bg-success/5 rounded-xl p-5">
          <h3 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
            <span>✅</span> This assessment DOES...
          </h3>
          <ul className="space-y-3">
            {[
              "Provide a research-backed starting point for career exploration conversations.",
              "Use validated psychometric frameworks (Holland 1959; McCrae & Costa 1987) adapted for secondary students.",
              "Generate personalised AI insights to make results more relevant to your individual context.",
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy/80 font-body">
                <span className="text-success mt-1 shrink-0">✓</span><span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-cream rounded-xl p-6 mb-6">
        <h3 className="font-display text-xl text-navy mb-3">Support & Guidance</h3>
        <p className="text-navy/80 font-body text-sm leading-relaxed">
          This report is designed to be used alongside conversations with school counsellors, career advisors, parents, and trusted mentors. If you're feeling uncertain or overwhelmed by career choices, please speak to your school's guidance team — they are your most important resource. This report is a starting point, not a standalone guide. Career exploration is a process, not an event.
        </p>
      </div>

      <div className="border border-cborder rounded-xl p-5 text-xs text-muted font-body leading-relaxed">
        <p className="font-semibold text-navy mb-2">Disclaimer</p>
        <p>
          The Compass Career Indicator is provided for exploratory and educational purposes only. Results are based on self-reported responses and standardised scoring algorithms. Scores should not be used as the sole basis for major educational or career decisions. Compass is not a licensed psychological assessment tool and does not replace professional career counselling. AI-generated content is clearly labelled and uses hedged language (may/might/could) to reflect the probabilistic nature of all career guidance. All data is handled in accordance with applicable privacy regulations. For questions, contact your school's career guidance team or the platform administrator.
        </p>
        <p className="mt-2">Compass Career Indicator v2.0 &bull; Powered by Claude (Anthropic) &bull; Career data from O*NET v28.0 &bull; Proplr 2024</p>
      </div>
    </section>
  )
}
