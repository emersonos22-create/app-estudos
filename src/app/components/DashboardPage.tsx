'use client'

import { useEffect, useState } from 'react'
import { supabase, StudyPlan, StudySession } from '@/lib/supabase'
import { LogOut, Calendar, Clock, TrendingUp, Play, CheckCircle, Sparkles, Flame } from 'lucide-react'
import { generateWeeklySessions, formatDuration, calculateStreak, getMotivationalMessage } from '@/lib/study-helpers'

type DashboardProps = {
  userId: string
}

export default function DashboardPage({ userId }: DashboardProps) {
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [todaySessions, setTodaySessions] = useState<StudySession[]>([])
  const [weekProgress, setWeekProgress] = useState({ completed: 0, total: 0 })
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [adjusting, setAdjusting] = useState(false)
  const [aiMessage, setAiMessage] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    try {
      // Carregar plano ativo
      const { data: planData, error: planError } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (planError) throw planError
      setPlan(planData)

      // Gerar sessões da semana se necessário
      if (planData) {
        await generateWeeklySessions(userId, planData)
      }

      // Carregar sessões de hoje
      const today = new Date().toISOString().split('T')[0]
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('scheduled_date', today)
        .order('scheduled_time', { ascending: true })

      if (sessionsError) throw sessionsError
      setTodaySessions(sessionsData || [])

      // Calcular progresso da semana
      const startOfWeek = getStartOfWeek()
      const { data: weekSessions, error: weekError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('scheduled_date', startOfWeek)

      if (weekError) throw weekError
      const completed = weekSessions?.filter((s) => s.status === 'completed').length || 0
      const total = weekSessions?.length || 0
      setWeekProgress({ completed, total })

      // Calcular streak
      const currentStreak = await calculateStreak(userId)
      setStreak(currentStreak)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStartOfWeek = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const handleStartSession = async (sessionId: string) => {
    try {
      const session = todaySessions.find((s) => s.id === sessionId)
      if (!session) return

      const { error } = await supabase
        .from('study_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          actual_duration: session.duration_minutes,
        })
        .eq('id', sessionId)

      if (error) throw error
      loadDashboardData()
    } catch (error) {
      console.error('Erro ao completar sessão:', error)
    }
  }

  const handleAdjustPlan = async () => {
    setAdjusting(true)
    try {
      // Buscar dados comportamentais
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data: allSessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)

      const completed = allSessions?.filter((s) => s.status === 'completed') || []
      const abandoned = allSessions?.filter((s) => s.status === 'abandoned') || []
      const avgDuration = completed.length > 0
        ? completed.reduce((sum, s) => sum + (s.actual_duration || 0), 0) / completed.length
        : 0

      // Chamar API para ajustes com IA
      const response = await fetch('/api/ai-adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalSessions: allSessions?.length || 0,
          completedSessions: completed.length,
          abandonedSessions: abandoned.length,
          averageDuration: avgDuration,
          studyGoal: profile?.study_goal || '',
          weeklyFrequency: profile?.weekly_frequency || '',
          focusCapacity: profile?.focus_capacity || '',
          bestTime: profile?.best_time || '',
          mainDifficulty: profile?.main_difficulty || '',
          routineStyle: profile?.routine_style || '',
        }),
      })

      if (!response.ok) throw new Error('Erro ao ajustar plano')

      const adjustments = await response.json()

      // Atualizar plano
      if (plan) {
        const { error } = await supabase
          .from('study_plans')
          .update({
            session_duration: adjustments.sessionDuration,
            sessions_per_day: adjustments.sessionsPerDay,
            updated_at: new Date().toISOString(),
          })
          .eq('id', plan.id)

        if (error) throw error
        setAiMessage(adjustments.message)
        loadDashboardData()
      }
    } catch (error) {
      console.error('Erro ao ajustar plano:', error)
      alert('Erro ao ajustar plano. Tente novamente.')
    } finally {
      setAdjusting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu plano...</p>
        </div>
      </div>
    )
  }

  const nextSession = todaySessions.find((s) => s.status === 'pending')
  const completedToday = todaySessions.filter((s) => s.status === 'completed').length
  const progressPercent = weekProgress.total > 0 ? (weekProgress.completed / weekProgress.total) * 100 : 0
  const motivationalMessage = getMotivationalMessage(progressPercent)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FocusStudy</h1>
                <p className="text-sm text-gray-600">Seu plano de estudos</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Seu plano está pronto! 🎯</h2>
          <p className="text-indigo-100">{motivationalMessage}</p>
        </div>

        {/* AI Message */}
        {aiMessage && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-purple-900 mb-1">Ajuste Inteligente</p>
              <p className="text-purple-700 text-sm">{aiMessage}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Next Session Card */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Próxima Sessão</h3>
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>

            {nextSession ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-gray-900">
                      {nextSession.scheduled_time.slice(0, 5)}
                    </p>
                    <p className="text-gray-600">{formatDuration(nextSession.duration_minutes)}</p>
                  </div>
                  <button
                    onClick={() => handleStartSession(nextSession.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Play className="w-5 h-5" />
                    Começar agora
                  </button>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-indigo-900">
                    💡 Dica: Prepare seu material e elimine distrações antes de começar
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">Todas as sessões de hoje foram concluídas!</p>
                <p className="text-sm text-gray-500 mt-1">Parabéns pelo seu progresso 🎉</p>
              </div>
            )}
          </div>

          {/* Week Progress Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Progresso Semanal</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Sessões concluídas</span>
                  <span className="text-sm font-bold text-gray-900">
                    {weekProgress.completed}/{weekProgress.total}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{Math.round(progressPercent)}%</p>
                <p className="text-sm text-gray-600">de conclusão</p>
              </div>
              {streak > 0 && (
                <div className="pt-4 border-t border-gray-200 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-lg font-bold text-gray-900">{streak} dias</p>
                    <p className="text-sm text-gray-600">de sequência</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sessões de Hoje</h3>
          {todaySessions.length > 0 ? (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    session.status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {session.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.scheduled_time.slice(0, 5)}
                      </p>
                      <p className="text-sm text-gray-600">{formatDuration(session.duration_minutes)}</p>
                    </div>
                  </div>
                  {session.status === 'completed' ? (
                    <span className="text-sm font-medium text-green-600">Concluída ✓</span>
                  ) : (
                    <button
                      onClick={() => handleStartSession(session.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
                    >
                      Iniciar
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Nenhuma sessão agendada para hoje</p>
          )}
        </div>

        {/* AI Adjustment Button */}
        <div className="text-center">
          <button
            onClick={handleAdjustPlan}
            disabled={adjusting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            {adjusting ? 'Ajustando...' : 'Ajustar Plano com IA'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            A IA analisará seu progresso e sugerirá melhorias
          </p>
        </div>
      </main>
    </div>
  )
}
