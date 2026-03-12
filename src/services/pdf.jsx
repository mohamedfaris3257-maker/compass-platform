// ============================================================
// Compass Career Platform — PDF Service
// Uses @react-pdf/renderer to generate a print-quality PDF
// ============================================================

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer'

// ─── Brand colours ────────────────────────────────────────────
const GOLD   = '#EDC163'
const NAVY   = '#1D334F'
const CREAM  = '#FAF7F0'
const MUTED  = '#6B7280'
const GREEN  = '#22C55E'
const AMBER  = '#F59E0B'
const LIGHT  = '#F3F4F6'

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: CREAM,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 48,
    fontSize: 10,
    color: NAVY,
    lineHeight: 1.5,
  },

  // Cover
  coverPage: {
    fontFamily: 'Helvetica',
    backgroundColor: NAVY,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  coverTop: {
    backgroundColor: NAVY,
    padding: 48,
    flex: 1,
  },
  coverLogo: {
    fontSize: 14,
    color: GOLD,
    letterSpacing: 2,
    marginBottom: 48,
  },
  coverTitle: {
    fontSize: 32,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 48,
  },
  coverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 48,
  },
  coverField: {
    width: '45%',
  },
  coverLabel: {
    fontSize: 9,
    color: GOLD,
    letterSpacing: 1,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  coverValue: {
    fontSize: 12,
    color: '#F9FAFB',
    fontFamily: 'Helvetica-Bold',
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(237,193,99,0.3)',
    paddingTop: 16,
    paddingHorizontal: 48,
    paddingBottom: 24,
  },
  coverFooterText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
  },

  // Section headings
  sectionHeader: {
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    paddingLeft: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
  },

  // Text
  body: {
    fontSize: 10,
    color: NAVY,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  muted: {
    fontSize: 9,
    color: MUTED,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 6,
  },

  // RIASEC scores row
  scoresRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  scoreBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: 60,
  },
  scoreLabel: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  scoreBar: {
    marginTop: 4,
    height: 4,
    backgroundColor: GOLD,
    borderRadius: 2,
  },

  // Career match card
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 14,
  },
  matchGaugeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  matchPct: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  matchContent: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 3,
  },
  matchRationale: {
    fontSize: 9,
    color: NAVY,
    lineHeight: 1.5,
  },

  // Personality bar
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  traitLabel: {
    fontSize: 9,
    color: NAVY,
    width: 110,
  },
  traitBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  traitBarFill: {
    height: 8,
    borderRadius: 4,
  },
  traitScore: {
    fontSize: 9,
    color: MUTED,
    width: 24,
    textAlign: 'right',
  },

  // Two-column grid
  twoCol: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  col: {
    flex: 1,
  },

  // Tag / chip
  chip: {
    backgroundColor: `${GOLD}25`,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 8,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginVertical: 12,
  },

  // Footer (page number)
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageFooterText: {
    fontSize: 8,
    color: MUTED,
  },

  // Disclaimer box
  disclaimer: {
    backgroundColor: LIGHT,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  disclaimerText: {
    fontSize: 8,
    color: MUTED,
    lineHeight: 1.5,
  },
})

// ─── Helper components ────────────────────────────────────────

function PageFooter({ studentName }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.pageFooterText}>Compass Career Indicator v2.0 • {studentName}</Text>
      <Text style={s.pageFooterText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {subtitle && <Text style={s.sectionSubtitle}>{subtitle}</Text>}
    </View>
  )
}

function RiasecBar({ label, score, maxScore = 7 }) {
  const pct = Math.min(1, score / maxScore)
  return (
    <View style={s.traitRow}>
      <Text style={s.traitLabel}>{label}</Text>
      <View style={s.traitBarBg}>
        <View style={[s.traitBarFill, { width: `${pct * 100}%`, backgroundColor: GOLD }]} />
      </View>
      <Text style={s.traitScore}>{Number(score).toFixed(1)}</Text>
    </View>
  )
}

