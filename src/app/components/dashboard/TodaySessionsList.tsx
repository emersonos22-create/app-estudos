'use client'

import { Clock, CheckCircle, BookOpen } from 'lucide-react'

type StudySession = {
  id: string
  date: string
  time: string
  duration: number
  subject?: string
  status: 'pending' | 'completed' | 'skipped'
}

type TodaySessionsListProps = {
  sessions: StudySession[]
  onStartSession: (session: StudySession) => void
}

export default function TodaySessionsList({ sessions, onStartSession }: TodaySessionsListProps) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-card)' }}>
      <h3 className="text-base font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Sessões de Hoje
      </h3>
      
      {sessions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded-lg transition-all gap-3"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                border: session.status === 'completed' 
                  ? '1px solid var(--color-success)' 
                  : '1px solid var(--color-border)'
              }}
            >
              <div className="flex items-center gap-3">
                {session.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                ) : (
                  <Clock className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                )}
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                    {session.time}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {session.duration} minutos
                  </p>
                  {session.subject && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                      <BookOpen className="w-3 h-3" />
                      {session.subject}
                    </p>
                  )}
                </div>
              </div>
              
              {session.status === 'completed' ? (
                <span className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>
                  Concluída ✓
                </span>
              ) : (
                <button
                  onClick={() => onStartSession(session)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all text-white w-full md:w-auto"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Iniciar
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Nenhuma sessão agendada para hoje
        </p>
      )}
    </div>
  )
}
