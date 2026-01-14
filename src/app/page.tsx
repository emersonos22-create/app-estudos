'use client'

import { useEffect, useState } from 'react'
import AuthPage from './components/AuthPage'
import OnboardingPage from './components/OnboardingPage'
import DashboardPage from './components/DashboardPage'

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado
    const loggedUser = localStorage.getItem('ritmo_logged_user')
    const loggedUserName = localStorage.getItem('ritmo_logged_user_name')
    
    if (loggedUser && loggedUserName) {
      setUserId(loggedUser)
      setUserName(loggedUserName)
      
      // Verificar se onboarding foi completado para este usuário
      const completed = localStorage.getItem(`onboarding_completed_${loggedUser}`)
      setOnboardingCompleted(completed === 'true')
    }
    
    setLoading(false)
  }, [])

  const handleAuth = (id: string, name: string) => {
    setUserId(id)
    setUserName(name)
    localStorage.setItem('ritmo_logged_user', id)
    localStorage.setItem('ritmo_logged_user_name', name)
    
    // Verificar se onboarding foi completado para este usuário
    const completed = localStorage.getItem(`onboarding_completed_${id}`)
    setOnboardingCompleted(completed === 'true')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não está logado, mostrar tela de autenticação
  if (!userId) {
    return <AuthPage onAuth={handleAuth} />
  }

  // Se está logado mas não completou onboarding
  if (!onboardingCompleted) {
    return (
      <OnboardingPage 
        userId={userId} 
        onComplete={() => {
          localStorage.setItem(`onboarding_completed_${userId}`, 'true')
          setOnboardingCompleted(true)
        }} 
      />
    )
  }

  // Se está logado e completou onboarding, mostrar dashboard
  return <DashboardPage userId={userId} userName={userName} />
}
