import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { TransferHistory } from '../types'

export const useTransferHistory = (employeeId: string) => {
  return useQuery({
    queryKey: ['transferHistory', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_histories')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false })

      console.log('useTransferHistory - 基本データ:', data)

      if (error) {
        throw new Error(`異動履歴の取得に失敗しました: ${error.message}`)
      }

      // 組織情報を個別に取得
      const transferHistoryWithOrgs = await Promise.all(
        (data || []).map(async (transfer) => {
          let orgLevel1 = null
          let orgLevel2 = null
          let orgLevel3 = null
          let staffRankMaster = null

          try {
            if (transfer.organization_level_1_id) {
              const { data: org1Data } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', transfer.organization_level_1_id)
                .single()
              orgLevel1 = org1Data
            }

            if (transfer.organization_level_2_id) {
              const { data: org2Data } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', transfer.organization_level_2_id)
                .single()
              orgLevel2 = org2Data
            }

            if (transfer.organization_level_3_id) {
              const { data: org3Data } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', transfer.organization_level_3_id)
                .single()
              orgLevel3 = org3Data
            }

            if (transfer.staff_rank_master_id) {
              const { data: srmData } = await supabase
                .from('staff_rank_master')
                .select('*')
                .eq('id', transfer.staff_rank_master_id)
                .single()
              staffRankMaster = srmData
            }
          } catch (orgError) {
            console.warn('useTransferHistory - 組織情報取得エラー:', orgError)
          }

          return {
            ...transfer,
            organization_level_1: orgLevel1,
            organization_level_2: orgLevel2,
            organization_level_3: orgLevel3,
            staff_rank_master: staffRankMaster
          }
        })
      )

      console.log('useTransferHistory - 組織情報付きデータ:', transferHistoryWithOrgs)

      // 重複を除去して返す
      const seen = new Set()
      const filteredData = transferHistoryWithOrgs.filter(item => {
        const duplicateKey = `${item.employee_id}-${item.start_date}`
        if (seen.has(duplicateKey)) {
          return false
        }
        seen.add(duplicateKey)
        return true
      })

      console.log('useTransferHistory - 重複除去後のデータ:', filteredData)
      return filteredData
    },
    enabled: !!employeeId
  })
}

export const useCreateTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transferData: {
      employee_id: string
      organization_level_1_id?: string | null
      organization_level_2_id?: string | null
      organization_level_3_id?: string | null
      position?: string | null
      staff_rank_master_id?: string | null
      start_date: string
    }) => {
      const { data, error } = await supabase
        .from('transfer_histories')
        .insert([transferData])
        .select()
        .single()

      if (error) {
        throw new Error(`異動記録の作成に失敗しました: ${error.message}`)
      }

      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transferHistory', variables.employee_id] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<TransferHistory> & { id: string }) => {
      const { data, error } = await supabase
        .from('transfer_histories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`異動記録の更新に失敗しました: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transferHistory', data.employee_id] })
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
        throw new Error(`異動記録の削除に失敗しました: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferHistory'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}