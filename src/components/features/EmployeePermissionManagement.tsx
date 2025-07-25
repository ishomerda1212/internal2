import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useUserRoles, useAssignUserRole, useRemoveUserRole, useRoles, useUserPermissions } from '../../hooks/usePermissions'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'

interface EmployeePermissionManagementProps {
  employeeId: string
  employeeEmail?: string
}

export const EmployeePermissionManagement: React.FC<EmployeePermissionManagementProps> = ({
  employeeId,
  employeeEmail
}) => {
  const { user } = useAuthStore()
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [authUserId, setAuthUserId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  
  const { data: roles = [] } = useRoles()
  const { data: userRoles = [] } = useUserRoles(authUserId)
  const { data: userPermissions = [] } = useUserPermissions(authUserId)
  
  const assignUserRole = useAssignUserRole()
  const removeUserRole = useRemoveUserRole()
  
  // 社員のメールアドレスからSupabaseのユーザーIDを取得
  useEffect(() => {
    const fetchAuthUserId = async () => {
      if (!employeeEmail) {
        setIsLoading(false)
        return
      }
      
      try {
        // Supabaseのauth.usersテーブルに直接アクセスできないため、
        // 管理者権限でユーザーIDを取得する必要があります
        // 一時的にテスト用のユーザーIDを使用
        if (employeeEmail === 'hr@example.com') {
          setAuthUserId('a85ff2d0-d6ab-4478-ba31-c5da8c0a2f07') // hr@example.comのユーザーID
        } else if (employeeEmail === 'manager@example.com') {
          setAuthUserId('test-manager-id') // テスト用
        } else {
          setAuthUserId('test-employee-id') // テスト用
        }
      } catch (error) {
        console.error('ユーザーID取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAuthUserId()
  }, [employeeEmail])
  
  const handleAssignRole = async () => {
    if (!selectedRoleId || !authUserId || !user) return
    
    try {
      await assignUserRole.mutateAsync({
        userId: authUserId,
        roleId: selectedRoleId,
        assignedBy: user.id
      })
      setSelectedRoleId('')
    } catch (error) {
      console.error('ロール割り当てエラー:', error)
    }
  }
  
  const handleRemoveRole = async (roleId: string) => {
    if (!authUserId) return
    
    try {
      await removeUserRole.mutateAsync({
        userId: authUserId,
        roleId
      })
    } catch (error) {
      console.error('ロール削除エラー:', error)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
      </div>
    )
  }
  
  if (!authUserId) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            この社員のシステムアカウントが見つかりません
          </p>
          <p className="text-sm text-gray-400">
            メールアドレス: {employeeEmail || '未設定'}
          </p>
        </div>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 現在の権限状況 */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">現在の権限状況</h3>
        
        {/* ロール一覧 */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">割り当てられたロール</h4>
          {userRoles.length > 0 ? (
            <div className="space-y-2">
              {userRoles.map(userRole => (
                <div key={userRole.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{userRole.role?.display_name}</span>
                    <p className="text-sm text-gray-600">{userRole.role?.description}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveRole(userRole.role_id)}
                    disabled={removeUserRole.isPending}
                  >
                    削除
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">ロールが割り当てられていません</p>
          )}
        </div>
        
        {/* 権限一覧 */}
        <div>
          <h4 className="font-medium mb-3">保有権限</h4>
          {userPermissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {userPermissions.map((permission, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                  <div>
                    <span className="text-sm font-medium">{permission.application_name}</span>
                    <p className="text-xs text-gray-600">
                      {permission.resource} - {permission.action}
                    </p>
                  </div>
                  <Badge variant="success" className="text-xs">
                    {permission.role_name}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">権限がありません</p>
          )}
        </div>
      </Card>
      
      {/* ロール割り当て */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">ロールを割り当て</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ロールを選択
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">ロールを選択してください</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.display_name} - {role.description}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={handleAssignRole}
            disabled={!selectedRoleId || assignUserRole.isPending}
            className="w-full"
          >
            {assignUserRole.isPending ? '割り当て中...' : 'ロールを割り当て'}
          </Button>
        </div>
      </Card>
      
      {/* 利用可能なロール一覧 */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">利用可能なロール</h3>
        
        <div className="space-y-3">
          {roles.map(role => (
            <div key={role.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{role.display_name}</h4>
                <Badge variant={role.is_active ? 'success' : 'default'}>
                  {role.is_active ? '有効' : '無効'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              
              {/* このロールの権限一覧 */}
              <div className="text-xs text-gray-500">
                <strong>権限:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {userPermissions
                    .filter(p => p.role_name === role.name)
                    .map((permission, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded">
                        {permission.application_name}:{permission.resource}:{permission.action}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 