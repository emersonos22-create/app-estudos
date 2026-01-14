'use client'

import { TrendingUp, Flame } from 'lucide-react'

type ProgressSummaryProps = {
  weekProgress: { completed: number; total: number }
  streak: number
}

export default function ProgressSummary({ weekProgress, streak }: ProgressSummaryProps) {
  const progressPercent = weekProgress.total > 0 ? (weekProgress.completed / weekProgress.total) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Progresso Semanal */}
      <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: 'var(--color-card)' }}>
        <div className="flex items-center gap-4 mb-6">
          <TrendingUp className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Progresso Semanal
          </h3>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
              Sessões concluídas
            </span>
            <span className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {weekProgress.completed}/{weekProgress.total}
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-success)' }}
            />
          </div>
        </div>
        
        <p className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {Math.round(progressPercent)}%
        </p>
      </div>

      {/* Sequência */}
      {streak > 0 && (
        <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: 'var(--color-card)' }}>
          <div className="flex items-center gap-4 mb-6">
            <Flame className="w-6 h-6" style={{ color: 'var(--color-warning)' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Sequência
            </h3>
          </div>
          
          <p className="text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            {streak} dias
          </p>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Continue assim!
          </p>
        </div>
      )}
    </div>
  )
}
