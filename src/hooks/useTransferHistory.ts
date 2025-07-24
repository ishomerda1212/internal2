import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { TransferHistory } from '../types'
import type { Database } from '../lib/supabase'

type TransferHistoryRow = Database['public']['Tables']['transfer_histories']['Row']
type TransferHistoryInsert = Database['public']['Tables']['transfer_histories']['Insert']
type TransferHistoryUpdate = Database['public']['Tables']['transfer_histories']['Update']

export const useTransferHistory = (employeeId?: string) => {
  return useQuery({
    queryKey: ['transfer-history', employeeId],
    queryFn: async () => {
      console.log('useTransferHistory - 開始:', { employeeId })
      
      try {
        // 1. 異動履歴を取得
        let query = supabase
          .from('transfer_histories')
          .select('*')
          .order('start_date', { ascending: false })

        if (employeeId) {
          query = query.eq('employee_id', employeeId)
        }

        const { data: transferData, error: transferError } = await query

        console.log('useTransferHistory - 異動履歴クエリ結果:', { transferData, transferError })

        if (transferError) {
          console.error('useTransferHistory - エラー詳細:', transferError)
          throw new Error(`異動履歴の取得に失敗しました: ${transferError.message}`)
        }

        // 2. 各異動履歴の組織情報を取得
        const transferHistory: TransferHistory[] = await Promise.all(
          (transferData || []).map(async (th) => {
            console.log('useTransferHistory - 処理中のレコード:', th)
            
                             try {
                   const { data: orgData, error: orgError } = await supabase
                     .from('organizations')
                     .select('*')
                     .eq('id', th.organization_id)
                     .eq('is_current', true) // 現在の組織情報を取得
                     .single()

              if (!orgError && orgData) {
                return {
                  ...th,
                  organization: orgData,
                  employee: null
                }
              } else {
                console.log('useTransferHistory - 組織情報取得エラー:', orgError)
                return {
                  ...th,
                  organization: null,
                  employee: null
                }
              }
            } catch (error) {
              console.log('useTransferHistory - 組織情報取得例外:', error)
              return {
                ...th,
                organization: null,
                employee: null
              }
            }
          })
        )

        console.log('useTransferHistory - 最終データ:', transferHistory)
        return transferHistory
      } catch (error) {
        console.error('useTransferHistory - 例外エラー:', error)
        throw error
      }
    },
    enabled: !!employeeId,
    retry: 1,
    retryDelay: 1000
  })
}

export const useCreateTransfer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: TransferHistoryInsert) => {
                    // 組織情報のスナップショットを取得
                    const { data: orgData, error: orgError } = await supabase
                      .from('organizations')
                      .select('*')
                      .eq('id', data.organization_id)
                      .single()

                    if (orgError) {
                      throw new Error(`組織情報の取得に失敗しました: ${orgError.message}`)
                    }

                    // 組織情報のスナップショットを含めて異動記録を作成
                    const transferData = {
                      ...data,
                      organization_snapshot: orgData
                    }

                    const { data: newTransfer, error } = await supabase
                      .from('transfer_histories')
                      .insert(transferData)
                      .select(`
                        *,
                        organizations!organization_id(*),
                        employees!employee_id(*)
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
        .from('transfer_histories')
          .update(data)
          .eq('id', id)
          .select(`
            *,
            organizations!organization_id(*),
            employees!employee_id(*)
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
        .from('transfer_histories')
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