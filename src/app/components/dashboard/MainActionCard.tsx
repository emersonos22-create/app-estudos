'use client'

import { Clock, Play, BookOpen, CheckCircle } from 'lucide-react'

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

type MainActionCardProps = {
  nextSession: StudySession | undefined
  selectedSubject: string
  subjects: Subject[]
  onSubjectChange: (subjectId: string) => void
  onStartSession: (session: StudySession) => void
}

export default function MainActionCard({
  nextSession,
  selectedSubject,
  subjects,
  onSubjectChange,
  onStartSession
}: MainActionCardProps) {
  const sortedSubjects = [...subjects].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
    }
  }

  return (
    <div className="rounded-xl p-10 shadow-md" style={{ backgroundColor: 'var(--color-card)' }}>
      <div className="flex items-center gap-4 mb-8">
        <Clock className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
        <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Próxima Sessão
        </h3>
      </div>

      {subjects.length > 0 && (
        <div className="mb-8">
          <label className="block text-base font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Matéria:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full px-5 py-4 rounded-lg text-base focus:outline-none focus:ring-2 border"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)'
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
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {nextSession.time}
              </p>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                {nextSession.duration} minutos
              </p>
              {selectedSubject && (
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium mt-6" 
                     style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}>
                  <BookOpen className="w-5 h-5" />
                  {subjects.find(s => s.id === selectedSubject)?.name}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onStartSession(nextSession)}
            className="flex items-center justify-center gap-3 px-8 py-5 rounded-lg font-semibold transition-all hover:opacity-90 text-white w-full shadow-sm text-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Play className="w-6 h-6" />
            Começar sessão
          </button>
        </div>
      ) : (
        <div className="text-center py-16">
          <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--color-success)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Todas as sessões concluídas!
          </p>
        </div>
      )}
    </div>
  )
}
