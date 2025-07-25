import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { 
  Application, 
  Permission, 
  Role, 
  UserRole, 
  UserPermission, 
  PermissionCheck 
} from '../types/permission'

// 権限関連のクエリキー
export const permissionKeys = {
  all: ['permissions'] as const,
  applications: () => [...permissionKeys.all, 'applications'] as const,
  permissions: () => [...permissionKeys.all, 'permissions'] as const,
  roles: () => [...permissionKeys.all, 'roles'] as const,
  userRoles: (userId: string) => [...permissionKeys.all, 'userRoles', userId] as const,
  userPermissions: (userId: string) => [...permissionKeys.all, 'userPermissions', userId] as const,
}

// アプリケーション一覧取得
export const useApplications = () => {
  return useQuery({
    queryKey: permissionKeys.applications(),
    queryFn: async (): Promise<Application[]> => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('is_active', true)
        .order('display_name')
      
      if (error) throw error
      return data || []
    }
  })
}

// 権限一覧取得
export const usePermissions = (applicationId?: string) => {
  return useQuery({
    queryKey: permissionKeys.permissions(),
    queryFn: async (): Promise<Permission[]> => {
      let query = supabase
        .from('permissions')
        .select('*')
        .eq('is_active', true)
        .order('display_name')
      
      if (applicationId) {
        query = query.eq('application_id', applicationId)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  })
}

// ロール一覧取得
export const useRoles = () => {
  return useQuery({
    queryKey: permissionKeys.roles(),
    queryFn: async (): Promise<Role[]> => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('is_active', true)
        .order('display_name')
      
      if (error) throw error
      return data || []
    }
  })
}

// ユーザーのロール取得
export const useUserRoles = (userId: string) => {
  return useQuery({
    queryKey: permissionKeys.userRoles(userId),
    queryFn: async (): Promise<UserRole[]> => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('user_id', userId)
        .is('expires_at', null)
        .order('assigned_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!userId
  })
}

// ユーザーの権限取得
export const useUserPermissions = (userId: string) => {
  return useQuery({
    queryKey: permissionKeys.userPermissions(userId),
    queryFn: async (): Promise<UserPermission[]> => {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
      
      if (error) throw error
      return data || []
    },
    enabled: !!userId
  })
}

// 権限チェック関数
export const usePermissionCheck = (userId: string) => {
  const { data: permissions = [] } = useUserPermissions(userId)
  
  const checkPermission = (check: PermissionCheck): boolean => {
    return permissions.some(permission => 
      permission.application_name === check.application &&
      permission.resource === check.resource &&
      permission.action === check.action
    )
  }
  
  const hasRole = (roleName: string): boolean => {
    return permissions.some(permission => permission.role_name === roleName)
  }
  
  return {
    permissions,
    checkPermission,
    hasRole,
    isLoading: false
  }
}

// ユーザーロール割り当て
export const useAssignUserRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      roleId, 
      assignedBy, 
      expiresAt 
    }: {
      userId: string
      roleId: string
      assignedBy: string
      expiresAt?: string
    }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: assignedBy,
          expires_at: expiresAt
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.userRoles(userId) })
      queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) })
    }
  })
}

// ユーザーロール削除
export const useRemoveUserRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId)
      
      if (error) throw error
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.userRoles(userId) })
      queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) })
    }
  })
}

// ロール作成
export const useCreateRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('roles')
        .insert(role)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.roles() })
    }
  })
}

// ロール権限割り当て
export const useAssignRolePermission = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      roleId, 
      permissionId, 
      grantedBy 
    }: {
      roleId: string
      permissionId: string
      grantedBy: string
    }) => {
      const { data, error } = await supabase
        .from('role_permissions')
        .insert({
          role_id: roleId,
          permission_id: permissionId,
          granted_by: grantedBy
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
    }
  })
} 