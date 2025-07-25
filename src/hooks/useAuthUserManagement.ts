import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseAdmin } from '../lib/supabase'

// Authユーザー作成（Admin API使用）
export const useCreateAuthUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      email, 
      password,
      employeeId 
    }: {
      email: string
      password: string
      employeeId: string
    }) => {
      console.log('Authユーザー作成開始:', { email, employeeId })
      
      try {
        // Supabase Admin APIを使用してユーザーを作成
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            employee_id: employeeId,
            role: 'employee'
          }
        })
        
        if (error) {
          console.error('Authユーザー作成エラー:', error)
          throw error
        }
        
        console.log('Authユーザー作成成功:', data)
        return data
      } catch (error) {
        console.error('Admin APIエラー:', error)
        
        // Admin APIが使えない場合の代替案
        const manualInstructions = `
Admin APIの設定が必要です。

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 「service_role」キーをコピー
3. .envファイルに以下を追加：
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

または、手動でAuthユーザーを作成：
1. Supabaseダッシュボードで「Authentication」→「Users」
2. 「Add user」をクリック
3. Email: ${email}
4. Password: ${password}
5. メタデータ: {"employee_id": "${employeeId}", "role": "employee"}
        `
        
        throw new Error(`Authユーザー作成に失敗しました。\n\n${manualInstructions}`)
      }
    }
  })
}

// Authユーザー無効化
export const useDisableAuthUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      console.log('Authユーザー無効化開始:', userId)
      
      try {
        // Supabase Admin APIを使用してユーザーを無効化
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { 
            user_metadata: { 
              disabled: true,
              disabled_at: new Date().toISOString()
            }
          }
        )
        
        if (error) {
          console.error('Authユーザー無効化エラー:', error)
          throw error
        }
        
        console.log('Authユーザー無効化成功:', data)
        return data
      } catch (error) {
        console.error('Admin APIエラー:', error)
        throw new Error('Authユーザー無効化に失敗しました。Supabaseダッシュボードで手動で無効化してください。')
      }
    }
  })
}

// GmailからAuthユーザーIDを取得
export const useGetAuthUserId = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      console.log('AuthユーザーID取得開始:', email)
      
      try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers()
        
        if (error) {
          console.error('Authユーザー一覧取得エラー:', error)
          throw error
        }
        
        const user = data.users.find(u => u.email === email)
        console.log('AuthユーザーID取得結果:', user?.id)
        
        return user?.id
      } catch (error) {
        console.error('Admin APIエラー:', error)
        throw new Error('AuthユーザーID取得に失敗しました。')
      }
    }
  })
}

// カスタムログイン（Gmail + common_password）
export const useCustomLogin = () => {
  return useMutation({
    mutationFn: async ({ 
      email, 
      password 
    }: {
      email: string
      password: string
    }) => {
      console.log('カスタムログイン開始:', email)
      
      // 通常のSupabase認証を使用
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('カスタムログインエラー:', error)
        throw error
      }
      
      console.log('カスタムログイン成功:', data)
      return data
    }
  })
} 