'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import AuthPage from './components/AuthPage'
import OnboardingPage from './components/OnboardingPage'
import DashboardPage from './components/DashboardPage'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkOnboarding(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkOnboarding(session.user.id)
      } else {
        setLoading(false)
        setOnboardingCompleted(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkOnboarding = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar onboarding:', error)
      }

      setOnboardingCompleted(data?.onboarding_completed ?? false)
    } catch (error) {
      console.error('Erro ao verificar onboarding:', error)
    } finally {
      setLoading(false)
    }
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

  if (!user) {
    return <AuthPage />
  }

  if (!onboardingCompleted) {
    return <OnboardingPage userId={user.id} onComplete={() => setOnboardingCompleted(true)} />
  }

  return <DashboardPage userId={user.id} />
}
