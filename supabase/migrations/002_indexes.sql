-- ============================================================
-- Compass Career Platform — Migration 002: Indexes
-- ============================================================

-- Students
CREATE INDEX IF NOT EXISTS idx_students_school_id    ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_created_at   ON students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_curriculum    ON students(curriculum);
CREATE INDEX IF NOT EXISTS idx_students_country       ON students(country);

-- Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_student_id   ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_riasec_top3  ON assessments(riasec_top3);

-- Career Matches
CREATE INDEX IF NOT EXISTS idx_career_matches_assessment_id ON career_matches(assessment_id);
CREATE INDEX IF NOT EXISTS idx_career_matches_career_id     ON career_matches(career_id);
CREATE INDEX IF NOT EXISTS idx_career_matches_blended_pct   ON career_matches(blended_pct DESC);

-- Reports
CREATE INDEX IF NOT EXISTS idx_reports_assessment_id ON reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_reports_student_id    ON reports(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_status        ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at    ON reports(created_at DESC);

-- Careers
CREATE INDEX IF NOT EXISTS idx_careers_soc_code   ON careers(soc_code);
CREATE INDEX IF NOT EXISTS idx_careers_source     ON careers(source);
CREATE INDEX IF NOT EXISTS idx_careers_is_active  ON careers(is_active);
CREATE INDEX IF NOT EXISTS idx_careers_job_zone   ON careers(job_zone);

-- Full-text search on career title
CREATE INDEX IF NOT EXISTS idx_careers_title_fts ON careers USING GIN(to_tsvector('english', title));

-- Universities
CREATE INDEX IF NOT EXISTS idx_universities_country       ON universities(country);
CREATE INDEX IF NOT EXISTS idx_universities_qs_ranking    ON universities(qs_ranking);
CREATE INDEX IF NOT EXISTS idx_universities_scholarship   ON universities(scholarship_available);
CREATE INDEX IF NOT EXISTS idx_universities_subject_areas ON universities USING GIN(subject_areas);
CREATE INDEX IF NOT EXISTS idx_universities_programs      ON universities USING GIN(programs);

-- Shortlists
CREATE INDEX IF NOT EXISTS idx_shortlists_student_id    ON shortlists(student_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_university_id ON shortlists(university_id);

-- Schools
CREATE INDEX IF NOT EXISTS idx_schools_country ON schools(country);
