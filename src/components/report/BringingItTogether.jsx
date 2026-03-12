const columns = [
  {
    icon: '🎓',
    title: 'Students',
    points: [
      "Write down 3 careers that surprised you and 1 reason why each might fit.",
      "Try one new activity this term that connects to your top RIASEC theme.",
      "Ask a teacher or counsellor for one informational resource in your top career cluster.",
      "Return to this report after each major academic year to see if anything has shifted.",
    ]
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Parents & Guardians',
    points: [
      "Schedule a 30-minute conversation this week — ask 'Which part surprised you most?' first.",
      "Research one career your child found interesting and share one thing you learn about it.",
      "Avoid naming a preferred career path; ask about the type of work environment they'd enjoy.",
      "Remember: exploration at this age is the goal, not decision-making.",
    ]
  },
  {
    icon: '📚',
    title: 'Educators & Counsellors',
    points: [
      "Use the RIASEC top code to recommend relevant extra-curricular clubs or competitions.",
      "The personality signals can inform mentoring style — high-N students may need more check-ins.",
      "Encourage the student to try one career conversation with a professional in their top cluster.",
      "Revisit with the student before subject selection decisions.",
    ]
  },
]

const prompts = [
  "What's one thing in this report that resonates with something you already knew about yourself?",
  "What's one career you'd like to know more about, and why?",
  "If you could change one thing about how you work or learn, what would it be?",
]

export default function BringingItTogether() {
  return (
    <section id="bringing" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 border-gold pl-6 mb-8">
        <h2 className="font-display text-3xl text-navy">Bringing It All Together</h2>
      </div>

      <p className="text-navy/80 font-body leading-relaxed mb-8">
        A career report is most useful when it starts conversations, not when it ends them. Your results are a map — but maps don't make decisions, people do. The most important thing you can do with this report is to talk about it: with people you trust, with educators who know you, and with yourself when you're honest about what energises versus drains you.
      </p>

      <h3 className="font-display text-xl text-navy mb-4">Reflection Prompts</h3>
      <div className="space-y-3 mb-10">
        {prompts.map((p, i) => (
          <div key={i} className="bg-gold/10 border-l-4 border-gold rounded-r-xl px-5 py-4">
            <p className="text-navy font-body leading-relaxed">{p}</p>
          </div>
        ))}
      </div>

      <h3 className="font-display text-xl text-navy mb-6">Talk It Through</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map(col => (
          <div key={col.title} className="border border-cborder rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{col.icon}</span>
              <h4 className="font-display text-lg text-navy">{col.title}</h4>
            </div>
            <ul className="space-y-3">
              {col.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy/80 font-body">
                  <span className="text-gold mt-1 shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
