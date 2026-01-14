'use client'

import { useState } from 'react'
import { BookOpen, Plus, X } from 'lucide-react'

type OnboardingProps = {
  userId: string
  onComplete: () => void
}

export default function OnboardingPage({ userId, onComplete }: OnboardingProps) {
  const [subjects, setSubjects] = useState<string[]>([])
  const [newSubject, setNewSubject] = useState('')
  const [dailyMinutes, setDailyMinutes] = useState(120)
  const [loading, setLoading] = useState(false)

  const handleAddSubject = () => {
    if (newSubject.trim() && subjects.length < 10) {
      setSubjects([...subjects, newSubject.trim()])
      setNewSubject('')
    }
  }

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index))
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Salvar matérias no localStorage específico do usuário
      localStorage.setItem(`user_subjects_${userId}`, JSON.stringify(subjects))
      
      // Salvar configurações no localStorage específico do usuário
      localStorage.setItem(`daily_minutes_${userId}`, dailyMinutes.toString())
      
      onComplete()
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const canComplete = subjects.length > 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ritmo</h1>
          <p className="text-gray-600">Configure seu plano de estudos personalizado</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Tempo Disponível */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Quanto tempo você tem disponível por dia?
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="30"
                max="480"
                step="30"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">30 min</span>
                <div className="text-center">
                  <p className="text-4xl font-bold text-indigo-600">
                    {Math.floor(dailyMinutes / 60)}h {dailyMinutes % 60}min
                  </p>
                  <p className="text-sm text-gray-600 mt-1">por dia</p>
                </div>
                <span className="text-sm text-gray-600">8h</span>
              </div>
            </div>
          </div>

          {/* Matérias */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Quais matérias você vai estudar?
            </label>
            
            {/* Input para adicionar matéria */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                placeholder="Ex: Matemática, Português, História..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                maxLength={30}
              />
              <button
                onClick={handleAddSubject}
                disabled={!newSubject.trim() || subjects.length >= 10}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar
              </button>
            </div>

            {/* Lista de matérias */}
            {subjects.length > 0 ? (
              <div className="space-y-2">
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl"
                  >
                    <span className="font-medium text-gray-900">{subject}</span>
                    <button
                      onClick={() => handleRemoveSubject(index)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Adicione pelo menos uma matéria para começar</p>
              </div>
            )}

            {subjects.length > 0 && subjects.length < 10 && (
              <p className="text-sm text-gray-500 mt-2">
                {10 - subjects.length} matéria(s) restante(s)
              </p>
            )}
          </div>

          {/* Botão Continuar */}
          <button
            onClick={handleComplete}
            disabled={!canComplete || loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : canComplete ? 'Começar a estudar' : 'Adicione pelo menos uma matéria'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Você poderá adicionar ou remover matérias depois
        </p>
      </div>
    </div>
  )
}
