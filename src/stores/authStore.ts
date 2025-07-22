import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkPermission: (action: string, resource: string) => boolean
  setUser: (user: User | null) => void
}

const permissionMatrix = {
  hr: {
    employees: { create: true, read: true, update: true, delete: true },
    organizations: { create: true, read: true, update: true, delete: true },
    transfers: { create: true, read: true, update: true, delete: true }
  },
  manager: {
    employees: { create: false, read: true, update: false, delete: false },
    organizations: { create: false, read: true, update: false, delete: false },
    transfers: { create: false, read: true, update: false, delete: false }
  },
  employee: {
    employees: { create: false, read: false, update: false, delete: false },
    organizations: { create: false, read: true, update: false, delete: false }
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: {
    id: 'demo-user',
    email: 'hr@example.com',
    role: 'hr'
  },
  isLoading: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          role: data.user.user_metadata?.role || 'employee'
        }
        set({ user, isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
  
  checkPermission: (action: string, resource: string) => {
    const { user } = get()
    if (!user) return false
    return permissionMatrix[user.role]?.[resource]?.[action] || false
  },
  
  setUser: (user: User | null) => set({ user })
}))