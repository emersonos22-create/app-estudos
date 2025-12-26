import { supabase, StudyPlan } from './supabase'

/**
 * Gera sessões de estudo para a semana atual baseado no plano ativo
 */
export async function generateWeeklySessions(userId: string, plan: StudyPlan) {
  try {
    // Pegar data de início da semana (segunda-feira)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)

    // Mapear dias da semana
    const dayMap: Record<string, number> = {
      seg: 1,
      ter: 2,
      qua: 3,
      qui: 4,
      sex: 5,
      sab: 6,
      dom: 0,
    }

    const sessions = []

    // Para cada dia de estudo configurado
    for (const day of plan.study_days) {
      const dayNumber = dayMap[day]
      const sessionDate = new Date(monday)
      sessionDate.setDate(monday.getDate() + (dayNumber === 0 ? 6 : dayNumber - 1))

      // Criar sessões para o dia
      for (let i = 0; i < plan.sessions_per_day; i++) {
        const time = plan.preferred_times[i] || plan.preferred_times[0]
        
        sessions.push({
          user_id: userId,
          plan_id: plan.id,
          scheduled_date: sessionDate.toISOString().split('T')[0],
          scheduled_time: time,
          duration_minutes: plan.session_duration,
          status: 'pending',
        })
      }
    }

    // Verificar se já existem sessões para esta semana
    const { data: existingSessions } = await supabase
      .from('study_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('scheduled_date', monday.toISOString().split('T')[0])

    // Se não existem sessões, criar
    if (!existingSessions || existingSessions.length === 0) {
      const { error } = await supabase
        .from('study_sessions')
        .insert(sessions)

      if (error) throw error
      return { success: true, created: sessions.length }
    }

    return { success: true, created: 0, message: 'Sessões já existem para esta semana' }
  } catch (error) {
    console.error('Erro ao gerar sessões:', error)
    throw error
  }
}

/**
 * Formata duração em minutos para texto legível
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

/**
 * Calcula streak (dias consecutivos de estudo)
 */
export async function calculateStreak(userId: string): Promise<number> {
  try {
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('scheduled_date, status')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('scheduled_date', { ascending: false })

    if (!sessions || sessions.length === 0) return 0

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const session of sessions) {
      const sessionDate = new Date(session.scheduled_date)
      sessionDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === streak) {
        streak++
      } else if (diffDays > streak) {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('Erro ao calcular streak:', error)
    return 0
  }
}

/**
 * Retorna mensagem motivacional baseada no progresso
 */
export function getMotivationalMessage(progressPercent: number): string {
  if (progressPercent === 0) {
    return 'Vamos começar! O primeiro passo é sempre o mais importante. 🚀'
  } else if (progressPercent < 25) {
    return 'Ótimo começo! Continue assim e você vai longe. 💪'
  } else if (progressPercent < 50) {
    return 'Você está no caminho certo! Mantenha o ritmo. 🎯'
  } else if (progressPercent < 75) {
    return 'Mais da metade concluída! Você está arrasando! 🔥'
  } else if (progressPercent < 100) {
    return 'Quase lá! Mais um pouco de esforço e você completa a semana. 🌟'
  } else {
    return 'Parabéns! Você completou todas as sessões da semana! 🎉'
  }
}
