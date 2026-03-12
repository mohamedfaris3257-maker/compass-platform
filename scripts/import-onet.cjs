const { createClient } = require('@supabase/supabase-js')
const { createReadStream } = require('fs')
const { createInterface } = require('readline')
const { resolve } = require('path')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function readTSV(filename) {
  const rows = []
  const filePath = resolve('data/onet', filename)
  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity })
  let headers = null
  for await (const line of rl) {
    if (!headers) { headers = line.split('\t'); continue }
    const values = line.split('\t')
    const row = {}
    headers.forEach((h, i) => row[h.trim()] = (values[i] || '').trim())
    rows.push(row)
  }
  return rows
}

async function main() {
  console.log('Reading O*NET files...')
  const occupations = await readTSV('Occupation Data.txt')
  const interests = await readTSV('Interests.txt')
  const jobZones = await readTSV('Job Zones.txt')
  const tasks = await readTSV('Task Statements.txt')
  const skills = await readTSV('Skills.txt')
  const altTitles = await readTSV('Alternate Titles.txt')

  const map = {}
  for (const o of occupations) {
    const code = o['O*NET-SOC Code']
    if (!code) continue
    map[code] = { soc_code: code, title: o['Title'], description: o['Description'], riasec_r:0, riasec_i:0, riasec_a:0, riasec_s:0, riasec_e:0, riasec_c:0, job_zone:3, source:'onet' }
  }

  const riasecMap = { Realistic:'r', Investigative:'i', Artistic:'a', Social:'s', Enterprising:'e', Conventional:'c' }
  for (const row of interests) {
    if (row['Scale ID'] !== 'OI') continue
    const code = row['O*NET-SOC Code']
    const letter = riasecMap[row['Element Name']]
    if (!map[code] || !letter) continue
    map[code][letter + '_score'] = parseFloat(row['Data Value']) || 0
  }

  for (const row of jobZones) {
    const code = row['O*NET-SOC Code']
    if (map[code]) map[code].job_zone = parseInt(row['Job Zone']) || 3
  }

  const taskMap = {}
  for (const row of tasks) {
    const code = row['O*NET-SOC Code']
    if (!taskMap[code]) taskMap[code] = []
    if (taskMap[code].length < 5) taskMap[code].push(row['Task'])
  }

  const skillMap = {}
  for (const row of skills) {
    if (row['Scale ID'] !== 'IM') continue
    const code = row['O*NET-SOC Code']
    if (!skillMap[code]) skillMap[code] = []
    skillMap[code].push({ name: row['Element Name'], val: parseFloat(row['Data Value']) || 0 })
  }

  const altMap = {}
  for (const row of altTitles) {
    const code = row['O*NET-SOC Code']
    if (!altMap[code]) altMap[code] = []
    altMap[code].push(row['Alternate Title'])
  }

  const careers = Object.values(map)
  console.log(`Upserting ${careers.length} careers...`)

  const careerRows = careers.map(c => ({
    soc_code: c.soc_code, title: c.title, description: c.description,
    riasec_r: c.riasec_r, riasec_i: c.riasec_i, riasec_a: c.riasec_a,
    riasec_s: c.riasec_s, riasec_e: c.riasec_e, riasec_c: c.riasec_c,
    job_zone: c.job_zone, source: c.source
  }))

  for (let i = 0; i < careerRows.length; i += 100) {
    const batch = careerRows.slice(i, i + 100)
    const { error } = await supabase.from('careers').upsert(batch, { onConflict: 'soc_code' })
    if (error) { console.error('Career upsert error:', error.message); process.exit(1) }
    if (i % 500 === 0) console.log(`  ${i}/${careerRows.length}`)
  }

  const detailRows = careers.map(c => ({
    soc_code: c.soc_code,
    tasks: taskMap[c.soc_code] || [],
    skills: (skillMap[c.soc_code] || []).sort((a,b)=>b.val-a.val).slice(0,5).map(s=>s.name),
    alt_titles: altMap[c.soc_code] || [],
    work_styles: null, work_context: null, education_req: null
  }))

  for (let i = 0; i < detailRows.length; i += 100) {
    const batch = detailRows.slice(i, i + 100)
    const { error } = await supabase.from('career_details').upsert(batch, { onConflict: 'soc_code' })
    if (error) { console.error('Details upsert error:', error.message); process.exit(1) }
  }

  console.log(`Import complete! ${careers.length} careers imported.`)
}

main().catch(console.error)
