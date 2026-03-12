// ============================================================
// Compass Career Platform — Edge Function: generate-report
// Uses Groq API (llama-3.3-70b-versatile) — 5 batch calls
// Computes 3 RIASEC scoring tracks in-function before AI calls
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM = `You are a specialist career guidance writer for secondary school students aged 14–18.
Your writing is warm, encouraging, and analytically precise. You use hedged language (may, might, could,
often suggests) to reflect the exploratory nature of career guidance at this age. You never use
jargon without explaining it. You never promise outcomes. You write in clear, flowing prose unless
structured output is explicitly requested. Keep responses concise and practical.`

// ─── Groq call — 2 retries, 65 s back-off on 429 to reset RPM window ──
async function callGroq(userPrompt: string, maxTokens = 4000): Promise<string> {
  const apiKey = Deno.env.get('GROQ_API_KEY')
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      const delay = 65_000 // 65 s — guarantees the 1-minute RPM window resets
      console.log(`[generate-report] 429 retry ${attempt}/2 — waiting ${delay / 1000}s for RPM reset...`)
      await new Promise(r => setTimeout(r, delay))
    }

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:      GROQ_MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user',   content: userPrompt },
        ],
      }),
    })

    if (res.status === 429) {
      console.warn(`[generate-report] 429 on attempt ${attempt + 1}/3`)
      continue
    }
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error ${res.status}: ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content ?? ''
  }

  throw new Error('Groq API: rate limited after 3 retries (195 s total wait)')
}

// ─── Strip markdown fences and extract the first JSON object ─
function extractJSON(raw: string): any {
  const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`No JSON object found in response: ${raw.slice(0, 300)}`)
  return JSON.parse(match[0])
}

// ─── Track 1: Pure RIASEC overlap similarity 0–100 ───────────
// Score = (Σ min(student[d], career[d])) / Σ student[d] × 100
function riasecScore(student: any, career: any): number {
  const dims = ['riasec_r', 'riasec_i', 'riasec_a', 'riasec_s', 'riasec_e', 'riasec_c']
  const studentTotal = dims.reduce((sum, d) => sum + (student[d] ?? 0), 0)
  if (studentTotal === 0) return 50
  const overlap = dims.reduce((sum, d) => sum + Math.min(student[d] ?? 0, career[d] ?? 0), 0)
  return Math.round((overlap / studentTotal) * 100)
}

// ─── Track 2: Personality score via OCEAN → synthetic RIASEC ─
function personalityScore(assessment: any, career: any): number {
  const o = assessment.ocean_o ?? 3
  const e = assessment.ocean_e ?? 3
  const a = assessment.ocean_a ?? 3
  const c = assessment.ocean_c ?? 3
  const synth = {
    riasec_r: 3.5,
    riasec_i: o * 1.2,
    riasec_a: o * 0.8,
    riasec_s: (e + a) * 0.7,
    riasec_e: e * 0.8,
    riasec_c: c * 1.0,
  }
  return riasecScore(synth, career)
}

// ─── SOC prefix → aligned values map ─────────────────────────
const SOC_VALUES: Record<string, string[]> = {
  '11': ['Leadership & influence', 'Financial success', 'Entrepreneurship'],
  '13': ['Financial success', 'Stability & security'],
  '15': ['Innovation & creativity', 'Advancing knowledge', 'Entrepreneurship'],
  '17': ['Building/creating things', 'Innovation & creativity'],
  '19': ['Advancing knowledge', 'Innovation & creativity', 'Environmental sustainability'],
  '21': ['Making a social impact', 'Helping people directly'],
  '23': ['Stability & security', 'Leadership & influence'],
  '25': ['Making a social impact', 'Helping people directly', 'Advancing knowledge'],
  '27': ['Innovation & creativity', 'Building/creating things'],
  '29': ['Helping people directly', 'Making a social impact', 'Stability & security'],
}

function valueMatchScore(studentValues: string[], socCode: string): number {
  if (!studentValues?.length || !socCode) return 50
  const prefix = socCode.split('-')[0]
  const careerValues = SOC_VALUES[prefix] ?? []
  if (!careerValues.length) return 50
  const matches = studentValues.filter(v => careerValues.includes(v)).length
  return Math.round((matches / Math.max(studentValues.length, careerValues.length)) * 100)
}

