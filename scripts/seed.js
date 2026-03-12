#!/usr/bin/env node
// ============================================================
// Compass Career Platform — Database Seed Script
// Usage:  node scripts/seed.js
//         npm run db:seed
//
// Required env vars (set in .env.local or shell):
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
//
// package.json has "type": "module" so ES module imports work.
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ─── Resolve __dirname in ESM ─────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const ROOT       = join(__dirname, '..')

// ─── Load .env.local if present ──────────────────────────────
function loadEnvLocal() {
  const envPath = join(ROOT, '.env.local')
  try {
    const raw = readFileSync(envPath, 'utf-8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (key && !process.env[key]) process.env[key] = val   // don't override real env
    }
  } catch {
    // .env.local not required — real env vars will be used
  }
}

loadEnvLocal()

// ─── Validate required env vars ──────────────────────────────
const SUPABASE_URL      = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
  console.error('\n❌  SUPABASE_URL is not set or is still a placeholder.')
  console.error('    Set it in .env.local:\n')
  console.error('    SUPABASE_URL=https://your-project.supabase.co\n')
  process.exit(1)
}

if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('placeholder')) {
  console.error('\n❌  SUPABASE_SERVICE_ROLE_KEY is not set or is still a placeholder.')
  console.error('    Find it in: Supabase Dashboard → Settings → API → service_role key\n')
  process.exit(1)
}

// ─── Supabase client (service role = bypasses RLS) ───────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ─── Import seed data ─────────────────────────────────────────
const { careersSeed }  = await import('../src/data/careers-seed.js')
const { modernCareers } = await import('../src/data/modern-careers.js')
const { uniData }      = await import('../src/data/uni-data.js')

// ─── Utility: batch upsert ────────────────────────────────────
async function upsertInBatches(table, rows, conflictCols, batchSize = 20) {
  let total = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase
      .from(table)
      .upsert(batch, {
        onConflict: conflictCols,
        ignoreDuplicates: false,
      })
    if (error) throw new Error(`[${table}] batch ${i}–${i + batchSize}: ${error.message}`)
    total += batch.length
    process.stdout.write('.')
  }
  return total
}

// ─── Map a raw career object to DB columns ────────────────────
// Data files use r_score/i_score keys; DB uses riasec_r/riasec_i
function mapCareer(c) {
  return {
    soc_code:        c.soc_code,
    title:           c.title,
    source:          c.source ?? 'onet',
    description:     c.description ?? null,
    // RIASEC columns — handle both naming conventions
    riasec_r:        c.riasec_r  ?? c.r_score ?? 0,
    riasec_i:        c.riasec_i  ?? c.i_score ?? 0,
    riasec_a:        c.riasec_a  ?? c.a_score ?? 0,
    riasec_s:        c.riasec_s  ?? c.s_score ?? 0,
    riasec_e:        c.riasec_e  ?? c.e_score ?? 0,
    riasec_c:        c.riasec_c  ?? c.c_score ?? 0,
    salary_usd_low:  c.salary_usd_low  ?? null,
    salary_usd_high: c.salary_usd_high ?? null,
    job_zone:        c.job_zone ?? 3,
    details:         c.details ?? null,   // JSONB: {tasks, skills, education_req, alt_titles}
    is_active:       true,
  }
}

// ─── Map a raw career object to career_details columns ───────
// career_details stores the expanded JSONB details as flat rows
// for easier querying (tasks, skills, education_req, alt_titles)
function mapCareerDetails(c) {
  return {
    soc_code:       c.soc_code,
    tasks:          c.details?.tasks          ?? [],
    skills:         c.details?.skills         ?? [],
    education_req:  c.details?.education_req  ?? null,
    alt_titles:     c.details?.alt_titles     ?? [],
  }
}

