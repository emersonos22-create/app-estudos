'use client'

import { useState } from 'react'
import { User, Mail, Lock, LogIn, UserPlus } from 'lucide-react'

interface AuthPageProps {
  onAuth: (userId: string, userName: string) => void
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !password) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (!isLogin && !email) {
      setError('Por favor, preencha o email para cadastro')
      return
    }

    if (isLogin) {
      // Login: verificar se usuário existe
      const users = JSON.parse(localStorage.getItem('ritmo_users') || '{}')
      const userKey = name.toLowerCase().trim()
      
      if (!users[userKey]) {
        setError('Usuário não encontrado')
        return
      }

      if (users[userKey].password !== password) {
        setError('Senha incorreta')
        return
      }

      // Login bem-sucedido
      onAuth(userKey, users[userKey].name)
    } else {
      // Cadastro: criar novo usuário
      const users = JSON.parse(localStorage.getItem('ritmo_users') || '{}')
      const userKey = name.toLowerCase().trim()

      if (users[userKey]) {
        setError('Este nome já está em uso. Escolha outro nome.')
        return
      }

      // Salvar novo usuário
      users[userKey] = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('ritmo_users', JSON.stringify(users))

      // Cadastro bem-sucedido, fazer login automaticamente
      onAuth(userKey, name.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        {/* Card de Autenticação */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo/Título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Ritmo
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome {!isLogin && <span className="text-gray-500">(como quer ser chamado)</span>}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Campo Email (apenas no cadastro) */}
            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Criar Conta
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Cadastro */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setEmail('')
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition"
            >
              {isLogin ? (
                <>Não tem uma conta? <span className="underline">Cadastre-se</span></>
              ) : (
                <>Já tem uma conta? <span className="underline">Faça login</span></>
              )}
            </button>
          </div>
        </div>

        {/* Informação adicional */}
        <p className="text-center text-white text-sm mt-4 opacity-90">
          Organize seus estudos com inteligência
        </p>
      </div>
    </div>
  )
}
