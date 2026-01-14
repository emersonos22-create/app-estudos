'use client'

import { useEffect, useState } from 'react'
import { supabase, StudySessionDetailed } from '@/lib/supabase'
import { Calendar, Clock, TrendingUp, Award, X } from 'lucide-react'

type StudyHistoryProps = {
  userId: string
  onClose: () => void
}

export default function StudyHistory({ userId, onClose }: StudyHistoryProps) {
  const [sessions, setSessions] = useState<StudySessionDetailed[]>([])
  const [loading, setLoading] = useState(true)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [weekMinutes, setWeekMinutes] = useState(0)
  const [avgProductivity, setAvgProductivity] = useState(0)

  useEffect(() => {
    loadHistory()
  }, [userId])

  const loadHistory = async () => {
    try {
      // Carregar todas as sessões completadas
      const { data, error } = await supabase
        .from('study_sessions_detailed')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setSessions(data || [])

      // Calcular estatísticas
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const todaySessions = data?.filter(s => s.completed_at?.startsWith(today)) || []
      const weekSessions = data?.filter(s => s.completed_at && s.completed_at >= weekAgo) || []

      const todayTotal = todaySessions.reduce((sum, s) => sum + (s.total_work_minutes || 0), 0)
      const weekTotal = weekSessions.reduce((sum, s) => sum + (s.total_work_minutes || 0), 0)

      setTodayMinutes(todayTotal)
      setWeekMinutes(weekTotal)

      // Calcular média de produtividade
      const withRating = data?.filter(s => s.productivity_rating) || []
      if (withRating.length > 0) {
        const avg = withRating.reduce((sum, s) => sum + (s.productivity_rating || 0), 0) / withRating.length
        setAvgProductivity(Math.round(avg * 10) / 10)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando histórico...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Histórico de Estudos</h2>
            <p className="text-sm text-gray-600">Acompanhe seu progresso e desempenho</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(todayMinutes)}</p>
                <p className="text-xs text-gray-600">Hoje</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(weekMinutes)}</p>
                <p className="text-xs text-gray-600">Últimos 7 dias</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgProductivity}/5</p>
                <p className="text-xs text-gray-600">Produtividade média</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma sessão registrada ainda</p>
              <p className="text-sm text-gray-500 mt-1">Complete uma sessão para ver seu histórico</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {session.subject_name && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                            {session.subject_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {session.completed_at && formatDate(session.completed_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(session.total_work_minutes)}
                        </span>
                        <span>{session.cycles_completed} ciclos</span>
                        <span className="text-xs">
                          {session.work_duration}/{session.break_duration} min
                        </span>
                      </div>

                      {session.feedback_notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          &quot;{session.feedback_notes}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {session.productivity_rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < session.productivity_rating!
                                  ? 'bg-yellow-400'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      {session.had_distractions && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          Com distrações
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <p className="text-xs text-gray-500 text-center">
            💡 Continue estudando para melhorar suas estatísticas
          </p>
        </div>
      </div>
    </div>
  )
}
