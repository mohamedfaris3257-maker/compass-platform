import BigFiveBars from '../charts/BigFiveBars'
import Badge from '../ui/Badge'
import { traitNames } from '../../data/bigfive-questions'

const traitGuidance = {
  O: {
    High: "You may enjoy new ideas and creative briefs — start with a brainstorm and quick sketch.",
    Mid: "Mix one new idea with one proven method each week.",
    Low: "Keep it simple — use clear steps, then add one small twist at the end.",
  },
  C: {
    High: "You plan well — protect time with calendar blocks and a daily checklist.",
    Mid: "Use a weekly goals page and 20-minute focus timers.",
    Low: "Try a 3-step plan for each task: start → midpoint check → finish.",
  },
  E: {
    High: "Choose team roles, presentations, or interviews; set clear speaking turns.",
    Mid: "Alternate solo focus with a short peer review.",
    Low: "Begin solo, then share once with one trusted peer.",
  },
  A: {
    High: "Great for collaboration — set clear boundaries when busy and agree on roles.",
    Mid: "Ask one clarifying question at the start of group work.",
    Low: "Practice assertive 'I' statements; write tasks so responsibilities are clear.",
  },
  N: {
    High: "Break work into tiny steps; use box breathing and short stretch breaks.",
    Mid: "Add a mid-task check-in and a 5-minute reset if stuck.",
    Low: "You may stay calm under pressure — still set buffers before deadlines.",
  },
}

const levelColors = { High: 'green', Mid: 'amber', Low: 'blue' }

export default function PersonalitySignals({ assessment }) {
  const scores = assessment?.ocean_scores || {}
  const levels = assessment?.ocean_levels || {}

  return (
    <section id="personality" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      <div className="border-l-4 border-gold pl-6 mb-8">
        <h2 className="font-display text-3xl text-navy">Personality Signals</h2>
        <p className="text-muted font-body mt-2">How you tend to approach work, learning, and challenge</p>
      </div>

      <p className="text-navy/80 font-body leading-relaxed mb-8">
        The Big Five model — also called OCEAN — is the most scientifically validated personality framework in psychology, developed by Robert McCrae and Paul Costa in 1987. Unlike many personality typologies, the Big Five measures traits on a spectrum rather than placing people in fixed "types." These five dimensions — Openness, Conscientiousness, Extraversion, Agreeableness, and Stress Sensitivity — have been consistently linked to career satisfaction, academic achievement, and team effectiveness across cultures and age groups. Your results describe tendencies, not limits.
      </p>

      <div className="mb-8">
        <h4 className="font-body font-semibold text-navy mb-3 text-sm">Your Personality Profile</h4>
        <BigFiveBars scores={scores} levels={levels} />
      </div>

      <h3 className="font-display text-xl text-navy mb-4">What it could mean for study and projects</h3>
      <div className="space-y-4">
        {['O','C','E','A','N'].map(trait => {
          const level = levels[trait] || 'Mid'
          const guidance = traitGuidance[trait]?.[level] || ''
          return (
            <div key={trait} className="border border-cborder rounded-xl p-4 flex items-start gap-4">
              <div className="shrink-0">
                <p className="font-body font-semibold text-navy text-sm">{traitNames[trait]}</p>
                <Badge color={levelColors[level]} className="mt-1">{level}</Badge>
              </div>
              <p className="text-navy/80 font-body text-sm leading-relaxed">{guidance}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
