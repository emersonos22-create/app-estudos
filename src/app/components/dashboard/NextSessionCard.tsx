'use client'

import { Clock, Play, CheckCircle, BookOpen } from 'lucide-react'

type StudySession = {
  id: string
  date: string
  time: string
  duration: number
  subject?: string
  status: 'pending' | 'completed' | 'skipped'
}

type Subject = {
  id: string
  name: string
  color: string
  priority: 'high' | 'medium' | 'low'
}

type NextSessionCardProps = {
  nextSession: StudySession | undefined
  subjects: Subject[]
  selectedSubject: string
  onSubjectChange: (subjectId: string) => void
  onStartSession: (session: StudySession) => void
}

export default function NextSessionCard({
  nextSession,
  subjects,
  selectedSubject,
  onSubjectChange,
  onStartSession
}: NextSessionCardProps) {
  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
    }
  }

  const sortedSubjects = [...subjects].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-card)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Próxima Sessão
        </h3>
        <Clock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
      </div>

      {subjects.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Selecione a matéria:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <option key="empty-option" value="">Escolha uma matéria...</option>
            {sortedSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} - {getPriorityLabel(subject.priority)}
              </option>
            ))}
          </select>
        </div>
      )}

      {nextSession ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex-1">
              <p className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {nextSession.time}
              </p>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                {nextSession.duration} minutos
              </p>
              {selectedSubject && (
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium" 
                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}
                >
                  <BookOpen className="w-3 h-3" />
                  {subjects.find(s => s.id === selectedSubject)?.name}
                </div>
              )}
            </div>
            <button
              onClick={() => onStartSession(nextSession)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all text-white text-sm w-full md:w-auto justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Play className="w-4 h-4" />
              Começar agora
            </button>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              💡 Dica: Prepare seu material e elimine distrações antes de começar
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Todas as sessões de hoje foram concluídas!
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Parabéns pelo seu progresso 🎉
          </p>
        </div>
      )}
    </div>
  )
}
