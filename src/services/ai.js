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
  // messages is the full conversation array including the NEW user message at the end.
  // Edge function expects:
  //   message              — the new user message string
  //   conversation_history — all prior turns (everything except the last message)
  const newMessage = messages[messages.length - 1]?.content || ''
  const conversationHistory = messages
    .slice(0, -1)
    .map(m => ({ role: m.role, content: m.content }))

  const { data, error } = await supabase.functions.invoke('career-chat', {
    body: {
      career_title:         careerTitle,
      student_profile:      studentProfile,
      message:              newMessage,
      conversation_history: conversationHistory,
    },
  })
  return { data, error }
}
