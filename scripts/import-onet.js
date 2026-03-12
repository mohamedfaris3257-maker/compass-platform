#!/usr/bin/env node
// ============================================================
// Compass Career Platform — O*NET Data Importer
// Reads real O*NET v28 tab-separated files and upserts into
// Supabase careers + career_details tables.
//
// Usage:
//   node scripts/import-onet.js
//   node scripts/import-onet.js --data-dir /absolute/path/to/onet
//
// Env vars (set in .env.local or shell):
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
//   ONET_DIR=/path/to/onet/files   (optional override)
// ============================================================

import { createReadStream, readFileSync, existsSync } from 'fs'
import { createInterface }                            from 'readline'
import { createClient }                               from '@supabase/supabase-js'
import { fileURLToPath }                              from 'url'
import { dirname, join, resolve }                     from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')

// ─── Load .env.local ─────────────────────────────────────────
function loadEnvLocal() {
  try {
    const raw = readFileSync(join(ROOT, '.env.local'), 'utf-8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq === -1) continue
      const key = t.slice(0, eq).trim()
      const val = t.slice(eq + 1).trim()
      if (key && !process.env[key]) process.env[key] = val
    }
  } catch { /* no .env.local — rely on real env */ }
}

loadEnvLocal()

// ─── Resolve O*NET data directory ────────────────────────────
// Priority: --data-dir arg  >  ONET_DIR env  >  ../data/onet (sibling of project)
function resolveOnetDir() {
  const argIdx = process.argv.indexOf('--data-dir')
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    return resolve(process.argv[argIdx + 1])
  }
  if (process.env.ONET_DIR) return resolve(process.env.ONET_DIR)
  return resolve(ROOT, '..', 'data', 'onet')     // ../data/onet relative to project root
}

const ONET_DIR = resolveOnetDir()

// ─── Validate env + paths ─────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
  console.error('\n❌  SUPABASE_URL is missing or still a placeholder.')
  console.error('    Add it to .env.local:\n    SUPABASE_URL=https://your-project.supabase.co\n')
  process.exit(1)
}
if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('placeholder')) {
  console.error('\n❌  SUPABASE_SERVICE_ROLE_KEY is missing.')
  console.error('    Supabase Dashboard → Settings → API → service_role key\n')
  process.exit(1)
}
if (!existsSync(ONET_DIR)) {
  console.error(`\n❌  O*NET data directory not found: ${ONET_DIR}`)
  console.error('    Download O*NET database files from https://www.onetcenter.org/database.html')
  console.error('    Then run: node scripts/import-onet.js --data-dir /path/to/onet\n')
  process.exit(1)
}

const REQUIRED_FILES = [
  'Occupation Data.txt',
  'Interests.txt',
  'Job Zones.txt',
  'Task Statements.txt',
  'Skills.txt',
  'Alternate Titles.txt',
]

for (const f of REQUIRED_FILES) {
  if (!existsSync(join(ONET_DIR, f))) {
    console.error(`\n❌  Required file missing: ${join(ONET_DIR, f)}\n`)
    process.exit(1)
  }
}

// ─── Supabase client (service role bypasses RLS) ─────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ─── Confirmed column indices (verified from file headers) ───
// Occupation Data.txt: O*NET-SOC Code[0], Title[1], Description[2]
// Interests.txt:       O*NET-SOC Code[0], Element ID[1], Element Name[2], Scale ID[3], Data Value[4]
// Job Zones.txt:       O*NET-SOC Code[0], Job Zone[1], Date[2], Domain Source[3]
// Task Statements.txt: O*NET-SOC Code[0], Task ID[1], Task[2], Task Type[3], ...
// Skills.txt:          O*NET-SOC Code[0], Element ID[1], Element Name[2], Scale ID[3], Data Value[4], ...
// Alternate Titles.txt:O*NET-SOC Code[0], Alternate Title[1], Short Title[2], Source(s)[3]

// ─── RIASEC element name → score field ───────────────────────
const RIASEC_KEY = {
  'Realistic':     'r_score',
  'Investigative': 'i_score',
  'Artistic':      'a_score',
  'Social':        's_score',
  'Enterprising':  'e_score',
  'Conventional':  'c_score',
}

