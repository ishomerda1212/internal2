import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { TransferHistory } from '../types'
import type { Database } from '../lib/supabase'

type TransferHistoryRow = Database['public']['Tables']['transfer_history']['Row']
type TransferHistoryInsert = Database['public']['Tables']['transfer_history']['Insert']
type TransferHistoryUpdate = Database['public']['Tables']['transfer_history']['Update']

export const useTransferHistory = (employeeId?: string) => {
  return useQuery({
    queryKey: ['transfer-history', employeeId],
    queryFn: async () => {
      console.log('useTransferHistory - 開始:', { employeeId })
      
      try {
        let query = supabase
          .from('transfer_history')
          .select('*')
          .order('start_date', { ascending: false })

        if (employeeId) {
          query = query.eq('employee_id', employeeId)
        }

        const { data, error } = await query

        console.log('useTransferHistory - クエリ結果:', { data, error })

        if (error) {
          console.error('useTransferHistory - エラー詳細:', error)
          throw new Error(`異動履歴の取得に失敗しました: ${error.message}`)
        }

        // Transform data to match TransferHistory type
        const transferHistory: TransferHistory[] = (data || []).map(th => ({
          ...th,
          organization: null, // 一時的にnullに設定
          employee: null
        }))

        console.log('useTransferHistory - 変換後データ:', transferHistory)
        return transferHistory
      } catch (error) {
        console.error('useTransferHistory - 例外エラー:', error)
        throw error
      }
    },
    enabled: !!employeeId,
    retry: 1, // リトライ回数を制限
    retryDelay: 1000 // 1秒後にリトライ
  })
}

export const useCreateTransfer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: TransferHistoryInsert) => {
                    const { data: newTransfer, error } = await supabase
        .from('transfer_history')
          .insert(data)
          .select(`
            *,
            organizations(*),
            employees(*)
          `)
          .single()

      if (error) {
        throw new Error(`異動の作成に失敗しました: ${error.message}`)
      }

      return newTransfer as TransferHistory
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-history'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: TransferHistoryUpdate & { id: string }) => {
                    const { data: updatedTransfer, error } = await supabase
        .from('transfer_history')
          .update(data)
          .eq('id', id)
          .select(`
            *,
            organizations(*),
            employees(*)
          `)
          .single()

      if (error) {
        throw new Error(`異動の更新に失敗しました: ${error.message}`)
      }

      return updatedTransfer as TransferHistory
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-history'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}

export const useDeleteTransfer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transfer_history')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`異動の削除に失敗しました: ${error.message}`)
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-history'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}