'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Calendar, Clock, TrendingUp, Play, CheckCircle, Sparkles, Flame, BookOpen, Plus, X, Settings, Moon, Sun, Type, Zap, Bell, Download, FileText, User, Lock, Trash2 } from 'lucide-react'
import StudyTimer from './StudyTimer'

type DashboardProps = {
  userId: string
  userName: string
}

type StudySession = {
  id: string
  date: string
  time: string
  duration: number
  subject?: string
  status: 'pending' | 'completed' | 'skipped'
  completedAt?: string
  actualDuration?: number
}

type Subject = {
  id: string
  name: string
  color: string
}

export default function DashboardPage({ userId, userName: initialUserName }: DashboardProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [dailyMinutes, setDailyMinutes] = useState(120)
  const [todaySessions, setTodaySessions] = useState<StudySession[]>([])
  const [weekProgress, setWeekProgress] = useState({ completed: 0, total: 0 })
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<StudySession | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [showSubjectsManager, setShowSubjectsManager] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [showSubjectPopup, setShowSubjectPopup] = useState(false)
  const [pendingSession, setPendingSession] = useState<StudySession | null>(null)

  // Configurações
  const [showSettings, setShowSettings] = useState(false)
  const [userName, setUserName] = useState(initialUserName)
  const [editingName, setEditingName] = useState(false)
  const [tempUserName, setTempUserName] = useState(initialUserName)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal')
  const [reduceAnimations, setReduceAnimations] = useState(false)
  const [notifications, setNotifications] = useState({
    studyReminder: true,
    breakReminder: true,
    dailySummary: false,
    weeklySummary: false
  })
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)

  // Modal de redefinição de senha
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Proteger o Dashboard contra acesso sem login
  useEffect(() => {
    const loggedUser = localStorage.getItem('ritmo_logged_user')

    if (!loggedUser) {
      router.replace('/')
    }
  }, [router])

  // Carregar configurações
  useEffect(() => {
    const savedTheme = localStorage.getItem('ritmo_theme') as 'light' | 'dark' || 'light'
    const savedFontSize = localStorage.getItem('ritmo_font_size') as 'normal' | 'large' || 'normal'
    const savedReduceAnimations = localStorage.getItem('ritmo_reduce_animations') === 'true'
    const savedNotifications = localStorage.getItem('ritmo_notifications')

    setTheme(savedTheme)
    setFontSize(savedFontSize)
    setReduceAnimations(savedReduceAnimations)
    
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }

    // Aplicar tema ao carregar
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = () => {
    try {
      // Carregar dados do localStorage específicos do usuário
      const savedSubjects = localStorage.getItem(`user_subjects_${userId}`)
      const savedMinutes = localStorage.getItem(`daily_minutes_${userId}`)
      const savedSessions = localStorage.getItem(`study_sessions_${userId}`)
      const savedStreak = localStorage.getItem(`study_streak_${userId}`)

      if (savedSubjects) {
        try {
          const subjectsData = JSON.parse(savedSubjects)
          const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4', '#84CC16', '#F97316']
          
          // Verificar se é array de strings ou array de objetos
          let subjectsWithIds: Subject[]
          if (Array.isArray(subjectsData) && subjectsData.length > 0) {
            if (typeof subjectsData[0] === 'string') {
              // Array de strings (formato antigo)
              subjectsWithIds = subjectsData.map((name: string, index: number) => ({
                id: `subject-${index}`,
                name,
                color: colors[index % colors.length]
              }))
            } else {
              // Array de objetos - garantir que tem apenas id, name, color
              subjectsWithIds = subjectsData.map((subject: any, index: number) => ({
                id: subject.id || `subject-${index}`,
                name: String(subject.name || ''),
                color: subject.color || colors[index % colors.length]
              }))
            }
            setSubjects(subjectsWithIds)
          }
        } catch (error) {
          console.error('Erro ao processar matérias:', error)
          setSubjects([])
        }
      }
      
      if (savedMinutes) setDailyMinutes(Number(savedMinutes))
      if (savedStreak) setStreak(Number(savedStreak))

      if (savedSessions) {
        const allSessions: StudySession[] = JSON.parse(savedSessions)
        const today = new Date().toISOString().split('T')[0]
        const todaySessionsFiltered = allSessions.filter(s => s.date === today)

        if (todaySessionsFiltered.length === 0) {
          generateInitialSessions()
          return
        }

        setTodaySessions(todaySessionsFiltered)

        const startOfWeek = getStartOfWeek()
        const weekSessions = allSessions.filter(s => s.date >= startOfWeek)
        const completed = weekSessions.filter(s => s.status === 'completed').length

        setWeekProgress({ completed, total: weekSessions.length })
      } else {
        generateInitialSessions()
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInitialSessions = () => {
    const today = new Date().toISOString().split('T')[0]
    const sessionsPerDay = Math.floor(dailyMinutes / 50) // Sessões de 50 minutos
    const newSessions: StudySession[] = []

    for (let i = 0; i < sessionsPerDay; i++) {
      const hour = 9 + (i * 2) // Começar às 9h, com intervalo de 2h
      const time = `${hour.toString().padStart(2, '0')}:00`
      
      newSessions.push({
        id: `${today}-${i}`,
        date: today,
        time,
        duration: 50,
        status: 'pending'
      })
    }

    setTodaySessions(newSessions)
    localStorage.setItem(`study_sessions_${userId}`, JSON.stringify(newSessions))
  }

  const getStartOfWeek = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const handleStartSession = (session: StudySession) => {
    // Se não tem matéria selecionada e existem matérias cadastradas, mostrar popup
    if (!selectedSubject && subjects.length > 0) {
      setPendingSession(session)
      setShowSubjectPopup(true)
      return
    }
    
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || ''
    setActiveSession({ ...session, subject: subjectName })
  }

  const handleConfirmSubjectAndStart = () => {
    if (!selectedSubject || !pendingSession) return
    
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || ''
    setActiveSession({ ...pendingSession, subject: subjectName })
    setShowSubjectPopup(false)
    setPendingSession(null)
  }

  const handleCompleteSession = (actualMinutes: number) => {
    if (!activeSession) return

    try {
      // Atualizar sessão
      const updatedSession: StudySession = {
        ...activeSession,
        status: 'completed',
        completedAt: new Date().toISOString(),
        actualDuration: actualMinutes
      }

      // Atualizar lista de sessões específica do usuário
      const allSessions = JSON.parse(localStorage.getItem(`study_sessions_${userId}`) || '[]')
      const updatedSessions = allSessions.map((s: StudySession) => 
        s.id === activeSession.id ? updatedSession : s
      )
      localStorage.setItem(`study_sessions_${userId}`, JSON.stringify(updatedSessions))

      // Atualizar streak
      updateStreak()

      setActiveSession(null)
      setSelectedSubject('')
      loadDashboardData()
    } catch (error) {
      console.error('Erro ao completar sessão:', error)
    }
  }

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0]
    const lastStudyDate = localStorage.getItem(`last_study_date_${userId}`)
    
    if (lastStudyDate === today) {
      return // Já estudou hoje
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newStreak = 1
    if (lastStudyDate === yesterdayStr) {
      newStreak = streak + 1
    }

    setStreak(newStreak)
    localStorage.setItem(`study_streak_${userId}`, newStreak.toString())
    localStorage.setItem(`last_study_date_${userId}`, today)
  }

  const handleCancelSession = () => {
    setActiveSession(null)
    setSelectedSubject('')
  }

  const handleLogout = () => {
    // Limpar dados de sessão
    localStorage.removeItem('ritmo_logged_user')
    localStorage.removeItem('ritmo_logged_user_name')

    // Redirecionar imediatamente para o login
    router.replace('/')
  }

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return

    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4', '#84CC16', '#F97316']
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name: newSubjectName.trim(),
      color: colors[subjects.length % colors.length]
    }

    const updatedSubjects = [...subjects, newSubject]
    setSubjects(updatedSubjects)
    
    // Salvar no localStorage específico do usuário (apenas nomes para compatibilidade)
    const subjectNames = updatedSubjects.map(s => s.name)
    localStorage.setItem(`user_subjects_${userId}`, JSON.stringify(subjectNames))
    
    setNewSubjectName('')
  }

  const handleDeleteSubject = (subjectId: string) => {
    const updatedSubjects = subjects.filter(s => s.id !== subjectId)
    setSubjects(updatedSubjects)
    
    // Salvar no localStorage específico do usuário
    const subjectNames = updatedSubjects.map(s => s.name)
    localStorage.setItem(`user_subjects_${userId}`, JSON.stringify(subjectNames))
  }

  // Funções de configurações
  const handleSaveUserName = () => {
    if (!tempUserName.trim()) return
    
    setUserName(tempUserName.trim())
    localStorage.setItem('ritmo_logged_user_name', tempUserName.trim())
    setEditingName(false)
  }

  const handleResetPassword = () => {
    setShowResetPasswordModal(true)
  }

  const handleConfirmResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem.')
      return
    }

    if (newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    // Simulação de redefinição de senha
    alert('✅ Senha redefinida com sucesso!\n\nEsta é uma simulação. Em um app real, a senha seria atualizada no servidor.')
    
    // Limpar campos e fechar modal
    setNewPassword('')
    setConfirmPassword('')
    setShowResetPasswordModal(false)
  }

  const handleCancelResetPassword = () => {
    setNewPassword('')
    setConfirmPassword('')
    setShowResetPasswordModal(false)
  }

  const handleDeleteAccount = () => {
    const confirm1 = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')
    if (!confirm1) return

    const confirm2 = window.confirm('ÚLTIMA CONFIRMAÇÃO: Todos os seus dados serão perdidos permanentemente. Continuar?')
    if (!confirm2) return

    // Limpar TODO o localStorage
    localStorage.clear()
    window.location.href = '/'
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('ritmo_theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleFontSizeChange = (newSize: 'normal' | 'large') => {
    setFontSize(newSize)
    localStorage.setItem('ritmo_font_size', newSize)
    
    if (newSize === 'large') {
      document.documentElement.classList.add('text-lg')
    } else {
      document.documentElement.classList.remove('text-lg')
    }
  }

  const handleReduceAnimationsChange = (value: boolean) => {
    setReduceAnimations(value)
    localStorage.setItem('ritmo_reduce_animations', value.toString())
    
    if (value) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] }
    setNotifications(newNotifications)
    localStorage.setItem('ritmo_notifications', JSON.stringify(newNotifications))
  }

  const handleExportData = () => {
    try {
      const allSessions = JSON.parse(
        localStorage.getItem(`study_sessions_${userId}`) || '[]'
      )

      if (allSessions.length === 0) {
        alert('Nenhum dado para exportar.')
        return
      }

      let csv = 'Data,Horário,Duração (min),Matéria,Status,Duração Real (min)\n'

      allSessions.forEach((session: StudySession) => {
        csv += `${session.date},${session.time},${session.duration},${session.subject || 'Não especificada'},${session.status},${session.actualDuration || '-'}\n`
      })

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)

      window.open(url)

      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error(error)
      alert('Erro ao exportar histórico.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando seu plano...</p>
        </div>
      </div>
    )
  }

  const nextSession = todaySessions.find((s) => s.status === 'pending')
  const completedToday = todaySessions.filter((s) => s.status === 'completed').length
  const progressPercent = weekProgress.total > 0 ? (weekProgress.completed / weekProgress.total) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Timer Modal */}
      {activeSession && (
        <StudyTimer
          sessionId={activeSession.id}
          durationMinutes={activeSession.duration}
          onComplete={handleCompleteSession}
          onCancel={handleCancelSession}
          userId={userId}
          subjectName={activeSession.subject}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Redefinir senha</h3>
              <button
                onClick={handleCancelResetPassword}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente sua nova senha"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancelResetPassword}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmResetPassword}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Drawer */}
      {showSettings && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setShowSettings(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto border-l border-gray-200 dark:border-gray-800">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configurações</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conta */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Conta
                </h3>
                
                <div className="space-y-3">
                  {/* Editar nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome
                    </label>
                    {editingName ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tempUserName}
                          onChange={(e) => setTempUserName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          onClick={handleSaveUserName}
                          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-gray-100">{userName}</span>
                        <button
                          onClick={() => {
                            setEditingName(true)
                            setTempUserName(userName)
                          }}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Redefinir senha */}
                  <button
                    onClick={handleResetPassword}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Lock className="w-4 h-4" />
                      Redefinir senha
                    </span>
                  </button>

                  {/* Excluir conta */}
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all text-red-600 dark:text-red-400"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Excluir conta
                    </span>
                  </button>
                </div>
              </div>

              {/* Aparência */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Aparência
                </h3>
                
                <div className="space-y-3">
                  {/* Tema */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100">Modo escuro</span>
                    <button
                      onClick={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        theme === 'dark' 
                          ? 'bg-indigo-600 dark:bg-indigo-500' 
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform flex items-center justify-center ${
                        theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                      }`}>
                        {theme === 'dark' ? (
                          <Moon className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <Sun className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Tamanho da fonte */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100">Tamanho da fonte</span>
                    <select
                      value={fontSize}
                      onChange={(e) => handleFontSizeChange(e.target.value as 'normal' | 'large')}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  {/* Reduzir animações */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100">Reduzir animações</span>
                    <button
                      onClick={() => handleReduceAnimationsChange(!reduceAnimations)}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        reduceAnimations 
                          ? 'bg-indigo-600 dark:bg-indigo-500' 
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        reduceAnimations ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notificações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações
                </h3>
                
                <div className="space-y-3">
                  {/* Lembrete para estudar */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100">Lembrete para estudar</span>
                    <button
                      onClick={() => handleNotificationChange('studyReminder')}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        notifications.studyReminder 
                          ? 'bg-indigo-600 dark:bg-indigo-500' 
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications.studyReminder ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Aviso de pausa */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100">Aviso de pausa</span>
                    <button
                      onClick={() => handleNotificationChange('breakReminder')}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        notifications.breakReminder 
                          ? 'bg-indigo-600 dark:bg-indigo-500' 
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications.breakReminder ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Resumo diário */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100">Resumo diário</span>
                    <button
                      onClick={() => handleNotificationChange('dailySummary')}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        notifications.dailySummary 
                          ? 'bg-indigo-600 dark:bg-indigo-500' 
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications.dailySummary ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Resumo semanal */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100">Resumo semanal</span>
                    <button
                      onClick={() => handleNotificationChange('weeklySummary')}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        notifications.weeklySummary 
                          ? 'bg-indigo-600 dark:bg-indigo-500' 
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications.weeklySummary ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dados */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Dados
                </h3>
                
                <div className="space-y-3">
                  {/* Exportar histórico */}
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Download className="w-4 h-4" />
                      Exportar histórico (CSV)
                    </span>
                  </button>

                  {/* Política de privacidade */}
                  <button
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <span className="text-gray-900 dark:text-gray-100">Política de privacidade</span>
                  </button>
                </div>
              </div>

              {/* Sessão */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Sessão
                </h3>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-all font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da conta
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Política de Privacidade</h3>
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                <strong className="text-gray-900 dark:text-gray-100">1. Coleta de Dados</strong><br />
                O Ritmo armazena seus dados localmente no seu navegador usando localStorage. Nenhum dado é enviado para servidores externos.
              </p>
              
              <p>
                <strong className="text-gray-900 dark:text-gray-100">2. Uso de Dados</strong><br />
                Seus dados são utilizados exclusivamente para fornecer funcionalidades do aplicativo, como histórico de estudos, configurações e progresso.
              </p>
              
              <p>
                <strong className="text-gray-900 dark:text-gray-100">3. Compartilhamento</strong><br />
                Seus dados nunca são compartilhados com terceiros. Tudo permanece no seu dispositivo.
              </p>
              
              <p>
                <strong className="text-gray-900 dark:text-gray-100">4. Segurança</strong><br />
                Como os dados são armazenados localmente, você é responsável pela segurança do seu dispositivo.
              </p>
              
              <p>
                <strong className="text-gray-900 dark:text-gray-100">5. Seus Direitos</strong><br />
                Você pode exportar ou excluir seus dados a qualquer momento através das configurações do aplicativo.
              </p>
            </div>

            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="w-full mt-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Subject Selection Popup */}
      {showSubjectPopup && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Escolha a matéria</h3>
              <button
                onClick={() => {
                  setShowSubjectPopup(false)
                  setPendingSession(null)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Selecione qual matéria você vai estudar nesta sessão:
            </p>

            <div className="mb-6">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none text-lg"
              >
                <option value="">Escolha uma matéria...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleConfirmSubjectAndStart}
              disabled={!selectedSubject}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Começar sessão
            </button>
          </div>
        </div>
      )}

      {/* Subjects Manager Modal */}
      {showSubjectsManager && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gerenciar Matérias</h3>
              <button
                onClick={() => setShowSubjectsManager(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  placeholder="Nome da matéria"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleAddSubject}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {subjects.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma matéria cadastrada</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ritmo</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Seu plano de estudos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Configurações</span>
              </button>
              <button
                onClick={() => setShowSubjectsManager(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline">Matérias</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-xl transition-colors duration-300">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{userName}, continue no seu ritmo! 🎯</h2>
          <p className="text-indigo-100 dark:text-indigo-200">
            {progressPercent >= 80 
              ? 'Excelente progresso! Continue assim!' 
              : progressPercent >= 50 
              ? 'Você está no caminho certo!' 
              : 'Vamos começar? Cada sessão conta!'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Next Session Card */}
          <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Próxima Sessão</h3>
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            {/* Seletor de Matéria */}
            {subjects.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecione a matéria para estudar:
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Escolha uma matéria...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {nextSession ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {nextSession.time}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">{nextSession.duration} minutos</p>
                    {selectedSubject && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium">
                        <BookOpen className="w-4 h-4" />
                        {subjects.find(s => s.id === selectedSubject)?.name || ''}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleStartSession(nextSession)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Play className="w-5 h-5" />
                    Começar agora
                  </button>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <p className="text-sm text-indigo-900 dark:text-indigo-300">
                    💡 Dica: Prepare seu material e elimine distrações antes de começar
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Todas as sessões de hoje foram concluídas!</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Parabéns pelo seu progresso 🎉</p>
              </div>
            )}
          </div>

          {/* Week Progress Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Progresso Semanal</h3>
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sessões concluídas</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {weekProgress.completed}/{weekProgress.total}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(progressPercent)}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">de conclusão</p>
              </div>
              {streak > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{streak} dias</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">de sequência</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Sessões de Hoje</h3>
          {todaySessions.length > 0 ? (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    session.status === 'completed'
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {session.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{session.time}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{session.duration} minutos</p>
                      {session.subject && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {session.subject}
                        </p>
                      )}
                    </div>
                  </div>
                  {session.status === 'completed' ? (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Concluída ✓</span>
                  ) : (
                    <button
                      onClick={() => handleStartSession(session)}
                      className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
                    >
                      Iniciar
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma sessão agendada para hoje</p>
          )}
        </div>
      </main>
    </div>
  )
}
