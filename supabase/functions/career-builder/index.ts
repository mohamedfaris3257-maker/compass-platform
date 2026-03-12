// ============================================================
// Compass Career Platform — Edge Function: career-builder
// Generates a personalised career roadmap for a selected career
// Uses Groq API (llama-3.3-70b-versatile) — 2 batch calls
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

async function callGroq(prompt: string, maxTokens = 3000): Promise<string> {
  const apiKey = Deno.env.get('GROQ_API_KEY')
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      console.log(`[career-builder] 429 retry ${attempt}/2 — waiting 65s...`)
      await new Promise(r => setTimeout(r, 65_000))
    }
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: 'You are an expert career counselor for secondary school students. Always respond with valid JSON only — no markdown, no text outside the JSON object.' },
          { role: 'user', content: prompt },
        ],
      }),
    })
    if (res.status === 429) { console.warn(`[career-builder] 429 on attempt ${attempt + 1}`); continue }
    if (!res.ok) { const e = await res.text(); throw new Error(`Groq ${res.status}: ${e}`) }
    const data = await res.json()
    return data.choices[0].message.content ?? ''
  }
  throw new Error('Rate limited after 3 retries')
}

function extractJSON(raw: string): any {
  const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`No JSON found: ${raw.slice(0, 200)}`)
  return JSON.parse(match[0])
}

