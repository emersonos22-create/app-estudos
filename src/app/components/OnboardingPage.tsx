'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

type OnboardingProps = {
  userId: string
  onComplete: () => void
}

const questions = [
  {
    id: 'study_goal',
    question: 'Qual é seu principal objetivo de estudo?',
    options: [
      { value: 'faculdade', label: 'Faculdade' },
      { value: 'concurso', label: 'Concurso público' },
      { value: 'enem', label: 'ENEM / Vestibular' },
      { value: 'profissional', label: 'Estudos profissionais (trabalho)' },
      { value: 'organizacao', label: 'Organização pessoal / rotina' },
    ],
  },
  {
    id: 'weekly_frequency',
    question: 'Quantos dias por semana você consegue estudar?',
    options: [
      { value: '2-3', label: '2 a 3 dias' },
      { value: '4-5', label: '4 a 5 dias' },
      { value: '6-7', label: '6 a 7 dias' },
    ],
  },
  {
    id: 'focus_capacity',
    question: 'Por quanto tempo você consegue manter foco em uma sessão?',
    options: [
      { value: '25', label: 'Até 25 minutos' },
      { value: '30-50', label: '30 a 50 minutos' },
      { value: '60+', label: '1 hora ou mais' },
    ],
  },
  {
    id: 'best_time',
    question: 'Em qual período do dia você rende melhor?',
    options: [
      { value: 'manha', label: 'Manhã' },
      { value: 'tarde', label: 'Tarde' },
      { value: 'noite', label: 'Noite' },
      { value: 'varia', label: 'Varia muito' },
    ],
  },
  {
    id: 'main_difficulty',
    question: 'O que mais te atrapalha nos estudos hoje?',
    options: [
      { value: 'procrastinacao', label: 'Procrastinação' },
      { value: 'falta-rotina', label: 'Falta de rotina' },
      { value: 'cansaco', label: 'Cansaço mental' },
      { value: 'excesso-conteudo', label: 'Excesso de conteúdo' },
      { value: 'falta-motivacao', label: 'Falta de motivação' },
    ],
  },
  {
    id: 'routine_style',
    question: 'Como você prefere organizar seus estudos?',
    options: [
      { value: 'fixa', label: 'Rotina fixa (horários definidos)' },
      { value: 'flexivel', label: 'Rotina flexível (ajustes diários)' },
    ],
  },
]

export default function OnboardingPage({ userId, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Salvar perfil do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          study_goal: answers.study_goal,
          weekly_frequency: answers.weekly_frequency,
          focus_capacity: answers.focus_capacity,
          best_time: answers.best_time,
          main_difficulty: answers.main_difficulty,
          routine_style: answers.routine_style,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      // Criar plano de estudos inicial
      const sessionDuration = answers.focus_capacity === '25' ? 25 : answers.focus_capacity === '30-50' ? 40 : 60
      const sessionsPerDay = answers.focus_capacity === '25' ? 3 : 2
      const studyDays = answers.weekly_frequency === '2-3' ? ['seg', 'qua', 'sex'] : answers.weekly_frequency === '4-5' ? ['seg', 'ter', 'qua', 'qui', 'sex'] : ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
      const preferredTimes = answers.best_time === 'manha' ? ['09:00', '10:00'] : answers.best_time === 'tarde' ? ['14:00', '16:00'] : ['19:00', '20:00']

      const { error: planError } = await supabase
        .from('study_plans')
        .insert({
          user_id: userId,
          session_duration: sessionDuration,
          sessions_per_day: sessionsPerDay,
          study_days: studyDays,
          preferred_times: preferredTimes,
          is_active: true,
        })

      if (planError) throw planError

      onComplete()
    } catch (error) {
      console.error('Erro ao completar onboarding:', error)
      alert('Erro ao salvar suas preferências. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = answers[currentQuestion.id] !== undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Pergunta {currentStep + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {answers[currentQuestion.id] === option.value && (
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed || loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Salvando...'
              ) : currentStep === questions.length - 1 ? (
                <>
                  Finalizar
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  Próxima
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
