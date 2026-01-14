'use client'

import { TrendingUp, Flame } from 'lucide-react'

type SubjectProgress = {
  name: string
  minutes: number
  color: string
}

type WeekProgressCardProps = {
  weekProgress: { completed: number; total: number }
  streak: number
  subjectProgress: SubjectProgress[]
}

export default function WeekProgressCard({ weekProgress, streak, subjectProgress }: WeekProgressCardProps) {
  const progressPercent = weekProgress.total > 0 ? (weekProgress.completed / weekProgress.total) * 100 : 0

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-card)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Progresso Semanal
        </h3>
        <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
      </div>

      <div className="flex flex-col gap-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Sessões concluídas
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {weekProgress.completed}/{weekProgress.total}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-success)' }}
            />
          </div>
        </div>

        {/* Percentage */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {Math.round(progressPercent)}%
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            de conclusão
          </p>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="pt-4 flex items-center gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <Flame className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {streak} dias
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                de sequência
              </p>
            </div>
          </div>
        )}

        {/* Subject Progress */}
        {subjectProgress.length > 0 && (
          <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Tempo por matéria
            </h4>
            <div className="flex flex-col gap-2">
              {subjectProgress.map((subject, index) => (
                <div key={`progress-${subject.name}-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {subject.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {formatMinutes(subject.minutes)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