function calculateAge(dob: string): number {
  const birth = new Date(dob)
  const now   = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { assessment_id, selected_career, target_country, timeline, priority } = await req.json()

    if (!assessment_id || !selected_career) {
      return json({ error: 'assessment_id and selected_career required' }, 400)
    }

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
    console.log(`[career-builder] ${student.full_name} → ${selected_career}`)

    // ── Fetch match scores for selected career ────────────────
    const { data: matchRows } = await supabase
      .from('career_matches')
      .select('match_type, match_score, careers(title)')
      .eq('assessment_id', assessment_id)

    let hollandScore = 50, personalityScore = 50, blendedScore = 65
    if (matchRows) {
      const careerMatches = matchRows.filter((r: any) =>
        r.careers?.title?.toLowerCase() === selected_career.toLowerCase()
      )
      for (const row of careerMatches as any[]) {
        if (row.match_type === 'holland')     hollandScore     = row.match_score
        if (row.match_type === 'personality') personalityScore = row.match_score
        if (row.match_type === 'blended')     blendedScore     = row.match_score
      }
    }

    const hobbiesText  = Array.isArray(assessment.hobbies_tags) && assessment.hobbies_tags.length
      ? assessment.hobbies_tags.join(', ') : (assessment.hobbies ?? 'Not provided')
    const valuesText   = Array.isArray(assessment.values_alignment)  ? assessment.values_alignment.join(', ')  : 'Not provided'
    const workPrefs    = Array.isArray(assessment.work_preferences)   ? assessment.work_preferences.join(', ')  : 'Not provided'
    const goalsText    = Array.isArray(assessment.self_stated_goals)  ? assessment.self_stated_goals.join(', ') : 'Not provided'

    // ── CALL 1/2: Roadmap core ────────────────────────────────
    console.log('[career-builder] [1/2] Roadmap core...')
    const call1Raw = await callGroq(
`STUDENT PROFILE:
Name: ${student.full_name} | Age: ${calculateAge(student.date_of_birth)} | Curriculum: ${student.curriculum} | Grade: ${assessment.grade ?? 'Not specified'}
RIASEC (0–7): R=${assessment.riasec_r} I=${assessment.riasec_i} A=${assessment.riasec_a} S=${assessment.riasec_s} E=${assessment.riasec_e} C=${assessment.riasec_c} | Top code: ${assessment.riasec_top3}
Big Five (1–5): O=${assessment.ocean_o} C=${assessment.ocean_c} E=${assessment.ocean_e} A=${assessment.ocean_a} N=${assessment.ocean_n}
Hobbies: ${hobbiesText} | Values: ${valuesText} | Work preferences: ${workPrefs}
Self-stated goals: ${goalsText}

CHOSEN CAREER: ${selected_career}
MATCH SCORES: RIASEC=${hollandScore}% | Personality=${personalityScore}% | Overall Blended=${blendedScore}%
TARGET COUNTRY: ${target_country} | TIMELINE: ${timeline} | PRIORITY: ${priority}

Return ONLY valid JSON (no markdown, no text outside):
{
  "fit_explanation": "2 sentences why this specific career fits this specific student, referencing their RIASEC code and one personality trait",
  "riasec_match_pct": ${hollandScore},
  "personality_match_pct": ${personalityScore},
  "values_match_pct": <0-100 score: how well student values align with typical ${selected_career} values>,
  "overall_fit_pct": ${blendedScore},
  "must_have_subjects": ["4–5 school subjects essential for this career, matched to ${student.curriculum} curriculum"],
  "recommended_subjects": ["3–4 subjects that strengthen but are not essential"],
  "subject_advice": "1 paragraph of personalised advice about subject choices for this student in ${student.curriculum}",
  "reach_universities": ["3 prestigious universities for ${selected_career} in ${target_country}"],
  "target_universities": ["3 realistic mid-tier universities in ${target_country}"],
  "safety_universities": ["3 strong, accessible universities in ${target_country}"],
  "reach_note": "1 sentence: typical grades/profile needed for reach schools",
  "target_note": "1 sentence: typical grades/profile needed for target schools",
  "safety_note": "1 sentence: what makes safety schools strong choices",
  "timeline_now": ["2–3 specific actions for current grade ${assessment.grade ?? 'secondary school'}"],
  "timeline_senior": ["2–3 specific actions for Year 11–13 / Grade 11–12"],
  "timeline_university": ["2–3 specific focuses during university years"],
  "timeline_firstjob": ["2–3 concrete steps to land first job in ${selected_career}"]
}`, 3000)

    let call1: any = {}
    try { call1 = extractJSON(call1Raw); console.log('[career-builder] [1/2] Done ✓') }
    catch (e: any) { console.warn('[career-builder] [1/2] Parse fail:', e.message) }

    // ── CALL 2/2: Experiences + quick start ──────────────────
    console.log('[career-builder] [2/2] Experiences + quick start...')
    const call2Raw = await callGroq(
`A secondary school student in ${target_country} is pursuing ${selected_career}.
Interests: ${hobbiesText} | Priority: ${priority} | Timeline: ${timeline}
Curriculum: ${student.curriculum}

Generate 6 diverse experience activities and 3 quick-start actions.
Return ONLY valid JSON:
{
  "experiences": [
    { "category": "Internship|Competition|Project|Volunteering|Online Course|Club/Society", "suggestion": "Specific 1–2 sentence activity. Name actual platforms, competitions, or organisations. UAE-relevant where country is UAE.", "difficulty": "Easy|Medium|Ambitious" }
  ],
  "quick_start": [
    "Action 1: something they can do THIS WEEK (sign up, message, download, register)",
    "Action 2: something achievable this MONTH",
    "Action 3: something to complete before next TERM/SEMESTER"
  ]
}
Make all 6 categories different. Use real competition/platform names (Coursera, Khan Academy, Google, MIT, etc).`, 2000)

    let call2: any = {}
    try { call2 = extractJSON(call2Raw); console.log('[career-builder] [2/2] Done ✓') }
    catch (e: any) { console.warn('[career-builder] [2/2] Parse fail:', e.message) }

    const roadmap_data = {
      ...call1,
      experiences: Array.isArray(call2.experiences) ? call2.experiences : [],
      quick_start:  Array.isArray(call2.quick_start) ? call2.quick_start : [],
    }

    // ── Save to career_roadmaps ───────────────────────────────
    const { error: saveErr } = await supabase
      .from('career_roadmaps')
      .upsert({
        assessment_id,
        career_title: selected_career,
        roadmap_data,
        created_at: new Date().toISOString(),
      }, { onConflict: 'assessment_id,career_title' })

    if (saveErr) console.warn('[career-builder] Save warn:', saveErr.message)

    console.log('[career-builder] DONE ✓')
    return json({ success: true, roadmap: roadmap_data })

  } catch (err: any) {
    console.error('[career-builder] FATAL:', err.message)
    return json({ error: err.message }, 500)
  }
})