function OceanBar({ label, score, maxScore = 5 }) {
  const pct = Math.min(1, score / maxScore)
  const color = pct > 0.66 ? GREEN : pct > 0.4 ? AMBER : '#60A5FA'
  return (
    <View style={s.traitRow}>
      <Text style={s.traitLabel}>{label}</Text>
      <View style={s.traitBarBg}>
        <View style={[s.traitBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={s.traitScore}>{Number(score).toFixed(1)}</Text>
    </View>
  )
}

function MatchGauge({ pct }) {
  const color = pct >= 75 ? GREEN : pct >= 55 ? AMBER : MUTED
  return (
    <View style={[s.matchGaugeCircle, { borderColor: color }]}>
      <Text style={[s.matchPct, { color }]}>{pct}%</Text>
    </View>
  )
}

// ─── Main PDF Document ────────────────────────────────────────

export function CompassPDF({ student, assessment, report, careerMatches }) {
  const topBlended = [...(careerMatches ?? [])]
    .sort((a, b) => b.blended_pct - a.blended_pct)
    .slice(0, 10)

  const riasecThemes = [
    { key: 'R', label: 'Realistic', score: assessment?.riasec_r ?? 0 },
    { key: 'I', label: 'Investigative', score: assessment?.riasec_i ?? 0 },
    { key: 'A', label: 'Artistic', score: assessment?.riasec_a ?? 0 },
    { key: 'S', label: 'Social', score: assessment?.riasec_s ?? 0 },
    { key: 'E', label: 'Enterprising', score: assessment?.riasec_e ?? 0 },
    { key: 'C', label: 'Conventional', score: assessment?.riasec_c ?? 0 },
  ]

  const oceanTraits = [
    { label: 'Openness to Experience', score: assessment?.ocean_o ?? 3 },
    { label: 'Conscientiousness', score: assessment?.ocean_c ?? 3 },
    { label: 'Extraversion', score: assessment?.ocean_e ?? 3 },
    { label: 'Agreeableness', score: assessment?.ocean_a ?? 3 },
    { label: 'Stress Sensitivity', score: assessment?.ocean_n ?? 3 },
  ]

  const name = student?.full_name ?? 'Student'
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const top3 = assessment?.riasec_top3 ?? '---'

  return (
    <Document title={`Compass Report — ${name}`} author="Compass Career Platform" creator="Proplr">

      {/* ── COVER PAGE ── */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverTop}>
          <Text style={s.coverLogo}>🧭  COMPASS</Text>
          <Text style={s.coverTitle}>Career Intelligence{'\n'}Report</Text>
          <Text style={s.coverSubtitle}>{name}</Text>

          <View style={s.coverGrid}>
            <View style={s.coverField}>
              <Text style={s.coverLabel}>Holland Code</Text>
              <Text style={s.coverValue}>{top3}</Text>
            </View>
            <View style={s.coverField}>
              <Text style={s.coverLabel}>School Year</Text>
              <Text style={s.coverValue}>{student?.year_group ?? '—'}</Text>
            </View>
            <View style={s.coverField}>
              <Text style={s.coverLabel}>Curriculum</Text>
              <Text style={s.coverValue}>{student?.curriculum ?? '—'}</Text>
            </View>
            <View style={s.coverField}>
              <Text style={s.coverLabel}>Report Date</Text>
              <Text style={s.coverValue}>{dateStr}</Text>
            </View>
            <View style={s.coverField}>
              <Text style={s.coverLabel}>Country</Text>
              <Text style={s.coverValue}>{student?.country ?? '—'}</Text>
            </View>
            <View style={s.coverField}>
              <Text style={s.coverLabel}>Careers Analysed</Text>
              <Text style={s.coverValue}>100+</Text>
            </View>
          </View>
        </View>

        <View style={s.coverFooter}>
          <Text style={s.coverFooterText}>
            Compass Career Indicator v2.0  •  Powered by Claude (Anthropic)  •  Career data from O*NET v28.0  •  Proplr 2024
          </Text>
          <Text style={[s.coverFooterText, { marginTop: 4 }]}>
            For exploratory use only — not a licensed psychological assessment. See Important Notes section.
          </Text>
        </View>
      </Page>

      {/* ── EXECUTIVE SNAPSHOT ── */}
      <Page size="A4" style={s.page}>
        <SectionHeader title="Executive Snapshot" subtitle="Your career profile at a glance" />

        {/* RIASEC code badges */}
        <View style={s.scoresRow}>
          {riasecThemes.map(({ key, label, score }) => (
            <View key={key} style={s.scoreBox}>
              <Text style={s.scoreLabel}>{key}</Text>
              <Text style={s.scoreValue}>{Number(score).toFixed(1)}</Text>
              <View style={[s.scoreBar, { width: `${(score / 7) * 100}%`, maxWidth: 36 }]} />
              <Text style={[s.scoreLabel, { marginTop: 3 }]}>{label.slice(0, 3)}</Text>
            </View>
          ))}
        </View>

        {/* AI Snapshot */}
        {report?.ai_snapshot && (
          <View style={s.card}>
            <Text style={[s.body, { fontFamily: 'Helvetica-Bold', marginBottom: 6, color: MUTED, fontSize: 9, letterSpacing: 1 }]}>AI PROFILE SUMMARY</Text>
            <Text style={s.body}>{report.ai_snapshot}</Text>
          </View>
        )}

        <View style={s.divider} />

        {/* RIASEC profile bars */}
        <SectionHeader title="RIASEC Profile" subtitle="Your six interest theme scores (0–7 scale)" />
        {riasecThemes.sort((a, b) => b.score - a.score).map(t => (
          <RiasecBar key={t.key} label={`${t.key} — ${t.label}`} score={t.score} />
        ))}

        {report?.ai_strengths && (
          <View style={[s.card, { marginTop: 12, backgroundColor: `${GOLD}15` }]}>
            <Text style={[s.bold, { fontSize: 10, marginBottom: 4, color: NAVY }]}>Your Dominant Themes</Text>
            <Text style={s.body}>{report.ai_strengths}</Text>
          </View>
        )}

        <PageFooter studentName={name} />
      </Page>

      {/* ── PERSONALITY SIGNALS ── */}
      <Page size="A4" style={s.page}>
        <SectionHeader title="Personality Signals" subtitle="Big Five / OCEAN trait scores (1–5 scale)" />

        {oceanTraits.map(t => (
          <OceanBar key={t.label} label={t.label} score={t.score} />
        ))}

        <View style={[s.card, { marginTop: 16, backgroundColor: '#F0FDF4' }]}>
          <Text style={[s.bold, { fontSize: 9, color: MUTED, letterSpacing: 1, marginBottom: 6 }]}>HOW TO READ THIS</Text>
          <Text style={s.body}>
            Scores above 3.5 indicate a tendency toward that trait. Scores below 2.5 indicate the opposite end of the spectrum. Scores around 3.0 are neutral — neither strongly present nor absent. Personality profiles are not fixed — they can shift with experience and are more variable in adolescence than in adulthood.
          </Text>
        </View>

        <PageFooter studentName={name} />
      </Page>

      {/* ── TOP CAREER MATCHES ── */}
      <Page size="A4" style={s.page}>
        <SectionHeader
          title="Top Career Matches"
          subtitle={`Blended match score (Holland 40% + Personality 35% + Hobbies 25%) — Top ${Math.min(topBlended.length, 10)}`}
        />

        {topBlended.slice(0, 10).map((match, i) => {
          const c = match.careers ?? match
          const rationale = report?.ai_career_rationale?.[match.career_id ?? match.id] ?? ''
          const pct = match.blended_pct ?? 0

          return (
            <View key={i} style={s.matchCard}>
              <MatchGauge pct={pct} />
              <View style={s.matchContent}>
                <Text style={s.matchTitle}>{c.title}</Text>
                <Text style={[s.muted, { marginBottom: 4 }]}>
                  SOC {c.soc_code}  •  Salary: ${c.salary_usd_low}k–${c.salary_usd_high}k  •  Zone {c.job_zone}
                </Text>
                {rationale ? (
                  <Text style={s.matchRationale}>{rationale}</Text>
                ) : (
                  <Text style={s.matchRationale}>{c.description}</Text>
                )}
                {c.details?.skills?.length > 0 && (
                  <View style={s.chipsRow}>
                    {c.details.skills.slice(0, 4).map((skill, si) => (
                      <View key={si} style={s.chip}>
                        <Text style={s.chipText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )
        })}

        <PageFooter studentName={name} />
      </Page>

      {/* ── NEXT STEPS + DISCLAIMER ── */}
      <Page size="A4" style={s.page}>
        <SectionHeader title="Your Next Steps" />

        <View style={s.twoCol}>
          <View style={s.col}>
            <View style={s.card}>
              <Text style={[s.bold, { fontSize: 11, marginBottom: 8 }]}>🏫 At School</Text>
              {[
                'Ask your school counsellor for career exploration resources in your top cluster.',
                'Join one club or activity that aligns with your top RIASEC theme this term.',
                'Choose an elective that connects to a career you\'re curious about.',
              ].map((step, i) => (
                <Text key={i} style={[s.body, { marginBottom: 4 }]}>• {step}</Text>
              ))}
            </View>
          </View>
          <View style={s.col}>
            <View style={s.card}>
              <Text style={[s.bold, { fontSize: 11, marginBottom: 8 }]}>🌍 In Your Community</Text>
              {[
                'Reach out on LinkedIn to one professional in a career you\'re curious about.',
                'Attend a career fair, university open day, or industry event.',
                'Volunteer or shadow someone in a field related to your top cluster.',
              ].map((step, i) => (
                <Text key={i} style={[s.body, { marginBottom: 4 }]}>• {step}</Text>
              ))}
            </View>
          </View>
        </View>

        <View style={s.divider} />
        <SectionHeader title="Important Notes" />

        <View style={s.twoCol}>
          <View style={s.col}>
            <View style={[s.card, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
              <Text style={[s.bold, { fontSize: 10, marginBottom: 6 }]}>This assessment does NOT...</Text>
              {[
                'Measure intelligence or academic ability.',
                'Make career decisions for you.',
                'Predict your future or limit your options.',
              ].map((p, i) => (
                <Text key={i} style={[s.body, { marginBottom: 3 }]}>✕  {p}</Text>
              ))}
            </View>
          </View>
          <View style={s.col}>
            <View style={[s.card, { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' }]}>
              <Text style={[s.bold, { fontSize: 10, marginBottom: 6 }]}>This assessment DOES...</Text>
              {[
                'Provide a research-backed starting point.',
                'Use validated psychometric frameworks.',
                'Generate personalised AI insights.',
              ].map((p, i) => (
                <Text key={i} style={[s.body, { marginBottom: 3 }]}>✓  {p}</Text>
              ))}
            </View>
          </View>
        </View>

        <View style={s.disclaimer}>
          <Text style={[s.bold, { fontSize: 9, marginBottom: 4 }]}>Disclaimer</Text>
          <Text style={s.disclaimerText}>
            The Compass Career Indicator is provided for exploratory and educational purposes only. Results are based on self-reported responses and standardised scoring algorithms. Scores should not be used as the sole basis for major educational or career decisions. Compass is not a licensed psychological assessment tool and does not replace professional career counselling. AI-generated content uses hedged language (may/might/could) to reflect the probabilistic nature of career guidance. All data is handled in accordance with applicable privacy regulations.
          </Text>
          <Text style={[s.disclaimerText, { marginTop: 6 }]}>
            Compass Career Indicator v2.0  •  Powered by Claude (Anthropic)  •  Career data from O*NET v28.0  •  Proplr 2024
          </Text>
        </View>

        <PageFooter studentName={name} />
      </Page>

    </Document>
  )
}

// ─── Download helper ──────────────────────────────────────────

/**
 * Generate and trigger browser download of the PDF.
 * @param {object} props - { student, assessment, report, careerMatches }
 */
export async function downloadCompassPDF(props) {
  const { student } = props
  const filename = `Compass_Report_${(student?.full_name ?? 'Student').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`

  const blob = await pdf(<CompassPDF {...props} />).toBlob()
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
