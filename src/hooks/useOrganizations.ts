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

export const useOrganizationById = (id: string) => {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(`組織データの取得に失敗しました: ${error.message}`)
      }

      return data
    },
    enabled: !!id
  })
}