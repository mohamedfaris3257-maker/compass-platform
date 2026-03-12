-- ============================================================
-- Compass Career Platform — Migration 001: Core Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SCHOOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS schools (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  country         TEXT NOT NULL,
  city            TEXT,
  curriculum      TEXT,   -- IB, GCSE, A-Levels, CBSE, HSC, etc.
  admin_email     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id       UUID REFERENCES schools(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  date_of_birth   DATE NOT NULL,
  year_group      TEXT,           -- Year 10, Grade 11, etc.
  curriculum      TEXT NOT NULL,  -- IB, GCSE, A-Levels, CBSE, HSC, Other
  country         TEXT,
  city            TEXT,
  email           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ASSESSMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS assessments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- RIASEC raw scores (0–7 scale)
  riasec_r        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_i        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_a        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_s        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_e        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_c        NUMERIC(4,2) NOT NULL DEFAULT 0,

  -- Big Five / OCEAN scores (1–5 scale)
  ocean_o         NUMERIC(4,2) NOT NULL DEFAULT 3,
  ocean_c         NUMERIC(4,2) NOT NULL DEFAULT 3,
  ocean_e         NUMERIC(4,2) NOT NULL DEFAULT 3,
  ocean_a         NUMERIC(4,2) NOT NULL DEFAULT 3,
  ocean_n         NUMERIC(4,2) NOT NULL DEFAULT 3,

  -- Open-ended inputs
  hobbies         TEXT,
  work_pref       TEXT,   -- work preference description
  subjects_liked  TEXT,

  -- Derived fields
  riasec_top3     TEXT,   -- e.g. 'IAE'
  ocean_dominant  TEXT,   -- e.g. 'Conscientiousness'

  -- Raw answers (JSONB for audit purposes)
  riasec_answers  JSONB,
  ocean_answers   JSONB,

  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CAREERS (our curated database)
-- ============================================================
CREATE TABLE IF NOT EXISTS careers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soc_code        TEXT NOT NULL,          -- e.g. '15-1252'
  title           TEXT NOT NULL,
  source          TEXT NOT NULL DEFAULT 'onet',  -- 'onet' | 'modern'
  description     TEXT,

  -- RIASEC profile (0–7)
  riasec_r        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_i        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_a        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_s        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_e        NUMERIC(4,2) NOT NULL DEFAULT 0,
  riasec_c        NUMERIC(4,2) NOT NULL DEFAULT 0,

  -- Labour market
  salary_usd_low  INTEGER,                -- in thousands USD
  salary_usd_high INTEGER,                -- in thousands USD
  job_zone        INTEGER CHECK (job_zone BETWEEN 1 AND 5),

  -- Structured details (JSONB)
  details         JSONB,  -- {tasks, skills, education_req, alt_titles}

  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CAREER MATCHES (per assessment)
-- ============================================================
CREATE TABLE IF NOT EXISTS career_matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  career_id       UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,

  -- Match scores (0–100)
  holland_pct     INTEGER NOT NULL DEFAULT 0,
  personality_pct INTEGER NOT NULL DEFAULT 0,
  blended_pct     INTEGER NOT NULL DEFAULT 0,

  -- Which list this appeared in (can appear in multiple)
  match_types     TEXT[] NOT NULL DEFAULT '{}',  -- ['holland','personality','blended']

  rank_blended    INTEGER,
  rank_holland    INTEGER,
  rank_personality INTEGER,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(assessment_id, career_id)
);

-- ============================================================
-- REPORTS (AI-generated content per assessment)
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id   UUID NOT NULL UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  status          TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'generating' | 'complete' | 'failed'

  -- AI generated text fields (JSONB maps career_id → text)
  ai_snapshot     TEXT,               -- Executive snapshot paragraph
  ai_strengths    TEXT,               -- RIASEC strength highlights
  ai_career_rationale   JSONB,        -- {career_id: text}
  ai_skills_programs    JSONB,        -- {career_id: text}
  ai_demand             JSONB,        -- {career_id: {region: level}}
  ai_cluster_analysis   JSONB,        -- {cluster_key: {name, one_line, why_appears}}
  ai_modern_careers     TEXT,         -- Modern careers narrative

  error_message   TEXT,               -- If status = 'failed'
  generated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UNIVERSITIES (reference data)
-- ============================================================
CREATE TABLE IF NOT EXISTS universities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  country         TEXT NOT NULL,
  city            TEXT,
  qs_ranking      INTEGER,
  tuition_usd_per_year INTEGER,
  ielts_min       NUMERIC(3,1),
  scholarship_available BOOLEAN NOT NULL DEFAULT FALSE,
  programs        TEXT[],          -- Array of program names
  subject_areas   TEXT[],          -- Array of subject area strings
  application_deadline TEXT,       -- "Rolling" or "January 15"
  website         TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SHORTLISTS (student → university wishlist)
-- ============================================================
CREATE TABLE IF NOT EXISTS shortlists (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  university_id   UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, university_id)
);

-- ============================================================
-- UPDATED_AT trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
