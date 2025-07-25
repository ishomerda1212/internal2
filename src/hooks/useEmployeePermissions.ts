import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// 社員のロール取得
export const useEmployeeRoles = (employeeId: string) => {
  return useQuery({
    queryKey: ['employeeRoles', employeeId],
    queryFn: async () => {
      console.log('useEmployeeRoles - クエリ実行:', employeeId)
      const { data, error } = await supabase
        .from('employee_roles')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('employee_id', employeeId)
      
      console.log('useEmployeeRoles - クエリ結果:', { data, error })
      if (error) throw error
      return data || []
    },
    enabled: !!employeeId
  })
}

// 社員の権限取得
export const useEmployeePermissions = (employeeId: string) => {
  return useQuery({
    queryKey: ['employeePermissions', employeeId],
    queryFn: async () => {
      console.log('useEmployeePermissions - クエリ実行:', employeeId)
      const { data, error } = await supabase
        .from('employee_permissions')
        .select('*')
        .eq('employee_id', employeeId)
      
      console.log('useEmployeePermissions - クエリ結果:', { data, error })
      if (error) throw error
      return data || []
    },
    enabled: !!employeeId
  })
}

// 社員にロールを割り当て
export const useAssignEmployeeRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      roleId,
      assignedBy = 'システム'
    }: {
      employeeId: string
      roleId: string
      assignedBy?: string
    }) => {
      const { data, error } = await supabase
        .from('employee_roles')
        .insert({
          employee_id: employeeId,
          role_id: roleId,
          assigned_by: assignedBy
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['employeeRoles', employeeId] })
      queryClient.invalidateQueries({ queryKey: ['employeePermissions', employeeId] })
    }
  })
}

// 社員からロールを削除
export const useRemoveEmployeeRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ employeeId, roleId }: { employeeId: string; roleId: string }) => {
      const { error } = await supabase
        .from('employee_roles')
        .delete()
        .eq('employee_id', employeeId)
        .eq('role_id', roleId)
      
      if (error) throw error
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['employeeRoles', employeeId] })
      queryClient.invalidateQueries({ queryKey: ['employeePermissions', employeeId] })
    }
  })
} 