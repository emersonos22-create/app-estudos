'use client'

import { Clock, CheckCircle, BookOpen, ChevronRight } from 'lucide-react'

type StudySession = {
  id: string
  date: string
  time: string
  duration: number
  subject?: string
  status: 'pending' | 'completed' | 'skipped'
}

type TodaySessionsPreviewProps = {
  sessions: StudySession[]
  onStartSession: (session: StudySession) => void
}

export default function TodaySessionsPreview({ sessions, onStartSession }: TodaySessionsPreviewProps) {
  const displaySessions = sessions.slice(0, 2)
  const hasMore = sessions.length > 2

  return (
    <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: 'var(--color-card)' }}>
      <h3 className="text-xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
        Sessões de Hoje
      </h3>
      
      {displaySessions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {displaySessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: session.status === 'completed' ? 'var(--color-success)' : 'var(--color-border)'
              }}
            >
              <div className="flex items-center gap-4">
                {session.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                ) : (
                  <Clock className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                )}
                <div>
                  <p className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                    {session.time}
                  </p>
                  <p className="text-base mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {session.duration} min
                    {session.subject && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {session.subject}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {session.status === 'completed' ? (
                <span className="text-base font-medium" style={{ color: 'var(--color-success)' }}>
                  Concluída
                </span>
              ) : (
                <button
                  onClick={() => onStartSession(session)}
                  className="px-6 py-3 rounded-lg text-base font-semibold transition-all hover:opacity-90 text-white shadow-sm"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Iniciar
                </button>
              )}
            </div>
          ))}
          
          {hasMore && (
            <button
              className="flex items-center justify-center gap-2 py-4 text-base font-medium transition-all hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Ver todas as sessões ({sessions.length})
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <p className="text-center py-12 text-lg" style={{ color: 'var(--color-text-muted)' }}>
          Nenhuma sessão agendada
        </p>
      )}
    </div>
  )
}
