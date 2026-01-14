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

// Novos tipos para o sistema aprimorado
export type Subject = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export type StudySessionDetailed = {
  id: string
  user_id: string
  subject_id?: string
  subject_name?: string
  session_type: 'pomodoro' | 'custom' | 'free'
  work_duration: number
  break_duration: number
  cycles_completed: number
  total_work_minutes: number
  total_break_minutes: number
  productivity_rating?: number
  had_distractions?: boolean
  feedback_notes?: string
  started_at?: string
  completed_at?: string
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned'
  created_at: string
}

export type UserSettings = {
  user_id: string
  daily_available_minutes: number
  default_work_duration: number
  default_break_duration: number
  sound_enabled: boolean
  created_at: string
  updated_at: string
}

export type PomodoroPreset = {
  name: string
  work: number
  break: number
  description: string
}

export const POMODORO_PRESETS: PomodoroPreset[] = [
  { name: 'Clássico', work: 25, break: 5, description: 'Técnica Pomodoro tradicional' },
  { name: 'Estendido', work: 50, break: 10, description: 'Para sessões mais longas' },
  { name: 'Curto', work: 15, break: 3, description: 'Para tarefas rápidas' },
  { name: 'Intenso', work: 90, break: 20, description: 'Deep work' },
]
