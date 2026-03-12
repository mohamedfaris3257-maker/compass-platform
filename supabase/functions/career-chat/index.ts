// ============================================================
// Compass Career Platform — Edge Function: career-chat
// Chat about a specific career using Groq API
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  assessment_id?:       string
  career_title:         string
  message:              string           // the new user message
  conversation_history?: ChatMessage[]   // prior turns
  career_description?:  string
  student_profile: {
    riasec_top3:  string
    hobbies?:     string
    curriculum?:  string
    age?:         number
  }
}

serve(async (req: Request) => {
  // ── CORS preflight ───────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: ChatRequest = await req.json()
    console.log('[career-chat] Received body:', JSON.stringify({
      assessment_id:  body.assessment_id,
      career_title:   body.career_title,
      message:        body.message,
      history_length: (body.conversation_history ?? []).length,
    }))

    const {
      career_title,
      message,
      conversation_history = [],
      career_description,
      student_profile,
    } = body

    // ── Validate required fields ─────────────────────────────────────────
    if (!career_title) {
      return new Response(JSON.stringify({ error: 'career_title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!message) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) {
      console.error('[career-chat] GROQ_API_KEY not set')
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Build system prompt ──────────────────────────────────────────────
    const systemPrompt = `You are a knowledgeable and encouraging career guide helping a secondary school student explore the career of "${career_title}".

Student context:
- RIASEC top code: ${student_profile?.riasec_top3 ?? 'Not specified'}
- Hobbies/interests: ${student_profile?.hobbies ?? 'Not specified'}
- Curriculum: ${student_profile?.curriculum ?? 'Not specified'}
- Age: ${student_profile?.age ? `${student_profile.age} years old` : 'Secondary school student'}
${career_description ? `\nCareer description: ${career_description}` : ''}

Guidelines:
- Keep responses concise — 3–5 sentences maximum
- Use warm, encouraging language appropriate for teenagers
- Always use hedged language (may, might, could, often) — never make absolute promises
- Connect answers to the student's specific profile when possible
- If asked about salary, give ranges and note they vary significantly
- If asked about job prospects, give balanced, honest assessments
- Never recommend specific universities by name (the platform has a separate UniFinder for that)
- Suggest practical next steps (clubs, courses, volunteering, shadowing) where relevant
- If you don't know something, say so honestly`

    // ── Build Groq messages array ────────────────────────────────────────
    // conversation_history (prior turns) + the new user message
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    console.log('[career-chat] Sending', groqMessages.length, 'messages to Groq')

    // ── Call Groq API ────────────────────────────────────────────────────
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:      GROQ_MODEL,
        max_tokens: 512,
        messages:   groqMessages,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('[career-chat] Groq error:', groqRes.status, errText)
      return new Response(JSON.stringify({ error: `Groq error ${groqRes.status}: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const groqData = await groqRes.json()
    const reply: string = groqData.choices?.[0]?.message?.content ?? ''

    console.log('[career-chat] Success — reply length:', reply.length)

    // ── Return JSON { reply } ────────────────────────────────────────────
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('[career-chat] Unhandled error:', err.message ?? err)
    return new Response(JSON.stringify({ error: err.message ?? 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
