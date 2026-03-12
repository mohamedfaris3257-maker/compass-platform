import Card from '../ui/Card'

const audiences = [
  {
    icon: '🎓',
    title: 'Students',
    points: [
      "Read the whole report before drawing conclusions — patterns matter more than any single number.",
      "Your top code is a starting point, not a destination. Many careers blend multiple themes.",
      "If a career surprises you, explore it anyway — curiosity is more valuable than certainty at this stage.",
      "Revisit this report after new experiences: internships, projects, or subjects you discover you love.",
    ]
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Parents & Guardians',
    points: [
      "Ask questions, not directives. 'What did you find surprising?' opens more doors than 'You should be a doctor.'",
      "Scores are not fixed. Research consistently shows interests evolve through experience, especially in teens.",
      "Use this as a conversation starter, not a verdict. Your child's engagement matters more than any profile code.",
      "Look for overlap between their interests and real-world opportunities — connect curiosity to concrete next steps.",
    ]
  },
  {
    icon: '📚',
    title: 'Educators',
    points: [
      "Use results to inform subject advice and extra-curricular recommendations, not to stream students early.",
      "High Investigative + Artistic combinations often signal creative problem-solvers who may not fit standard molds.",
      "Conscientiousness scores can inform study skills coaching and project management support.",
      "Share the Methodology page with students who want to understand the science behind their results.",
    ]
  },
  {
    icon: '🌱',
    title: 'Everyone',
    points: [
      "This is a psychometric indicator, not a personality verdict. Treat it with curiosity, not finality.",
      "Interests and personality traits measured here are research-based but not deterministic.",
      "The best career paths combine self-knowledge with real-world exploration — start conversations, not conclusions.",
      "Growth mindset applies here: what you're interested in today can expand significantly with exposure.",
    ]
  },
]

export default function ReadFirst() {
  return (
    <section id="read-first" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 border-gold pl-6 mb-8">
        <h2 className="font-display text-3xl text-navy">Read First</h2>
      </div>

      <div className="mb-8">
        <h3 className="font-display text-xl text-navy mb-4">What is the Compass Career Indicator?</h3>
        <div className="space-y-4 text-navy/80 font-body leading-relaxed">
          <p>The Compass Career Indicator is a psychometric assessment designed for secondary school students aged 13–19. It combines two of the most rigorously researched frameworks in career psychology: the RIASEC interest model and the Big Five personality model, enhanced with AI-generated personalised analysis.</p>
          <p>The RIASEC model was developed by Dr. John L. Holland in 1959 and has since become the foundation of career counselling globally. It describes six broad interest themes — Realistic, Investigative, Artistic, Social, Enterprising, and Conventional — and proposes that people who find careers matching their interest profile tend to experience greater satisfaction, performance, and longevity in those roles.</p>
          <p>The Big Five personality model (also called OCEAN) was developed by Robert McCrae and Paul Costa in 1987 and is today the most widely validated personality framework in psychology. It measures Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (here called Stress Sensitivity for clarity). These traits offer insight into how students tend to approach work, learning, collaboration, and challenge.</p>
          <p>This report also uses Claude, an AI model developed by Anthropic, to generate personalised narrative analysis of your results. AI-generated content is clearly labelled throughout. All AI output is hedged with language like "may", "might", and "could" — because our results describe tendencies, not certainties. The goal of this report is to open doors, not close them.</p>
        </div>
      </div>

      <h3 className="font-display text-xl text-navy mb-6">How to read this report together</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {audiences.map(a => (
          <Card key={a.title} variant="highlighted" className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{a.icon}</span>
              <h4 className="font-display text-lg text-navy">{a.title}</h4>
            </div>
            <ul className="space-y-2">
              {a.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy/80 font-body">
                  <span className="text-gold mt-1 shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  )
}
