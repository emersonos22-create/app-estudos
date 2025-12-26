import OpenAI from 'openai'

export type BehaviorData = {
  totalSessions: number
  completedSessions: number
  abandonedSessions: number
  averageDuration: number
  studyGoal: string
  weeklyFrequency: string
  focusCapacity: string
  bestTime: string
  mainDifficulty: string
  routineStyle: string
}

export async function getStudyPlanAdjustments(data: BehaviorData) {
  // Instanciar OpenAI apenas em runtime, dentro da função
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  const prompt = `Você é um assistente de organização de estudos. Analise os dados comportamentais do usuário e sugira ajustes simples e práticos no plano de estudos.

Dados do usuário:
- Objetivo: ${data.studyGoal}
- Frequência semanal desejada: ${data.weeklyFrequency}
- Capacidade de foco: ${data.focusCapacity}
- Melhor horário: ${data.bestTime}
- Principal dificuldade: ${data.mainDifficulty}
- Estilo de rotina: ${data.routineStyle}

Dados comportamentais:
- Total de sessões agendadas: ${data.totalSessions}
- Sessões concluídas: ${data.completedSessions}
- Sessões abandonadas: ${data.abandonedSessions}
- Duração média real: ${data.averageDuration} minutos

Forneça sugestões objetivas em formato JSON com esta estrutura:
{
  "sessionDuration": número em minutos,
  "sessionsPerDay": número de sessões,
  "message": "mensagem motivadora e clara para o usuário",
  "adjustments": ["ajuste 1", "ajuste 2", "ajuste 3"]
}

Seja prático, motivador e focado em melhorar a aderência ao plano.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de organização de estudos. Não faça diagnósticos médicos. Foque apenas em organização e planejamento.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    return JSON.parse(content || '{}')
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error)
    throw error
  }
}
