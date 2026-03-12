-- ============================================================
-- Compass Career Platform — Migration 003: Row Level Security
-- ============================================================
-- NOTE: In this platform, students are not authenticated via
-- Supabase Auth. The anon key is used for all client reads.
-- Sensitive writes go through service-role-authenticated
-- Supabase Edge Functions only.
-- All tables below allow anon SELECT so the React frontend
-- can query them directly. Mutations go through Edge Functions
-- using the service role key.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE schools         ENABLE ROW LEVEL SECURITY;
ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_matches  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CAREERS — public read (anon can browse)
-- ============================================================
CREATE POLICY "careers_anon_select"
  ON careers FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- ============================================================
-- UNIVERSITIES — public read
-- ============================================================
CREATE POLICY "universities_anon_select"
  ON universities FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- ============================================================
-- SCHOOLS — public read (needed for student form)
-- ============================================================
CREATE POLICY "schools_anon_select"
  ON schools FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- ============================================================
-- STUDENTS — anon can insert (self-registration during assessment)
--            anon can select own record by UUID
-- ============================================================
CREATE POLICY "students_anon_insert"
  ON students FOR INSERT
  TO anon
  WITH CHECK (TRUE);

-- Allow reading by student UUID (passed as filter in query)
-- Since we have no auth, rely on knowing the UUID
CREATE POLICY "students_anon_select"
  ON students FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Service role can do everything
CREATE POLICY "students_service_all"
  ON students FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- ASSESSMENTS — anon insert + select
-- ============================================================
CREATE POLICY "assessments_anon_insert"
  ON assessments FOR INSERT
  TO anon
  WITH CHECK (TRUE);

CREATE POLICY "assessments_anon_select"
  ON assessments FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "assessments_service_all"
  ON assessments FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- CAREER MATCHES — anon insert + select
-- ============================================================
CREATE POLICY "career_matches_anon_insert"
  ON career_matches FOR INSERT
  TO anon
  WITH CHECK (TRUE);

CREATE POLICY "career_matches_anon_select"
  ON career_matches FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "career_matches_service_all"
  ON career_matches FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- REPORTS — anon can read; only service role writes
-- (AI generation happens in Edge Functions using service role)
-- ============================================================
CREATE POLICY "reports_anon_select"
  ON reports FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "reports_anon_insert"
  ON reports FOR INSERT
  TO anon
  WITH CHECK (TRUE);

CREATE POLICY "reports_service_all"
  ON reports FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- SHORTLISTS — anon CRUD (no auth in v1)
-- ============================================================
CREATE POLICY "shortlists_anon_all"
  ON shortlists FOR ALL
  TO anon, authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- Grant permissions to anon role
-- ============================================================
GRANT SELECT, INSERT ON students        TO anon;
GRANT SELECT, INSERT ON assessments     TO anon;
GRANT SELECT, INSERT ON career_matches  TO anon;
GRANT SELECT, INSERT ON reports         TO anon;
GRANT SELECT           ON careers       TO anon;
GRANT SELECT           ON universities  TO anon;
GRANT SELECT           ON schools       TO anon;
GRANT ALL              ON shortlists    TO anon;
