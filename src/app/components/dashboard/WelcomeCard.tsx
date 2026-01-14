'use client'

type WelcomeCardProps = {
  userName: string
  progressPercent: number
}

export default function WelcomeCard({ userName, progressPercent }: WelcomeCardProps) {
  const getMessage = () => {
    if (progressPercent >= 80) return 'Excelente progresso! Continue assim!'
    if (progressPercent >= 50) return 'Você está no caminho certo!'
    return 'Vamos começar? Cada sessão conta!'
  }

  return (
    <div 
      className="rounded-2xl p-6 text-white" 
      style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
    >
      <h2 className="text-xl md:text-2xl font-bold mb-2">
        {userName}, continue no seu ritmo! 🎯
      </h2>
      <p className="text-sm opacity-90">
        {getMessage()}
      </p>
    </div>
  )
}
