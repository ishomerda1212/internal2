import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { StaffRankMaster } from '../types'

// スタッフランクマスター一覧を取得
export const useStaffRankMaster = () => {
  return useQuery({
    queryKey: ['staff-rank-master'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_rank_master')
        .select(`
          *,
          organization:organizations(*)
        `)
        .order('organization_id', { ascending: true })
        .order('staff_rank', { ascending: false })
        .order('effective_date', { ascending: false })

      if (error) {
        throw new Error(`スタッフランクマスターの取得に失敗しました: ${error.message}`)
      }

      return data as StaffRankMaster[]
    }
  })
}

// 現在のスタッフランクマスターのみを取得
export const useCurrentStaffRankMaster = () => {
  return useQuery({
    queryKey: ['staff-rank-master', 'current'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_rank_master')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('is_current', true)
        .order('organization_id', { ascending: true })
        .order('staff_rank', { ascending: false })

      if (error) {
        throw new Error(`現在のスタッフランクマスターの取得に失敗しました: ${error.message}`)
      }

      return data as StaffRankMaster[]
    }
  })
}

// 特定の組織のスタッフランクマスターを取得
export const useStaffRankMasterByOrganization = (organizationId: string) => {
  return useQuery({
    queryKey: ['staff-rank-master', 'organization', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_rank_master')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('organization_id', organizationId)
        .order('staff_rank', { ascending: false })
        .order('effective_date', { ascending: false })

      if (error) {
        throw new Error(`組織のスタッフランクマスターの取得に失敗しました: ${error.message}`)
      }

      return data as StaffRankMaster[]
    },
    enabled: !!organizationId
  })
}

// スタッフランクマスターを追加
export const useCreateStaffRankMaster = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newStaffRankMaster: Omit<StaffRankMaster, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('staff_rank_master')
        .insert(newStaffRankMaster)
        .select()
        .single()

      if (error) {
        throw new Error(`スタッフランクマスターの作成に失敗しました: ${error.message}`)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-rank-master'] })
    }
  })
}

// スタッフランクマスターを更新
export const useUpdateStaffRankMaster = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<StaffRankMaster> & { id: string }) => {
      const { data, error } = await supabase
        .from('staff_rank_master')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`スタッフランクマスターの更新に失敗しました: ${error.message}`)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-rank-master'] })
    }
  })
}

// スタッフランクマスターを削除
export const useDeleteStaffRankMaster = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff_rank_master')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`スタッフランクマスターの削除に失敗しました: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-rank-master'] })
    }
  })
} 