import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Organization } from '../types'
import type { Database } from '../lib/supabase'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

// 組織ツリーを構築する関数
const buildOrganizationTree = (organizations: OrganizationRow[]): Organization[] => {
  const orgMap = new Map<string, Organization>()
  const roots: Organization[] = []

  // まず全ての組織をマップに追加
  organizations.forEach(org => {
    orgMap.set(org.id, {
      ...org,
      children: [],
      employee_count: 0
    })
  })

  // 親子関係を構築
  organizations.forEach(org => {
    const organization = orgMap.get(org.id)!
    if (org.parent_id && orgMap.has(org.parent_id)) {
      const parent = orgMap.get(org.parent_id)!
      parent.children!.push(organization)
    } else {
      roots.push(organization)
    }
  })

  return roots
}

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_current', true) // 現在の組織のみを取得
        .order('level', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`組織データの取得に失敗しました: ${error.message}`)
      }

      return data || []
    }
  })
}

export const useOrganizationTree = () => {
  return useQuery({
    queryKey: ['organizations', 'tree'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_current', true) // 現在の組織のみを取得
        .order('level', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`組織ツリーデータの取得に失敗しました: ${error.message}`)
      }

      return buildOrganizationTree(data || [])
    }
  })
}

export const useCreateOrganization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: OrganizationInsert) => {
      const { data: newOrg, error } = await supabase
        .from('organizations')
        .insert(data)
        .select()
        .single()

      if (error) {
        throw new Error(`組織の作成に失敗しました: ${error.message}`)
      }

      return newOrg
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organizations', 'tree'] })
    }
  })
}

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: OrganizationUpdate & { id: string }) => {
      const { data: updatedOrg, error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`組織の更新に失敗しました: ${error.message}`)
      }

      return updatedOrg
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organizations', 'tree'] })
    }
  })
}

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`組織の削除に失敗しました: ${error.message}`)
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organizations', 'tree'] })
    }
  })
}

// 既存の組織の有効開始日を更新するフック
export const useUpdateOrganizationEffectiveDate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, effective_date }: { id: string; effective_date: string }) => {
      const { data: updatedOrganization, error } = await supabase
        .from('organizations')
        .update({ effective_date })
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        throw new Error(`組織の有効開始日の更新に失敗しました: ${error.message}`)
      }

      return updatedOrganization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organizations', 'tree'] })
    }
  })
}

export const useOrganizationById = (id: string) => {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .eq('is_current', true) // 現在の組織のみを取得
        .single()

      if (error) {
        throw new Error(`組織データの取得に失敗しました: ${error.message}`)
      }

      return data
    },
    enabled: !!id
  })
}

// 全組織データを取得するフック（現在・過去問わず）
export const useAllOrganizations = () => {
  return useQuery({
    queryKey: ['organizations', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('level', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`組織データの取得に失敗しました: ${error.message}`)
      }

      // 親組織の情報を取得
      const organizationsWithParents = await Promise.all(
        (data || []).map(async (org) => {
          if (org.parent_id) {
            const { data: parent, error: parentError } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', org.parent_id)
              .single()
            
            if (parentError) {
              console.error(`親組織の取得エラー (${org.name}):`, parentError)
            } else {
              console.log(`親組織取得成功 (${org.name}):`, parent)
            }
            
            return { ...org, parent }
          }
          return org
        })
      )

      console.log('取得した全組織データ（親組織含む）:', organizationsWithParents)
      return organizationsWithParents
    }
  })
}

// 組織履歴を取得するフック（successor_idを使用）
export const useOrganizationHistory = (organizationId: string) => {
  return useQuery({
    queryKey: ['organization-history', organizationId],
    queryFn: async () => {
      // 選択された組織を取得
      const { data: selectedOrg, error: selectedError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (selectedError) {
        throw new Error(`組織データの取得に失敗しました: ${selectedError.message}`)
      }

      // 関連する履歴を取得
      let historyData = [selectedOrg]

      // 過去の組織の場合、後継組織を取得
      if (!selectedOrg.is_current && selectedOrg.successor_id) {
        const { data: successor, error: successorError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', selectedOrg.successor_id)
          .single()

        if (!successorError && successor) {
          historyData.push(successor)
        }
      }

      // 現在の組織の場合、前身組織を取得
      if (selectedOrg.is_current) {
        const { data: predecessors, error: predecessorError } = await supabase
          .from('organizations')
          .select('*')
          .eq('successor_id', selectedOrg.id)

        if (!predecessorError && predecessors) {
          historyData = [...predecessors, ...historyData]
        }
      }

      // 親組織の情報を取得
      const historyWithParents = await Promise.all(
        historyData.map(async (org) => {
          if (org.parent_id) {
            const { data: parent } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', org.parent_id)
              .single()
            return { ...org, parent }
          }
          return org
        })
      )

      // 日付順にソート
      return historyWithParents.sort((a, b) => 
        new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime()
      )
    },
    enabled: !!organizationId
  })
}

export const useOrganizationsForStaffRankMaster = () => {
  return useQuery({
    queryKey: ['organizations', 'staff-rank-master'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_current', true)
        .in('level', [1, 2]) // 1階層（部）と2階層（チーム）のみ
        .order('level', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`組織データの取得に失敗しました: ${error.message}`)
      }

      return data || []
    }
  })
}

export const useOrganizationsByLevel = (level: number) => {
  return useQuery({
    queryKey: ['organizations', 'level', level],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_current', true)
        .eq('level', level)
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`レベル${level}の組織データの取得に失敗しました: ${error.message}`)
      }

      return data || []
    }
  })
}

export const useOrganizationsByParent = (parentId: string) => {
  return useQuery({
    queryKey: ['organizations', 'parent', parentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_current', true)
        .eq('parent_id', parentId)
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`親組織${parentId}の子組織データの取得に失敗しました: ${error.message}`)
      }

      return data || []
    },
    enabled: !!parentId
  })
}