import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types para o banco de dados
export type UserProfile = {
  id: string
  created_at: string
  updated_at: string
  study_goal: string
  weekly_frequency: string
  focus_capacity: string
  best_time: string
  main_difficulty: string
  routine_style: string
  onboarding_completed: boolean
}

export type StudyPlan = {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  session_duration: number
  sessions_per_day: number
  study_days: string[]
  preferred_times: string[]
  is_active: boolean
}

export type StudySession = {
  id: string
  user_id: string
  plan_id: string
  created_at: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  status: 'pending' | 'completed' | 'skipped' | 'abandoned'
  completed_at?: string
  actual_duration?: number
}
