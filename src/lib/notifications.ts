// Sistema de notificações do Ritmo

export type NotificationType = 'study_reminder' | 'break_reminder' | 'daily_summary' | 'weekly_summary'

export type NotificationSettings = {
  studyReminder: boolean
  breakReminder: boolean
  dailySummary: boolean
  weeklySummary: boolean
}

export const defaultNotificationSettings: NotificationSettings = {
  studyReminder: true,
  breakReminder: true,
  dailySummary: true,
  weeklySummary: true
}

// Solicitar permissão para notificações
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Enviar notificação
export const sendNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200]
    })
  }
}

// Agendar lembrete para estudar
export const scheduleStudyReminder = (userId: string, settings: NotificationSettings) => {
  if (!settings.studyReminder) return

  // Verificar se já estudou hoje
  const today = new Date().toISOString().split('T')[0]
  const lastStudyDate = localStorage.getItem(`last_study_date_${userId}`)
  
  if (lastStudyDate === today) return

  // Agendar notificação para daqui a 1 hora se não estudou
  setTimeout(() => {
    const stillNotStudied = localStorage.getItem(`last_study_date_${userId}`) !== today
    if (stillNotStudied) {
      sendNotification(
        '📚 Hora de estudar!',
        'Você ainda não iniciou seus estudos hoje. Que tal começar agora?'
      )
    }
  }, 60 * 60 * 1000) // 1 hora
}

// Lembrete de pausa durante estudo
export const scheduleBreakReminder = (durationMinutes: number, settings: NotificationSettings) => {
  if (!settings.breakReminder) return

  // Notificar 5 minutos antes do fim
  const notifyTime = (durationMinutes - 5) * 60 * 1000
  if (notifyTime > 0) {
    setTimeout(() => {
      sendNotification(
        '⏰ Quase na hora da pausa!',
        'Faltam 5 minutos para sua pausa. Prepare-se para descansar!'
      )
    }, notifyTime)
  }
}

// Resumo diário
export const sendDailySummary = (userId: string, settings: NotificationSettings) => {
  if (!settings.dailySummary) return

  const sessions = JSON.parse(localStorage.getItem(`study_sessions_${userId}`) || '[]')
  const today = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter((s: any) => s.date === today && s.status === 'completed')
  
  if (todaySessions.length === 0) return

  const totalMinutes = todaySessions.reduce((sum: number, s: any) => sum + (s.actualDuration || s.duration), 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  sendNotification(
    '📊 Resumo do seu dia',
    `Você estudou ${hours}h ${minutes}min hoje em ${todaySessions.length} sessões. Parabéns! 🎉`
  )
}

// Resumo semanal
export const sendWeeklySummary = (userId: string, settings: NotificationSettings) => {
  if (!settings.weeklySummary) return

  const sessions = JSON.parse(localStorage.getItem(`study_sessions_${userId}`) || '[]')
  const startOfWeek = getStartOfWeek()
  const weekSessions = sessions.filter((s: any) => s.date >= startOfWeek && s.status === 'completed')
  
  if (weekSessions.length === 0) return

  const totalMinutes = weekSessions.reduce((sum: number, s: any) => sum + (s.actualDuration || s.duration), 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  sendNotification(
    '📈 Resumo da semana',
    `Esta semana você estudou ${hours}h ${minutes}min em ${weekSessions.length} sessões. Continue assim! 💪`
  )
}

const getStartOfWeek = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

// Inicializar sistema de notificações
export const initNotifications = async (userId: string) => {
  const hasPermission = await requestNotificationPermission()
  
  if (hasPermission) {
    const settingsStr = localStorage.getItem(`notification_settings_${userId}`)
    const settings: NotificationSettings = settingsStr 
      ? JSON.parse(settingsStr) 
      : defaultNotificationSettings

    // Agendar lembretes
    scheduleStudyReminder(userId, settings)

    // Enviar resumo diário às 20h
    const now = new Date()
    const summaryTime = new Date()
    summaryTime.setHours(20, 0, 0, 0)
    
    if (summaryTime > now) {
      const timeUntilSummary = summaryTime.getTime() - now.getTime()
      setTimeout(() => sendDailySummary(userId, settings), timeUntilSummary)
    }

    // Enviar resumo semanal aos domingos às 18h
    const dayOfWeek = now.getDay()
    if (dayOfWeek === 0) { // Domingo
      const weeklySummaryTime = new Date()
      weeklySummaryTime.setHours(18, 0, 0, 0)
      
      if (weeklySummaryTime > now) {
        const timeUntilWeeklySummary = weeklySummaryTime.getTime() - now.getTime()
        setTimeout(() => sendWeeklySummary(userId, settings), timeUntilWeeklySummary)
      }
    }
  }

  return hasPermission
}
