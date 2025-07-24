import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import type { User } from '../../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初期セッションを取得
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata?.role || 'employee'
          }
          setUser(user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('初期セッション取得エラー:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('認証状態変更:', event, session)
        
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata?.role || 'employee'
          }
          console.log('AuthProvider - ユーザー設定:', user)
          setUser(user)
        } else {
          console.log('AuthProvider - ユーザーなし')
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser])

  const value = {
    user,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 