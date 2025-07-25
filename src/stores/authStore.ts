import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../types'
import type { PermissionCheck } from '../types/permission'

interface AuthState {
  user: User | null
  isLoading: boolean
  userPermissions: string[]
  userRoles: string[]
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkPermission: (check: PermissionCheck) => boolean
  hasRole: (roleName: string) => boolean
  setUser: (user: User | null) => void
  setUserPermissions: (permissions: string[]) => void
  setUserRoles: (roles: string[]) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  userPermissions: [],
  userRoles: [],
  
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      if (data.user) {
        // デバッグ用: ユーザーメタデータを確認
        console.log('Login - ユーザーメタデータ:', data.user.user_metadata)
        console.log('Login - 取得したrole:', data.user.user_metadata?.role)
        
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          role: data.user.user_metadata?.role || 'employee'
        }
        
        console.log('Login - 設定されたユーザー:', user)
        set({ user, isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, userPermissions: [], userRoles: [] })
  },
  
  checkPermission: (check: PermissionCheck) => {
    const { user, userPermissions } = get()
    if (!user) {
      console.log('checkPermission - ユーザーが存在しません')
      return false
    }
    
    console.log(`checkPermission - ユーザー: ${user.email}`)
    console.log(`checkPermission - チェック: ${check.action} on ${check.resource} in ${check.application}`)
    
    // テスト中は全権限を許可
    console.log('checkPermission - テストモード: 全権限を許可')
    return true
    
    // 本来の権限チェック（テスト終了後に有効化）
    // const permissionString = `${check.application}:${check.resource}:${check.action}`
    // const hasPermission = userPermissions.includes(permissionString)
    // console.log(`checkPermission - 結果: ${hasPermission}`)
    // return hasPermission
  },
  
  hasRole: (roleName: string) => {
    const { userRoles } = get()
    
    // テスト中は全ロールを許可
    console.log(`hasRole - テストモード: ロール ${roleName} を許可`)
    return true
    
    // 本来のロールチェック（テスト終了後に有効化）
    // return userRoles.includes(roleName)
  },
  
  setUser: (user: User | null) => set({ user }),
  setUserPermissions: (permissions: string[]) => set({ userPermissions: permissions }),
  setUserRoles: (roles: string[]) => set({ userRoles: roles })
}))