// ─── Track 3: Blended score (50% RIASEC + 30% personality + 20% values) ─
function blendedScore(assessment: any, career: any, studentValues: string[]): number {
  const r = riasecScore(assessment, career)
  const p = personalityScore(assessment, career)
  const v = valueMatchScore(studentValues, career.soc_code)
  return Math.round(r * 0.5 + p * 0.3 + v * 0.2)
}

// ─── Age helper ───────────────────────────────────────────────
function calculateAge(dob: string): number {
  const birth = new Date(dob)
  const now   = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

// ─── JSON response helper ─────────────────────────────────────
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ─── SOC group names ──────────────────────────────────────────
const SOC_NAMES: Record<string, string> = {
  '11': 'Management', '13': 'Business & Financial Operations', '15': 'Computer & Mathematical',
  '17': 'Architecture & Engineering', '19': 'Life, Physical & Social Science', '21': 'Community & Social Service',
  '23': 'Legal', '25': 'Education, Training & Library', '27': 'Arts, Design, Entertainment & Media',
  '29': 'Healthcare Practitioners', '33': 'Protective Service', '35': 'Food Preparation & Serving',
  '41': 'Sales & Related', '43': 'Office & Administrative Support', '45': 'Farming, Fishing & Forestry',
  '47': 'Construction & Extraction', '49': 'Installation, Maintenance & Repair', '51': 'Production',
  '53': 'Transportation & Material Moving',
}

// ─── Main handler ─────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let assessment_id: string | null = null

  try {
    const body = await req.json()
    assessment_id = body.assessment_id ?? body.assessmentId ?? null

    if (!assessment_id) {
      console.error('[generate-report] Missing assessment_id:', JSON.stringify(body))
      return json({ error: 'assessment_id required' }, 400)
    }

    console.log(`[generate-report] START — assessment_id=${assessment_id}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Fetch assessment + student ────────────────────────────
    const { data: assessment, error: aErr } = await supabase
      .from('assessments')
      .select('*, students(*)')
      .eq('id', assessment_id)
      .single()

    if (aErr || !assessment) throw new Error(`Assessment not found: ${aErr?.message}`)
    const student = assessment.students
    console.log(`[generate-report] Student: "${student.full_name}" | RIASEC top: ${assessment.riasec_top3}`)

    // ── Upsert report row as generating ──────────────────────
    await supabase
      .from('reports')
      .upsert({
        assessment_id,
        student_id:  assessment.student_id,
        status:      'generating',
        created_at:  new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      }, { onConflict: 'assessment_id' })
    console.log('[generate-report] Upserted report row as generating')

    // ── Step 1: 3-track scoring → populate career_matches ────
    console.log('[generate-report] Fetching careers for 3-track matching...')
    const { data: allCareers, error: careersErr } = await supabase
      .from('careers')
      .select('id, soc_code, title, description, source, details, riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c, salary_usd_low, salary_usd_high, job_zone')
      .limit(200)

    if (careersErr) throw new Error(`Careers fetch failed: ${careersErr.message}`)
    console.log(`[generate-report] Scoring ${allCareers?.length ?? 0} careers across 3 tracks...`)

    const studentValues: string[] = Array.isArray(assessment.values_alignment) ? assessment.values_alignment : []

    // Independently sorted top15 per track
    const hollandTop15 = (allCareers ?? [])
      .map((c: any) => ({ ...c, score: riasecScore(assessment, c) }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 15)

    const personalityTop15 = (allCareers ?? [])
      .map((c: any) => ({ ...c, score: personalityScore(assessment, c) }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 15)

    const blendedTop15 = (allCareers ?? [])
      .map((c: any) => ({ ...c, score: blendedScore(assessment, c, studentValues) }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 15)

    console.log(`[generate-report] Blended top match: "${blendedTop15[0]?.title}" (${blendedTop15[0]?.score}%)`)
    console.log(`[generate-report] Holland top match: "${hollandTop15[0]?.title}" (${hollandTop15[0]?.score}%)`)
    console.log(`[generate-report] Personality top match: "${personalityTop15[0]?.title}" (${personalityTop15[0]?.score}%)`)

    // ── Delete stale matches ──────────────────────────────────
    const { error: delError } = await supabase
      .from('career_matches')
      .delete()
      .eq('assessment_id', assessment_id)
    if (delError) console.warn('[generate-report] career_matches delete warn:', delError.message)

    // Resolve career UUIDs for all 3 tracks combined
    const allSocCodes = [...new Set([
      ...hollandTop15.map((c: any) => c.soc_code),
      ...personalityTop15.map((c: any) => c.soc_code),
      ...blendedTop15.map((c: any) => c.soc_code),
    ])]

    const { data: careerRows } = await supabase
      .from('careers')
      .select('id, soc_code')
      .in('soc_code', allSocCodes)
    const socToId: Record<string, string> = Object.fromEntries(
      (careerRows ?? []).map((r: any) => [r.soc_code, r.id])
    )
    console.log(`[generate-report] Resolved ${Object.keys(socToId).length}/${allSocCodes.length} career UUIDs`)

    // Build rows per track — each with its own score and rank
    const hollandRows = hollandTop15
      .map((c: any, i: number) => ({ assessment_id, career_id: socToId[c.soc_code], match_type: 'holland',     match_score: c.score, blended_pct: c.score, rank: i + 1 }))
      .filter((r: any) => r.career_id)

    const personalityRows = personalityTop15
      .map((c: any, i: number) => ({ assessment_id, career_id: socToId[c.soc_code], match_type: 'personality', match_score: c.score, blended_pct: c.score, rank: i + 1 }))
      .filter((r: any) => r.career_id)

    const blendedRows = blendedTop15
      .map((c: any, i: number) => ({ assessment_id, career_id: socToId[c.soc_code], match_type: 'blended',     match_score: c.score, blended_pct: c.score, rank: i + 1 }))
      .filter((r: any) => r.career_id)

    const matchRows = [...hollandRows, ...personalityRows, ...blendedRows]

    console.log('[generate-report] Inserting career_matches — row count:', matchRows.length)
    const { error: upsertErr } = await supabase
      .from('career_matches')
      .upsert(matchRows, { onConflict: 'assessment_id,career_id,match_type', ignoreDuplicates: false })
    if (upsertErr) console.warn('[generate-report] career_matches upsert warn:', upsertErr.message)

    // Verify rows landed
    const { data: verify } = await supabase
      .from('career_matches')
      .select('id')
      .eq('assessment_id', assessment_id)
    console.log('[generate-report] Verified career_matches count:', verify?.length ?? 0)

    // Use blendedTop15 for Groq calls (most holistic ranking)
    const topCareerNames = blendedTop15.map((c: any) => c.title)
    const modernMatches  = blendedTop15.filter((c: any) => c.source === 'modern').map((c: any) => c.title).slice(0, 3)

    // ── CALL 1/4: Main narrative ──────────────────────────────
    console.log('[generate-report] [1/4] Main narrative...')

    const careerListForCall1 = blendedTop15.map((c: any, i: number) =>
      `${i + 1}. ${c.title} (SOC ${c.soc_code}) [${c.score}% blended match] — ${(c.description ?? 'Specialist role').slice(0, 100)}`
    ).join('\n')

    const rationaleKeys = blendedTop15.map((c: any) =>
      `    "${c.soc_code}": "2-sentence rationale"`
    ).join(',\n')

    const hobbiesText = Array.isArray(assessment.hobbies_tags) && assessment.hobbies_tags.length
      ? assessment.hobbies_tags.join(', ')
      : (assessment.hobbies ?? 'Not provided')

    const call1Raw = await callGroq(
`STUDENT PROFILE:
Name: ${student.full_name} | Age: ${calculateAge(student.date_of_birth)} | Curriculum: ${student.curriculum} | Country: ${student.country ?? 'Not specified'}
RIASEC (0–7): R=${assessment.riasec_r} I=${assessment.riasec_i} A=${assessment.riasec_a} S=${assessment.riasec_s} E=${assessment.riasec_e} C=${assessment.riasec_c} | Top code: ${assessment.riasec_top3}
Big Five (1–5): O=${assessment.ocean_o} C=${assessment.ocean_c} E=${assessment.ocean_e} A=${assessment.ocean_a} N=${assessment.ocean_n}
Hobbies: ${hobbiesText} | Work preference: ${assessment.work_pref ?? 'Not provided'} | Subjects liked: ${assessment.subjects_liked ?? 'Not provided'}
Values: ${studentValues.join(', ') || 'Not provided'} | Work preferences: ${Array.isArray(assessment.work_preferences) ? assessment.work_preferences.join(', ') : 'Not provided'}

TOP 15 CAREER MATCHES (blended scoring):
${careerListForCall1}
${modernMatches.length ? `\nEMERGING CAREER MATCHES: ${modernMatches.join(', ')}` : ''}

Respond with ONLY valid JSON — no markdown fences, no preamble, no trailing text. Use this exact structure:
{
  "snapshot": "3-sentence executive snapshot using 'you'/'your'. Lead with dominant RIASEC theme, weave in personality signals, close with forward-looking potential.",
  "strengths": "Two paragraphs of 3 sentences each. Para 1: what dominant RIASEC theme reveals about working style and environment preferences. Para 2: how secondary theme creates a distinctive combination with a real-world context example. Write to the student directly.",
  "modern_careers": "${modernMatches.length ? 'Two paragraphs. Para 1: why one emerging career suits this profile specifically. Para 2: one practical next step (course, community, project). Write to the student.' : ''}",
  "rationales": {
${rationaleKeys}
  }
}

Each rationale must: reference at least one RIASEC theme and one personality signal, use hedged language (may, might, could), be exactly 2 sentences, and write directly to the student.`,
      4000
    )

    let call1: any = {}
    try {
      call1 = extractJSON(call1Raw)
      console.log('[generate-report] [1/4] Done ✓')
    } catch (e: any) {
      console.warn('[generate-report] [1/4] Parse failed — using fallbacks:', e.message)
    }

    const ai_snapshot       = call1.snapshot      ?? 'Your profile reveals a distinctive combination of interests and personality. Explore the careers in this report to find the directions that resonate most with you.'
    const ai_strengths      = call1.strengths     ?? ''
    const ai_modern_careers = call1.modern_careers ?? ''
    const ai_career_rationale: Record<string, string> = call1.rationales ?? {}

    // ── CALL 2/4: Skills & demand data ───────────────────────
    console.log('[generate-report] [2/4] Skills & demand...')

    const careerListForCall2 = blendedTop15.map((c: any) => {
      const tasks  = c.details?.tasks?.slice(0, 3).join('; ')  ?? 'Various tasks'
      const skills = c.details?.skills?.slice(0, 4).join(', ') ?? 'Various skills'
      return `- ${c.title} (SOC ${c.soc_code}) | Tasks: ${tasks} | Known skills: ${skills}`
    }).join('\n')

    const call2Raw = await callGroq(
`STUDENT CURRICULUM: ${student.curriculum}

CAREERS:
${careerListForCall2}

Respond with ONLY valid JSON. One entry per career, keyed by its exact SOC code. Use this exact structure:
{
  "SOC_CODE": {
    "skills": ["3–4 specific skills to develop now, tied to curriculum where possible"],
    "programs": ["1–2 degree or vocational programs that lead to this career"],
    "subjects_must": ["1–2 school subjects essential for this path"],
    "subjects_recommended": ["1–2 school subjects that strengthen the path"],
    "demand": {
      "UAE_MENA": "High|Moderate|Low|Varies",
      "North_America": "High|Moderate|Low|Varies",
      "Europe": "High|Moderate|Low|Varies",
      "South_Asia": "High|Moderate|Low|Varies",
      "SE_Asia": "High|Moderate|Low|Varies",
      "Africa": "High|Moderate|Low|Varies",
      "Oceania": "High|Moderate|Low|Varies"
    }
  }
}

Base demand on general labour market knowledge as of 2024. All array values must be plain strings, not objects.`,
      4000
    )

    let call2: Record<string, any> = {}
    try {
      call2 = extractJSON(call2Raw)
      console.log('[generate-report] [2/4] Done ✓')
    } catch (e: any) {
      console.warn('[generate-report] [2/4] Parse failed — using fallbacks:', e.message)
    }

    const DEMAND_FALLBACK = {
      UAE_MENA: 'Moderate', North_America: 'Moderate', Europe: 'Moderate',
      South_Asia: 'Moderate', SE_Asia: 'Moderate', Africa: 'Low', Oceania: 'Moderate',
    }

    const ai_skills_programs: Record<string, any> = {}
    const ai_demand: Record<string, any> = {}

    for (const c of blendedTop15) {
      const key    = c.soc_code
      const carData = call2[key] ?? {}
      ai_skills_programs[key] = {
        skills:               Array.isArray(carData.skills)               ? carData.skills               : [],
        programs:             Array.isArray(carData.programs)             ? carData.programs             : [],
        subjects_must:        Array.isArray(carData.subjects_must)        ? carData.subjects_must        : [],
        subjects_recommended: Array.isArray(carData.subjects_recommended) ? carData.subjects_recommended : [],
      }
      ai_demand[key] = (carData.demand && typeof carData.demand === 'object') ? carData.demand : DEMAND_FALLBACK
    }

    // ── CALL 3/4: Cluster analysis ────────────────────────────
    console.log('[generate-report] [3/4] Cluster analysis...')

    const clusterMap: Record<string, string[]> = {}
    for (const c of blendedTop15) {
      if (!c.soc_code) continue
      const prefix = c.soc_code.split('-')[0]
      if (!clusterMap[prefix]) clusterMap[prefix] = []
      clusterMap[prefix].push(c.title)
    }

    const topClusters = Object.entries(clusterMap)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)

    const clusterInputText = topClusters.map(([prefix, careers]) =>
      `Cluster ${prefix} (${SOC_NAMES[prefix] ?? 'Occupational Group'}): ${careers.join(', ')}`
    ).join('\n')

    const clusterKeys = topClusters.map(([prefix]) =>
      `  "${prefix}": { "name": "3–5 word cluster name", "one_line": "one sentence: what do people in this cluster do", "why_appears": "one sentence: why this cluster fits this student (use hedged language)" }`
    ).join(',\n')

    const call3Raw = await callGroq(
`STUDENT:
RIASEC top code: ${assessment.riasec_top3}
Hobbies: ${hobbiesText}
Work preference: ${assessment.work_pref ?? 'Not provided'}

CAREER CLUSTERS FOUND IN THIS STUDENT'S RESULTS:
${clusterInputText}

Respond with ONLY valid JSON. One entry per cluster prefix:
{
${clusterKeys}
}`,
      2000
    )

    let call3: Record<string, any> = {}
    try {
      call3 = extractJSON(call3Raw)
      console.log('[generate-report] [3/4] Done ✓')
    } catch (e: any) {
      console.warn('[generate-report] [3/4] Parse failed — using fallbacks:', e.message)
    }

    const ai_clusters: Record<string, any> = {}
    for (const [prefix] of topClusters) {
      ai_clusters[prefix] = call3[prefix] ?? {
        name:        SOC_NAMES[prefix] ?? `Group ${prefix}`,
        one_line:    'Professionals in this cluster work across a range of related roles.',
        why_appears: 'This cluster may align with your interest profile.',
      }
    }

    // ── CALL 4/4: Try Before You Choose + Gap Analysis ───────
    console.log('[generate-report] [4/4] TBC + Gap Analysis...')

    const top5Blended = blendedTop15.slice(0, 5)
    const top5Names   = top5Blended.map((c: any) => c.title)
    const studentGoals: string[] = Array.isArray(assessment.self_stated_goals) ? assessment.self_stated_goals : []

    const tryBeforeKeys = top5Names.map(title =>
      `    "${title}": { "watch": "specific YouTube/documentary/series", "read": "book, article or blog", "build": "mini project or experiment", "talk_to": "type of professional to shadow or interview", "course": "free or affordable online course" }`
    ).join(',\n')

    const call4Raw = await callGroq(
`STUDENT PROFILE:
Name: ${student.full_name} | RIASEC top code: ${assessment.riasec_top3}
Self-stated career goals: ${studentGoals.join(', ') || 'Not provided'}
Psychometric top 5 career matches (blended score): ${top5Names.join(', ')}

TASK 1 — Try Before You Choose:
For each of the 5 careers below, suggest one specific, actionable activity for each channel. Be concrete (name the actual resource, not just a category).

TASK 2 — Gap Analysis:
Compare the student's self-stated goals with their psychometric top matches. If there is a meaningful difference, set has_gap to true and explain with constructive framing. If they align well, set has_gap to false.

Respond with ONLY valid JSON — no markdown fences, no preamble:
{
  "try_before": {
${tryBeforeKeys}
  },
  "gap_analysis": {
    "has_gap": true,
    "alignment_message": "2-sentence observation using hedged language, writing directly to the student",
    "bridge_steps": ["concrete step 1", "concrete step 2", "concrete step 3"],
    "hybrid_careers": ["career that bridges goals and matches", "another hybrid career"]
  }
}

If has_gap is false, still include alignment_message (positive framing) but bridge_steps and hybrid_careers can be empty arrays.`,
      3000
    )

    let call4: any = {}
    try {
      call4 = extractJSON(call4Raw)
      console.log('[generate-report] [4/4] Done ✓')
    } catch (e: any) {
      console.warn('[generate-report] [4/4] Parse failed — using fallbacks:', e.message)
    }

    const ai_try_before  = call4.try_before   ?? null
    const ai_gap_analysis = call4.gap_analysis ?? null

    // ── CALL 5/5: Day in the Life (top 3 careers) ────────────
    console.log('[generate-report] [5/5] Day in the Life (top 3 careers)...')

    const top3Blended = blendedTop15.slice(0, 3)
    const top3Names   = top3Blended.map((c: any) => c.title)

    const dayInLifeCareerKeys = top3Names.map(title =>
      `    "${title}": {
      "morning":     "3–4 sentences. Start of day — environment, first tasks, mindset of a ${title}.",
      "core_work":   "4–5 sentences. Main work phase — a specific challenge or project, tools, collaboration.",
      "reflection":  "2–3 sentences. End of day — what was accomplished, why it matters, what keeps them going."
    }`
    ).join(',\n')

    const call5Raw = await callGroq(
`STUDENT PROFILE:
RIASEC top code: ${assessment.riasec_top3}
Big Five (1–5): O=${assessment.ocean_o} C=${assessment.ocean_c} E=${assessment.ocean_e} A=${assessment.ocean_a} N=${assessment.ocean_n}
Hobbies: ${hobbiesText}

TOP 3 CAREER MATCHES: ${top3Names.join(', ')}

For each of the 3 careers, write a vivid, first-person "A Day in the Life" narrative. Use sensory detail. Make it specific (name tools, settings, tasks). Subtly tailor each narrative to the student's RIASEC profile.

Respond with ONLY valid JSON — no markdown fences:
{
  "day_in_life": {
${dayInLifeCareerKeys}
  }
}`,
      3000
    )

    let call5: any = {}
    try {
      call5 = extractJSON(call5Raw)
      console.log('[generate-report] [5/5] Done ✓')
    } catch (e: any) {
      console.warn('[generate-report] [5/5] Parse failed — using fallbacks:', e.message)
    }

    const ai_day_in_life = call5.day_in_life ?? null
    const ai_personal_statement = null  // removed from report

    // ── Save complete report ──────────────────────────────────
    console.log('[generate-report] Saving report...')
    const { error: updateErr } = await supabase
      .from('reports')
      .upsert({
        assessment_id,
        student_id:            assessment.student_id,
        status:                'complete',
        ai_snapshot,
        ai_strengths,
        ai_career_rationale,
        ai_skills_programs,
        ai_demand,
        ai_clusters,
        ai_modern_careers,
        ai_try_before,
        ai_gap_analysis,
        ai_day_in_life,
        ai_personal_statement,
        generated_at:          new Date().toISOString(),
        updated_at:            new Date().toISOString(),
      }, { onConflict: 'assessment_id' })

    if (updateErr) throw new Error(`Failed to save report: ${updateErr.message}`)

    console.log(`[generate-report] DONE ✓ — assessment_id=${assessment_id}`)
    return json({ success: true, assessment_id })

  } catch (err: any) {
    console.error(`[generate-report] FATAL — assessment_id=${assessment_id}:`, err.message)

    if (assessment_id) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )
        await supabase
          .from('reports')
          .update({ status: 'failed', error_message: err.message })
          .eq('assessment_id', assessment_id)
        console.log(`[generate-report] Marked as failed for assessment_id=${assessment_id}`)
      } catch (markErr: any) {
        console.error('[generate-report] Could not mark failed:', markErr.message)
      }
    }

    return json({ error: err.message }, 500)
  }
})
