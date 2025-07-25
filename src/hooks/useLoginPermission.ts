import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// ログイン権限チェック用のフック
export const useLoginPermission = (userId: string) => {
  return useQuery({
    queryKey: ['loginPermission', userId],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false
      
      const { data, error } = await supabase
        .rpc('check_user_login_permission', {
          p_user_id: userId
        })
      
      if (error) {
        console.error('ログイン権限チェックエラー:', error)
        return false
      }
      
      return data || false
    },
    enabled: !!userId
  })
}

// ユーザーの権限情報を取得
export const useUserPermissionInfo = (userId: string) => {
  return useQuery({
    queryKey: ['userPermissionInfo', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('user_login_permissions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('ユーザー権限情報取得エラー:', error)
        return null
      }
      
      return data
    },
    enabled: !!userId
  })
} 