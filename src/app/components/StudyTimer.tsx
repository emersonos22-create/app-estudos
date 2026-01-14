'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, Pause, CheckCircle, X, Coffee, Brain, Volume2, VolumeX, BookOpen } from 'lucide-react'

type Subject = {
  id: string
  name: string
  color: string
}

type StudyTimerProps = {
  onComplete: (actualMinutes: number, feedback?: FeedbackData, subjectId?: string) => void
  onCancel: () => void
}

type FeedbackData = {
  productivity_rating: number
  had_distractions: boolean
  feedback_notes?: string
}

type TimerPhase = 'work' | 'break'

type PomodoroPreset = {
  name: string
  work: number
  break: number
  description: string
}

const POMODORO_PRESETS: PomodoroPreset[] = [
  { name: 'Clássico', work: 25, break: 5, description: 'Técnica Pomodoro tradicional' },
  { name: 'Estendido', work: 50, break: 10, description: 'Para sessões mais longas' },
  { name: 'Curto', work: 15, break: 3, description: 'Para tarefas rápidas' },
  { name: 'Intenso', work: 90, break: 20, description: 'Deep work' },
]

export default function StudyTimer({ onComplete, onCancel }: StudyTimerProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [preset, setPreset] = useState(POMODORO_PRESETS[0])
  const [workMinutes, setWorkMinutes] = useState(preset.work)
  const [breakMinutes, setBreakMinutes] = useState(preset.break)
  const [phase, setPhase] = useState<TimerPhase>('work')
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    productivity_rating: 3,
    had_distractions: false,
    feedback_notes: ''
  })
  const [sessionStarted, setSessionStarted] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentDuration = phase === 'work' ? workMinutes : breakMinutes
  const targetSeconds = currentDuration * 60
  const progressPercent = Math.min((elapsedSeconds / targetSeconds) * 100, 100)
  const isComplete = elapsedSeconds >= targetSeconds

  useEffect(() => {
    // Carregar matérias do localStorage
    const saved = localStorage.getItem('ritmo_subjects')
    if (saved) {
      setSubjects(JSON.parse(saved))
    }

    // Criar elemento de áudio para notificações
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8LJnHgU2jdXvyoU0CRxru+vopVITC0mi4PGxaB8GM5DT8cmFNQkbbLvq6aVSEwtJouDxsWgfBjOQ0/HJhTUJG2y76umlUhMLSaLg8bFoHwYzkNPxyYU1CRtsu+rppVITC0mi4PGxaB8GM5DT8cmFNQkbbLvq6aVSEwtJouDxsWgfBjOQ0/HJhTUJG2y76umlUhMLSaLg8bFoHwYzkNPxyYU1')
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (isRunning && !isComplete) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, isComplete])

  useEffect(() => {
    if (isComplete && isRunning) {
      handlePhaseComplete()
    }
  }, [isComplete, isRunning])

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Erro ao tocar som:', e))
    }
  }

  const handlePhaseComplete = async () => {
    playSound()
    setIsRunning(false)

    if (phase === 'work') {
      const newCycles = cyclesCompleted + 1
      setCyclesCompleted(newCycles)

      // Mostrar feedback após 2 ciclos completos
      if (newCycles >= 2) {
        setShowFeedback(true)
      } else {
        // Iniciar pausa automaticamente
        setPhase('break')
        setElapsedSeconds(0)
        setTimeout(() => setIsRunning(true), 1000)
      }
    } else {
      // Fim da pausa, voltar ao trabalho
      setPhase('work')
      setElapsedSeconds(0)
      setTimeout(() => setIsRunning(true), 1000)
    }
  }

  const handleStart = async () => {
    if (!sessionStarted) {
      setSessionStarted(true)
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handlePresetChange = (presetIndex: number) => {
    const newPreset = POMODORO_PRESETS[presetIndex]
    setPreset(newPreset)
    setWorkMinutes(newPreset.work)
    setBreakMinutes(newPreset.break)
    setElapsedSeconds(0)
    setIsRunning(false)
  }

  const handleCompleteFeedback = async () => {
    const totalMinutes = cyclesCompleted * workMinutes
    onComplete(totalMinutes, feedback, selectedSubject)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds)
  const selectedSubjectData = subjects.find(s => s.id === selectedSubject)

  if (showFeedback) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sessão Concluída!</h3>
            <p className="text-gray-600">
              Você completou {cyclesCompleted} ciclos ({cyclesCompleted * workMinutes} minutos de estudo)
            </p>
            {selectedSubjectData && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedSubjectData.color }}
                />
                <span className="text-sm text-gray-600">{selectedSubjectData.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Produtividade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Como foi sua produtividade?
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFeedback({ ...feedback, productivity_rating: rating })}
                    className={`w-12 h-12 rounded-full font-bold transition-all ${
                      feedback.productivity_rating === rating
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-110'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                <span>Baixa</span>
                <span>Alta</span>
              </div>
            </div>

            {/* Distrações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Teve muita distração?
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFeedback({ ...feedback, had_distractions: false })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    !feedback.had_distractions
                      ? 'bg-green-100 text-green-700 border-2 border-green-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Não
                </button>
                <button
                  onClick={() => setFeedback({ ...feedback, had_distractions: true })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    feedback.had_distractions
                      ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sim
                </button>
              </div>
            </div>

            {/* Notas opcionais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={feedback.feedback_notes}
                onChange={(e) => setFeedback({ ...feedback, feedback_notes: e.target.value })}
                placeholder="Como foi a sessão? O que pode melhorar?"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleCompleteFeedback}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              Finalizar Sessão
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Subject Selection */}
        {!sessionStarted && subjects.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Matéria (opcional)
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Selecione uma matéria</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Preset Selection */}
        {!sessionStarted && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolha seu ciclo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {POMODORO_PRESETS.map((p, index) => (
                <button
                  key={p.name}
                  onClick={() => handlePresetChange(index)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    preset.name === p.name
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-600">{p.work}/{p.break} min</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase Indicator */}
        <div className="text-center mb-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            phase === 'work' 
              ? 'bg-indigo-100 text-indigo-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {phase === 'work' ? (
              <>
                <Brain className="w-4 h-4" />
                <span className="font-medium">Foco</span>
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4" />
                <span className="font-medium">Pausa</span>
              </>
            )}
          </div>
          {selectedSubjectData && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedSubjectData.color }}
              />
              <p className="text-sm text-gray-600">{selectedSubjectData.name}</p>
            </div>
          )}
        </div>

        {/* Timer Display */}
        <div className="relative inline-block w-full mb-6">
          <svg className="w-full h-64" viewBox="0 0 200 200">
            {/* Background Circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
              transform="rotate(-90 100 100)"
            />
            {/* Progress Circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={phase === 'work' ? '#6366F1' : '#10B981'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 85}`}
              strokeDashoffset={`${2 * Math.PI * 85 * (1 - progressPercent / 100)}`}
              className="transition-all duration-300"
              transform="rotate(-90 100 100)"
            />
          </svg>
          
          {/* Time Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-gray-900">
              {formatTime(remainingSeconds)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Ciclo {cyclesCompleted + 1}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 mb-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              <Play className="w-5 h-5" />
              {sessionStarted ? 'Retomar' : 'Iniciar'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              <Pause className="w-5 h-5" />
              Pausar
            </button>
          )}
          
          {cyclesCompleted > 0 && (
            <button
              onClick={() => setShowFeedback(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{cyclesCompleted}</p>
            <p className="text-xs text-gray-600">Ciclos completos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{cyclesCompleted * workMinutes}</p>
            <p className="text-xs text-gray-600">Minutos estudados</p>
          </div>
        </div>
      </div>
    </div>
  )
}
