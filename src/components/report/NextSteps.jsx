const columns = [
  {
    emoji: '🏫',
    title: 'At School',
    steps: [
      "Ask your school counsellor for career exploration resources in your top cluster.",
      "Join one club or competition that aligns with your top RIASEC theme this term.",
      "Choose one elective or optional unit that connects to a career you're curious about.",
      "Ask a teacher in a relevant subject about their own career journey.",
    ]
  },
  {
    emoji: '🏠',
    title: 'At Home',
    steps: [
      "Spend 20 minutes reading about one career from your report that surprised you.",
      "Watch a YouTube documentary or listen to a podcast episode from someone in a top match career.",
      "Write a short reflection: 'In 5 years, I'd love to be working on...'",
      "Share one section of this report with a family member and ask what they think.",
    ]
  },
  {
    emoji: '🌍',
    title: 'In Your Community',
    steps: [
      "Reach out via LinkedIn to one professional in a career you're curious about.",
      "Attend a career fair, university open day, or industry event this semester.",
      "Volunteer or shadow someone in a field related to your top career cluster.",
      "Join an online community or forum related to one of your interest themes.",
    ]
  },
]

const revisitTriggers = [
  "Before choosing your GCSE, IB, A-Level, or university subjects",
  "After completing an internship, project, or significant new experience",
  "At the start of each new academic year to track how your interests are evolving",
]

export default function NextSteps() {
  return (
    <section id="next-steps" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 border-gold pl-6 mb-8">
        <h2 className="font-display text-3xl text-navy">Your Next Steps</h2>
        <p className="text-muted font-body mt-2">Concrete actions to move from exploration to experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {columns.map(col => (
          <div key={col.title} className="bg-white border border-cborder rounded-xl p-5">
            <div className="text-3xl mb-3">{col.emoji}</div>
            <h3 className="font-display text-xl text-navy mb-4">{col.title}</h3>
            <ul className="space-y-3">
              {col.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy/80 font-body leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center mt-0.5 font-mono-data">{i+1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-cream rounded-xl p-6">
        <h3 className="font-display text-xl text-navy mb-4">When to Revisit This Report</h3>
        <p className="text-navy/70 font-body text-sm mb-4">
          Interests evolve — especially during secondary school. We recommend returning to Compass at these moments:
        </p>
        <ul className="space-y-2">
          {revisitTriggers.map((trigger, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-navy font-body">
              <span className="text-gold text-base mt-0.5">🔄</span>
              <span>{trigger}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
