export interface Application {
  id: string
  name: string
  display_name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  application_id: string
  name: string
  display_name: string
  description?: string
  resource: string
  action: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  display_name: string
  description?: string
  is_system_role: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  assigned_by?: string
  expires_at?: string
  role?: Role
}

export interface UserPermission {
  user_id: string
  role_name: string
  permission_name: string
  resource: string
  action: string
  application_name: string
}

export interface PermissionMatrix {
  [role: string]: {
    [resource: string]: {
      [action: string]: boolean
    }
  }
}

export interface PermissionCheck {
  application: string
  resource: string
  action: string
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete'
export type PermissionResource = 'employees' | 'organizations' | 'transfers' | 'company_cars' | 'staff_rank_master'

export interface PermissionContext {
  userId: string
  userRoles: string[]
  permissions: UserPermission[]
  checkPermission: (check: PermissionCheck) => boolean
  hasRole: (roleName: string) => boolean
} 