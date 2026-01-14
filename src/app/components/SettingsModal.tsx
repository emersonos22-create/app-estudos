'use client'

import { useState, useEffect } from 'react'
import { X, User, Lock, Download, Trash2, FileText, Sun, Moon, Type, Zap, Bell, BellOff } from 'lucide-react'
import { NotificationSettings, defaultNotificationSettings } from '@/lib/notifications'

type SettingsModalProps = {
  userId: string
  userName: string
  onClose: () => void
  onLogout: () => void
}

export default function SettingsModal({ userId, userName, onClose, onLogout }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'notifications'>('account')
  const [newName, setNewName] = useState(userName)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal')
  const [reducedAnimations, setReducedAnimations] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    // Carregar configurações
    const savedTheme = localStorage.getItem(`theme_${userId}`) as 'light' | 'dark' || 'light'
    const savedFontSize = localStorage.getItem(`font_size_${userId}`) as 'normal' | 'large' || 'normal'
    const savedAnimations = localStorage.getItem(`reduced_animations_${userId}`) === 'true'
    const savedNotifications = localStorage.getItem(`notification_settings_${userId}`)

    setTheme(savedTheme)
    setFontSize(savedFontSize)
    setReducedAnimations(savedAnimations)
    
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications))
    }

    // Aplicar tema
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    document.documentElement.style.fontSize = savedFontSize === 'large' ? '18px' : '16px'
  }, [userId])

  const handleChangeName = () => {
    if (!newName.trim()) return
    localStorage.setItem('ritmo_logged_user_name', newName)
    alert('Nome alterado com sucesso!')
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Preencha todos os campos')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    // Verificar senha atual
    const users = JSON.parse(localStorage.getItem('ritmo_users') || '[]')
    const user = users.find((u: any) => u.id === userId)
    
    if (!user || user.password !== currentPassword) {
      alert('Senha atual incorreta')
      return
    }

    // Atualizar senha
    user.password = newPassword
    localStorage.setItem('ritmo_users', JSON.stringify(users))
    
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    alert('Senha alterada com sucesso!')
  }

  const handleExportCSV = () => {
    const sessions = JSON.parse(localStorage.getItem(`study_sessions_${userId}`) || '[]')
    const completedSessions = sessions.filter((s: any) => s.status === 'completed')

    let csv = 'Data,Horário,Matéria,Duração Planejada (min),Duração Real (min),Status\n'
    completedSessions.forEach((session: any) => {
      csv += `${session.date},${session.time},${session.subject || 'N/A'},${session.duration},${session.actualDuration || session.duration},${session.status}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ritmo-historico-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleExportPDF = () => {
    alert('Exportação em PDF será implementada em breve!')
  }

  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    // Remover todos os dados do usuário
    const users = JSON.parse(localStorage.getItem('ritmo_users') || '[]')
    const updatedUsers = users.filter((u: any) => u.id !== userId)
    localStorage.setItem('ritmo_users', JSON.stringify(updatedUsers))

    // Limpar dados específicos do usuário
    localStorage.removeItem(`user_subjects_${userId}`)
    localStorage.removeItem(`daily_minutes_${userId}`)
    localStorage.removeItem(`study_sessions_${userId}`)
    localStorage.removeItem(`study_streak_${userId}`)
    localStorage.removeItem(`last_study_date_${userId}`)
    localStorage.removeItem(`onboarding_completed_${userId}`)
    localStorage.removeItem(`theme_${userId}`)
    localStorage.removeItem(`font_size_${userId}`)
    localStorage.removeItem(`reduced_animations_${userId}`)
    localStorage.removeItem(`notification_settings_${userId}`)

    alert('Conta excluída com sucesso')
    onLogout()
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem(`theme_${userId}`, newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleFontSizeChange = (newSize: 'normal' | 'large') => {
    setFontSize(newSize)
    localStorage.setItem(`font_size_${userId}`, newSize)
    document.documentElement.style.fontSize = newSize === 'large' ? '18px' : '16px'
  }

  const handleAnimationsChange = (reduced: boolean) => {
    setReducedAnimations(reduced)
    localStorage.setItem(`reduced_animations_${userId}`, reduced.toString())
    if (reduced) {
      document.documentElement.style.setProperty('--animation-duration', '0.01s')
    } else {
      document.documentElement.style.removeProperty('--animation-duration')
    }
  }

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    const updated = { ...notificationSettings, [key]: !notificationSettings[key] }
    setNotificationSettings(updated)
    localStorage.setItem(`notification_settings_${userId}`, JSON.stringify(updated))
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-3 font-medium transition-all ${
              activeTab === 'account'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Conta
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-3 font-medium transition-all ${
              activeTab === 'preferences'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Preferências
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-3 font-medium transition-all ${
              activeTab === 'notifications'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Notificações
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Alterar Nome */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4" />
                  Alterar nome
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={handleChangeName}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              {/* Redefinir Senha */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="w-4 h-4" />
                  Redefinir senha
                </label>
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={handleChangePassword}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                  >
                    Alterar senha
                  </button>
                </div>
              </div>

              {/* Exportar Histórico */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Download className="w-4 h-4" />
                  Exportar histórico
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all"
                  >
                    Exportar CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                  >
                    Exportar PDF
                  </button>
                </div>
              </div>

              {/* Política de Privacidade */}
              <div>
                <button
                  onClick={() => alert('Política de Privacidade:\n\nSeus dados são armazenados localmente no seu navegador e não são compartilhados com terceiros.')}
                  className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Ver política de privacidade
                </button>
              </div>

              {/* Excluir Conta */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                  <Trash2 className="w-4 h-4" />
                  Excluir conta
                </label>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
                >
                  {showDeleteConfirm ? 'Confirmar exclusão' : 'Excluir minha conta'}
                </button>
                {showDeleteConfirm && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    ⚠️ Esta ação é irreversível. Clique novamente para confirmar.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Modo Claro/Escuro */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  Tema
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Sun className="w-5 h-5 mx-auto mb-1" />
                    Claro
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Moon className="w-5 h-5 mx-auto mb-1" />
                    Escuro
                  </button>
                </div>
              </div>

              {/* Tamanho da Fonte */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Type className="w-4 h-4" />
                  Tamanho da fonte
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFontSizeChange('normal')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      fontSize === 'normal'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('large')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      fontSize === 'large'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Grande
                  </button>
                </div>
              </div>

              {/* Animações Reduzidas */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Zap className="w-4 h-4" />
                    Animações reduzidas
                  </span>
                  <button
                    onClick={() => handleAnimationsChange(!reducedAnimations)}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      reducedAnimations ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        reducedAnimations ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Reduz animações para melhor performance
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Configure quais notificações você deseja receber
              </p>

              {/* Lembrete para estudar */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Bell className="w-4 h-4" />
                    Lembrete para estudar
                  </span>
                  <button
                    onClick={() => handleNotificationToggle('studyReminder')}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      notificationSettings.studyReminder ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        notificationSettings.studyReminder ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Receba lembretes quando não estudar por um tempo
                </p>
              </div>

              {/* Aviso de pausa */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Bell className="w-4 h-4" />
                    Aviso de pausa
                  </span>
                  <button
                    onClick={() => handleNotificationToggle('breakReminder')}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      notificationSettings.breakReminder ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        notificationSettings.breakReminder ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Seja avisado 5 minutos antes da pausa
                </p>
              </div>

              {/* Resumo diário */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Bell className="w-4 h-4" />
                    Resumo diário de estudos
                  </span>
                  <button
                    onClick={() => handleNotificationToggle('dailySummary')}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      notificationSettings.dailySummary ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        notificationSettings.dailySummary ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Receba um resumo do seu dia às 20h
                </p>
              </div>

              {/* Resumo semanal */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Bell className="w-4 h-4" />
                    Resumo semanal
                  </span>
                  <button
                    onClick={() => handleNotificationToggle('weeklySummary')}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      notificationSettings.weeklySummary ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        notificationSettings.weeklySummary ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Receba um resumo semanal aos domingos às 18h
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  💡 Para receber notificações, você precisa permitir no seu navegador
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
