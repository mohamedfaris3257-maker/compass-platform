import { supabase } from './supabase'

export const generateReport = async (assessmentId) => {
  // Edge Function reads snake_case key: { assessment_id }
  // (sending camelCase { assessmentId } was the original bug — the key must match)
  const { data, error } = await supabase.functions.invoke('generate-report', {
    body: { assessment_id: assessmentId },
  })
  return { data, error }
}

export const chatWithCareer = async (careerTitle, studentProfile, messages) => {
  // Edge Function reads snake_case keys to match its TypeScript interface
  const { data, error } = await supabase.functions.invoke('career-chat', {
    body: { career_title: careerTitle, student_profile: studentProfile, messages },
  })
  return { data, error }
}