// ─── Map a raw university object to DB columns ────────────────
function mapUniversity(u) {
  return {
    name:                   u.name,
    country:                u.country,
    city:                   u.city ?? null,
    qs_ranking:             u.qs_ranking ?? null,
    tuition_usd_per_year:   u.tuition_usd_per_year ?? null,
    ielts_min:              u.ielts_min ?? null,
    scholarship_available:  u.scholarship_available ?? false,
    programs:               u.programs ?? [],
    subject_areas:          u.subject_areas ?? [],
    application_deadline:   u.application_deadline ?? null,
    website:                u.website ?? null,
    is_active:              true,
  }
}

// ─── Seed: careers ────────────────────────────────────────────
async function seedCareers() {
  const allRaw = [
    ...careersSeed.map(c => ({ ...c, source: c.source ?? 'onet' })),
    ...modernCareers.map(c => ({ ...c, source: c.source ?? 'modern' })),
  ]

  console.log(`\nInserting ${allRaw.length} careers...`)

  const careerRows = allRaw.map(mapCareer)
  const inserted = await upsertInBatches('careers', careerRows, 'soc_code')
  console.log(`\n  ✅  careers: ${inserted} rows upserted`)
  return allRaw
}

// ─── Seed: career_details ─────────────────────────────────────
async function seedCareerDetails(allRaw) {
  console.log(`\nInserting ${allRaw.length} career details...`)

  // Check if the career_details table exists before inserting
  const { error: probeError } = await supabase
    .from('career_details')
    .select('soc_code')
    .limit(1)

  if (probeError?.code === '42P01') {
    // Table doesn't exist — details already stored as JSONB in careers.details
    console.log('  ℹ️   career_details table not found — details stored in careers.details (JSONB). Skipping.')
    return
  }

  const detailRows = allRaw.map(mapCareerDetails)
  const inserted = await upsertInBatches('career_details', detailRows, 'soc_code')
  console.log(`\n  ✅  career_details: ${inserted} rows upserted`)
}

// ─── Seed: universities ───────────────────────────────────────
async function seedUniversities() {
  console.log(`\nInserting ${uniData.length} universities...`)

  const rows = uniData.map(mapUniversity)
  const inserted = await upsertInBatches('universities', rows, 'name,country')
  console.log(`\n  ✅  universities: ${inserted} rows upserted`)
}

// ─── Seed: demo school ────────────────────────────────────────
async function seedDemoSchool() {
  console.log('\nInserting demo school...')

  const { error } = await supabase
    .from('schools')
    .upsert(
      {
        name:        'Compass Demo School',
        country:     'UAE',
        city:        'Dubai',
        curriculum:  'IB',
        admin_email: 'demo@compass.proplr.com',
      },
      { onConflict: 'name', ignoreDuplicates: true }
    )

  if (error) {
    console.warn(`  ⚠️   schools upsert warning: ${error.message}`)
  } else {
    console.log('  ✅  Demo school ready')
  }
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('🧭  Compass Career Platform — Database Seeder')
  console.log(`    Supabase: ${SUPABASE_URL}`)
  console.log(`    Started:  ${new Date().toISOString()}`)

  try {
    const allRaw = await seedCareers()
    await seedCareerDetails(allRaw)
    await seedUniversities()
    await seedDemoSchool()

    console.log('\n✨  Seed complete!')
    console.log('\nNext steps:')
    console.log('  1. Set ANTHROPIC_API_KEY secret on Supabase Edge Functions')
    console.log('     supabase secrets set ANTHROPIC_API_KEY=sk-ant-...')
    console.log('  2. Deploy Edge Functions:')
    console.log('     supabase functions deploy generate-report')
    console.log('     supabase functions deploy career-chat')
    console.log('  3. Start the dev server:')
    console.log('     npm run dev')
  } catch (err) {
    console.error('\n❌  Seed failed:', err.message)
    if (err.message.includes('JWT')) {
      console.error('\n    Hint: Make sure you are using the SERVICE ROLE key, not the anon key.')
    }
    if (err.message.includes('does not exist')) {
      console.error('\n    Hint: Run the migration files first in Supabase SQL Editor:')
      console.error('    supabase/migrations/001_core.sql')
      console.error('    supabase/migrations/002_indexes.sql')
      console.error('    supabase/migrations/003_rls.sql')
    }
    process.exit(1)
  }
}

main()