// ─── Core TSV streaming reader ────────────────────────────────
// Calls onRow(cols: string[]) for every data row (skips header).
// Does NOT build an in-memory array — purely streaming.
async function streamTSV(filename, onRow) {
  return new Promise((resolve, reject) => {
    let isHeader = true
    const rl = createInterface({
      input: createReadStream(join(ONET_DIR, filename), { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    })
    rl.on('line', (line) => {
      if (isHeader) { isHeader = false; return }
      if (!line.trim()) return
      onRow(line.split('\t'))
    })
    rl.on('close', resolve)
    rl.on('error', reject)
  })
}

// ─── File readers ─────────────────────────────────────────────

/** 1. soc_code → { title, description } */
async function readOccupations() {
  const map = new Map()
  await streamTSV('Occupation Data.txt', (cols) => {
    const soc  = cols[0]?.trim()
    const title = cols[1]?.trim()
    const desc  = cols[2]?.trim()
    if (soc && title) map.set(soc, { title, description: desc ?? null })
  })
  return map
}

/** 2. soc_code → { r_score, i_score, a_score, s_score, e_score, c_score }
 *  Filters Scale ID = 'OI'. Values are already on the 1–7 O*NET scale. */
async function readInterests() {
  // Accumulate into a nested map first (soc → key → value)
  const raw = new Map()  // soc → { r_score: x, ... }

  await streamTSV('Interests.txt', (cols) => {
    const soc     = cols[0]?.trim()
    const elemName = cols[2]?.trim()
    const scaleId  = cols[3]?.trim()
    const val      = parseFloat(cols[4])

    if (scaleId !== 'OI') return
    const key = RIASEC_KEY[elemName]
    if (!key || !soc || isNaN(val)) return

    if (!raw.has(soc)) raw.set(soc, {})
    raw.get(soc)[key] = Math.round(val * 100) / 100  // 2dp
  })

  return raw
}

/** 3. soc_code → job_zone (integer 1–5) */
async function readJobZones() {
  const map = new Map()
  await streamTSV('Job Zones.txt', (cols) => {
    const soc = cols[0]?.trim()
    const jz  = parseInt(cols[1], 10)
    if (soc && !isNaN(jz)) map.set(soc, jz)
  })
  return map
}

/** 4. soc_code → string[]  (first 5 Core tasks in file order) */
async function readTasks() {
  const map = new Map()   // soc → string[]
  await streamTSV('Task Statements.txt', (cols) => {
    const soc  = cols[0]?.trim()
    const task = cols[2]?.trim()
    if (!soc || !task) return
    if (!map.has(soc)) map.set(soc, [])
    const arr = map.get(soc)
    if (arr.length < 5) arr.push(task)
  })
  return map
}

/** 5. soc_code → string[]  (top 5 skills by Importance, Scale ID = 'IM') */
async function readSkills() {
  // Collect all IM-scale entries per soc, then sort + slice
  const raw = new Map()   // soc → [{name, value}]

  await streamTSV('Skills.txt', (cols) => {
    const soc     = cols[0]?.trim()
    const elemName = cols[2]?.trim()
    const scaleId  = cols[3]?.trim()
    const val      = parseFloat(cols[4])

    if (scaleId !== 'IM' || !soc || !elemName || isNaN(val)) return
    if (!raw.has(soc)) raw.set(soc, [])
    raw.get(soc).push({ name: elemName, value: val })
  })

  // Sort descending by importance, take top 5 names
  const map = new Map()
  for (const [soc, entries] of raw) {
    entries.sort((a, b) => b.value - a.value)
    map.set(soc, entries.slice(0, 5).map(e => e.name))
  }
  return map
}

/** 6. soc_code → string[]  (all alternate titles, deduped) */
async function readAltTitles() {
  const map = new Map()   // soc → Set<string>
  await streamTSV('Alternate Titles.txt', (cols) => {
    const soc   = cols[0]?.trim()
    const title = cols[1]?.trim()
    if (!soc || !title || title === 'n/a') return
    if (!map.has(soc)) map.set(soc, new Set())
    map.get(soc).add(title)
  })
  // Convert sets to arrays
  const out = new Map()
  for (const [soc, set] of map) out.set(soc, [...set])
  return out
}

// ─── Batch upsert helper ─────────────────────────────────────
async function upsertBatch(table, rows, conflictCol, batchSize = 100) {
  let total = 0
  const tableExists = { _checked: false, _exists: true }

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: conflictCol, ignoreDuplicates: false })

    if (error) {
      // Table doesn't exist — skip gracefully
      if (error.code === '42P01') {
        if (!tableExists._checked) {
          console.log(`\n  ℹ️   Table '${table}' does not exist — skipping. Create it with the migration SQL if needed.`)
          tableExists._exists = false
          tableExists._checked = true
        }
        return total
      }
      throw new Error(`[${table}] rows ${i}–${i + batchSize}: ${error.message}`)
    }

    total += batch.length
    process.stdout.write('.')
  }
  return total
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('🧭  Compass — O*NET Data Importer')
  console.log(`    Supabase : ${SUPABASE_URL}`)
  console.log(`    Data dir : ${ONET_DIR}`)
  console.log(`    Started  : ${new Date().toISOString()}`)
  console.log()

  // ── Step 1–6: Read all files ──────────────────────────────
  console.log('Reading O*NET files...')
  const t0 = Date.now()

  const [occupations, interests, jobZones, tasks, skills, altTitles] = await Promise.all([
    readOccupations(),
    readInterests(),
    readJobZones(),
    readTasks(),
    readSkills(),
    readAltTitles(),
  ])

  console.log(`  ✅  Occupations  : ${occupations.size} records`)
  console.log(`  ✅  Interests    : ${interests.size} records`)
  console.log(`  ✅  Job Zones    : ${jobZones.size} records`)
  console.log(`  ✅  Tasks        : ${tasks.size} records`)
  console.log(`  ✅  Skills       : ${skills.size} records`)
  console.log(`  ✅  Alt Titles   : ${altTitles.size} records`)
  console.log(`  ⏱   Read time    : ${((Date.now() - t0) / 1000).toFixed(1)}s`)

  // ── Step 7: Merge by soc_code ─────────────────────────────
  const careerRows   = []  // → careers table
  const detailRows   = []  // → career_details table

  for (const [soc, occ] of occupations) {
    const riasec = interests.get(soc) ?? {}
    const jz     = jobZones.get(soc)  ?? 3
    const t      = tasks.get(soc)     ?? []
    const sk     = skills.get(soc)    ?? []
    const alt    = altTitles.get(soc) ?? []

    // career object (raw field names)
    const career = {
      soc_code:    soc,
      title:       occ.title,
      description: occ.description,
      r_score:     riasec.r_score ?? 0,
      i_score:     riasec.i_score ?? 0,
      a_score:     riasec.a_score ?? 0,
      s_score:     riasec.s_score ?? 0,
      e_score:     riasec.e_score ?? 0,
      c_score:     riasec.c_score ?? 0,
      job_zone:    jz,
      source:      'onet',
    }

    // details object
    const detail = {
      soc_code:  soc,
      tasks:     t,
      skills:    sk,
      alt_titles: alt,
    }

    // Map career → careers DB schema
    // (DB columns: riasec_r/i/a/s/e/c  +  details JSONB  +  salary/is_active)
    careerRows.push({
      soc_code:        career.soc_code,
      title:           career.title,
      description:     career.description,
      riasec_r:        career.r_score,
      riasec_i:        career.i_score,
      riasec_a:        career.a_score,
      riasec_s:        career.s_score,
      riasec_e:        career.e_score,
      riasec_c:        career.c_score,
      job_zone:        career.job_zone,
      source:          career.source,
      salary_usd_low:  null,   // O*NET doesn't include wages — use BLS data separately
      salary_usd_high: null,
      details:         {       // also store in JSONB for the app's existing queries
        tasks:         detail.tasks,
        skills:        detail.skills,
        alt_titles:    detail.alt_titles,
        education_req: null,
      },
      is_active: true,
    })

    detailRows.push(detail)
  }

  const total = careerRows.length

  // ── Step 8–9: Upsert careers ──────────────────────────────
  console.log()
  console.log(`Upserting ${total} careers...`)
  const t1 = Date.now()
  const careersInserted = await upsertBatch('careers', careerRows, 'soc_code', 100)
  console.log(`\n  ✅  careers: ${careersInserted} rows upserted  (${((Date.now() - t1) / 1000).toFixed(1)}s)`)

  // ── Step 10: Upsert career_details ────────────────────────
  console.log()
  console.log(`Upserting ${total} career details...`)
  const t2 = Date.now()
  const detailsInserted = await upsertBatch('career_details', detailRows, 'soc_code', 100)
  if (detailsInserted > 0) {
    console.log(`\n  ✅  career_details: ${detailsInserted} rows upserted  (${((Date.now() - t2) / 1000).toFixed(1)}s)`)
  }

  // ── Done ──────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log()
  console.log(`Import complete! ${careersInserted} careers imported.`)
  console.log(`Total time: ${elapsed}s`)
  console.log()
  console.log('Notes:')
  console.log('  • salary_usd_low / salary_usd_high are null — O*NET does not include wages.')
  console.log('    Import BLS OES wage data separately if needed.')
  console.log('  • career_details rows require the migration SQL to create that table.')
  console.log('    Details are also stored in careers.details (JSONB) for immediate use.')
}

main().catch((err) => {
  console.error('\n❌  Import failed:', err.message)
  if (err.message.includes('JWT')) {
    console.error('\n    Hint: Use SUPABASE_SERVICE_ROLE_KEY, not the anon key.')
  }
  if (err.message.includes('does not exist') || err.message.includes('42P01')) {
    console.error('\n    Hint: Run migrations first:')
    console.error('    supabase/migrations/001_core.sql')
    console.error('    supabase/migrations/002_indexes.sql')
    console.error('    supabase/migrations/003_rls.sql')
  }
  process.exit(1)
})
