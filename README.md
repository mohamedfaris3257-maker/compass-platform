# 🧭 Compass Career Platform

A full-stack career intelligence web application for secondary school students (ages 14–18).

**Stack:** React 18 + Vite + Tailwind CSS + Supabase (PostgreSQL + Edge Functions) + Claude AI (Anthropic)

---

## Overview

Compass is a three-layer career assessment platform:

1. **RIASEC Assessment** — 30-item Holland interest inventory (scored 0–7 per theme)
2. **Big Five Personality** — 10-item OCEAN measure (scored 1–5 per trait)
3. **AI Report Generation** — Claude generates personalised narrative content tailored to each student's profile, hobbies, curriculum, and work preferences

Career matching uses Euclidean distance against a 100+ career database (O*NET v28.0 + 20 modern emerging careers).

---

## Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier works)
- An [Anthropic API key](https://console.anthropic.com)

---

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_VERSION=2.0
```

### 3. Set up the Supabase database

In your Supabase project, go to **SQL Editor** and run the migration files in order:

```bash
# Run in Supabase SQL Editor:
supabase/migrations/001_core.sql    # Tables
supabase/migrations/002_indexes.sql # Indexes
supabase/migrations/003_rls.sql     # Row Level Security
```

Or using the Supabase CLI:

```bash
supabase db push
```

### 4. Seed the database

You'll need your service role key for this step (not the anon key):

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node scripts/seed.js
```

This inserts:
- 80 O*NET careers
- 20 modern/emerging careers
- 70 universities (10 per country: USA, UK, Canada, India, Australia, UAE, Germany)
- 1 demo school

### 5. Deploy Supabase Edge Functions

Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and link your project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

Set the Anthropic API key as a secret:

```bash
supabase secrets set ANTHROPIC_API_KEY=your-anthropic-key
```

Deploy the Edge Functions:

```bash
supabase functions deploy generate-report
supabase functions deploy career-chat
```

### 6. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Project Structure

```
compass-platform/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── assessment/         # LikertScale, ProgressHeader, QuestionCard
│   │   ├── careers/            # DemandChip, CareerChatWidget
│   │   ├── charts/             # RiasecRadar, BigFiveBars, MatchGauge
│   │   ├── layout/             # AppShell, Navbar, Footer
│   │   ├── report/             # All 11 report section components
│   │   └── ui/                 # Button, Card, Badge, Chip, Modal, Toast, etc.
│   ├── data/
│   │   ├── riasec-questions.js # 30 RIASEC items
│   │   ├── bigfive-questions.js # 10 Big Five items
│   │   ├── careers-seed.js     # 80 O*NET careers
│   │   ├── modern-careers.js   # 20 emerging careers
│   │   └── uni-data.js         # 70 universities
│   ├── pages/
│   │   ├── Welcome.jsx
│   │   ├── Assessment.jsx      # Multi-step assessment form
│   │   ├── Processing.jsx      # AI generation waiting screen
│   │   ├── Report.jsx          # Full 11-section report
│   │   ├── CareerFinder.jsx    # Browse & filter all careers
│   │   ├── CourseFinder.jsx    # Match student to university programs
│   │   ├── UniFinder.jsx       # Browse universities by country
│   │   ├── AdminDashboard.jsx  # School admin panel
│   │   └── Methodology.jsx     # Transparent methodology page
│   ├── services/
│   │   ├── supabase.js         # Supabase client
│   │   ├── ai.js               # Edge Function calls
│   │   ├── scoring.js          # RIASEC + Big Five scoring algorithms
│   │   └── pdf.js              # @react-pdf/renderer PDF generation
│   └── utils/
│       ├── matching.js         # Euclidean distance career matching
│       ├── clustering.js       # SOC-based career clustering
│       └── ageCalc.js          # Date of birth utilities
├── supabase/
│   ├── migrations/             # 001_core, 002_indexes, 003_rls SQL
│   └── functions/
│       ├── generate-report/    # 7-prompt AI report generation
│       └── career-chat/        # Streaming career chat
├── scripts/
│   └── seed.js                 # Database seeder
├── .env.example
├── vercel.json
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Psychometric Methodology

### RIASEC (Holland's Theory of Vocational Personalities)
- 30 items, 5 per theme (R, I, A, S, E, C)
- Reverse-scored items: R3, I4, A3, S4, E3, C4
- Score formula: `((sum − 5) / 20) × 7` → normalised to 0–7
- Career profiles from O*NET v28.0

### Big Five (OCEAN)
- 10 items, 2 per trait (O, C, E, A, N)
- Reverse-scored items: B2, B4, B6, B8, B9
- Score: simple mean of item responses (1–5 scale)
- "Neuroticism" labelled "Stress Sensitivity" in all student-facing content

### Career Matching
- **Holland match**: Euclidean distance on 6 RIASEC dimensions, normalised to 0–100%
- **Personality match**: Big Five mapped to RIASEC dims (O→I+A, E→E, A→S, C→C), then distance
- **Blended match**: 40% Holland + 35% Personality + 25% Hobby relevance

---

## Deployment (Vercel)

```bash
npm run build  # Verify build is clean first

# Deploy to Vercel
npx vercel --prod
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_VERSION` = `2.0`

The `vercel.json` includes SPA rewrites and asset caching headers.

---

## Admin Dashboard

Visit `/admin` to access the school admin panel. Features:
- Overview stats (total assessments, completion rate, RIASEC distribution)
- Student table with search and curriculum filter
- Assessment insights and cluster analysis
- CSV export for students, assessments, and reports

> ⚠️  **Note:** The admin dashboard in v1 has no authentication. Add Supabase Auth + admin role check before deploying to production.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon (public) key |
| `VITE_APP_VERSION` | Optional | Displayed in footer (default: 2.0) |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed only | Service role key for seeding |
| `ANTHROPIC_API_KEY` | Edge Functions | Set via `supabase secrets set` |

---

## Key References

- Holland, J.L. (1997). *Making vocational choices* (3rd ed.). Psychological Assessment Resources.
- McCrae, R.R., & Costa, P.T. Jr. (1987). Validation of the five-factor model of personality. *Journal of Personality and Social Psychology, 52*(1), 81–90.
- O*NET Resource Center (2024). *O*NET OnLine v28.0.* US Department of Labor.
- Rounds, J., & Su, R. (2014). The nature and power of interests. *Current Directions in Psychological Science, 23*(2), 98–103.

---

## Licence

Private / Proprietary — Proplr 2024. All rights reserved.

This codebase is not open source. Do not distribute without permission.
