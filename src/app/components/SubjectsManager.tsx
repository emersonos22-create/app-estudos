'use client'

import { useState } from 'react'
import { X, Plus, BookOpen, Trash2 } from 'lucide-react'

type SubjectsManagerProps = {
  subjects: string[]
  onUpdate: (subjects: string[]) => void
  onClose: () => void
}

export default function SubjectsManager({ subjects, onUpdate, onClose }: SubjectsManagerProps) {
  const [localSubjects, setLocalSubjects] = useState<string[]>(subjects)
  const [newSubject, setNewSubject] = useState('')

  const handleAddSubject = () => {
    if (newSubject.trim() && localSubjects.length < 15 && !localSubjects.includes(newSubject.trim())) {
      setLocalSubjects([...localSubjects, newSubject.trim()])
      setNewSubject('')
    }
  }

  const handleRemoveSubject = (index: number) => {
    setLocalSubjects(localSubjects.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (localSubjects.length === 0) {
      alert('Você precisa ter pelo menos uma matéria')
      return
    }
    onUpdate(localSubjects)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Gerenciar Matérias</h3>
              <p className="text-sm text-gray-600">Adicione ou remova matérias do seu plano</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Subject Form */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adicionar nova matéria
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
              placeholder="Ex: Matemática, Física, História..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              maxLength={30}
            />
            <button
              onClick={handleAddSubject}
              disabled={!newSubject.trim() || localSubjects.length >= 15}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>
          {localSubjects.length >= 15 && (
            <p className="text-sm text-orange-600 mt-2">
              Limite máximo de 15 matérias atingido
            </p>
          )}
        </div>

        {/* Subjects List */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Suas matérias ({localSubjects.length})
          </label>
          {localSubjects.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {localSubjects.map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900">{subject}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveSubject(index)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma matéria adicionada</p>
              <p className="text-sm text-gray-500 mt-1">Adicione pelo menos uma matéria para continuar</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={localSubjects.length === 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  )
}
