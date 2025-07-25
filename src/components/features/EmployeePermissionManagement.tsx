import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useEmployeeRoles, useAssignEmployeeRole, useRemoveEmployeeRole, useEmployeePermissions } from '../../hooks/useEmployeePermissions'
import { useRoles } from '../../hooks/usePermissions'
import { useAuthStore } from '../../stores/authStore'

interface EmployeePermissionManagementProps {
  employeeId: string
  employeeGmail?: string
}

export const EmployeePermissionManagement: React.FC<EmployeePermissionManagementProps> = ({
  employeeId,
  employeeGmail
}) => {
  console.log('EmployeePermissionManagement - コンポーネント初期化開始')
  console.log('employeeId:', employeeId)
  console.log('employeeGmail:', employeeGmail)
  
  const { user } = useAuthStore()
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  
  const { data: roles = [], error: rolesError } = useRoles()
  const { data: employeeRoles = [], error: employeeRolesError } = useEmployeeRoles(employeeId)
  const { data: employeePermissions = [], error: employeePermissionsError } = useEmployeePermissions(employeeId)
  
  // エラーが発生した場合の処理
  useEffect(() => {
    if (rolesError) {
      console.error('EmployeePermissionManagement - roles取得エラー:', rolesError)
      setError(`ロール取得エラー: ${rolesError.message}`)
    }
    if (employeeRolesError) {
      console.error('EmployeePermissionManagement - employeeRoles取得エラー:', employeeRolesError)
      setError(`社員ロール取得エラー: ${employeeRolesError.message}`)
    }
    if (employeePermissionsError) {
      console.error('EmployeePermissionManagement - employeePermissions取得エラー:', employeePermissionsError)
      setError(`社員権限取得エラー: ${employeePermissionsError.message}`)
    }
  }, [rolesError, employeeRolesError, employeePermissionsError])
  
  const assignEmployeeRole = useAssignEmployeeRole()
  const removeEmployeeRole = useRemoveEmployeeRole()
  
  const handleAssignRole = async () => {
    console.log('handleAssignRole - 開始')
    console.log('selectedRoleId:', selectedRoleId)
    console.log('employeeId:', employeeId)
    console.log('user:', user)
    
    if (!selectedRoleId || !employeeId || !user) {
      console.log('handleAssignRole - 必要な値が不足しています')
      return
    }
    
    try {
      console.log('handleAssignRole - ロール割り当てを実行')
      const result = await assignEmployeeRole.mutateAsync({
        employeeId: employeeId,
        roleId: selectedRoleId,
        assignedBy: user.email || 'システム'
      })
      console.log('handleAssignRole - 成功:', result)
      setSelectedRoleId('')
    } catch (error) {
      console.error('ロール割り当てエラー:', error)
      if (error instanceof Error) {
        console.error('エラーの詳細:', {
          message: error.message,
          name: error.name
        })
      }
    }
  }
  
  const handleRemoveRole = async (roleId: string) => {
    if (!employeeId) return
    
    try {
      await removeEmployeeRole.mutateAsync({
        employeeId: employeeId,
        roleId
      })
    } catch (error) {
      console.error('ロール削除エラー:', error)
    }
  }
  
  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">
            権限管理コンポーネントでエラーが発生しました
          </p>
          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer">エラーの詳細</summary>
            <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-xs mt-2">
              {error}
            </pre>
          </details>
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
          {employeeRoles.length > 0 ? (
            <div className="space-y-2">
              {employeeRoles.map((employeeRole, index) => (
                <div key={`${employeeRole.employee_id}-${employeeRole.role_id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{employeeRole.role?.display_name}</span>
                    <p className="text-sm text-gray-600">{employeeRole.role?.description}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveRole(employeeRole.role_id)}
                    disabled={removeEmployeeRole.isPending}
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
          {employeePermissions.length > 0 ? (
            <div className="space-y-4">
              {/* アプリケーション別にグループ化 */}
              {Array.from(new Set(employeePermissions.map(p => p.application_name))).map(appName => (
                <div key={appName} className="border rounded-lg p-3">
                  <h5 className="font-medium text-sm mb-2">{appName}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {employeePermissions
                      .filter(p => p.application_name === appName)
                      .map((permission, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                          <div>
                            <span className="text-xs font-medium">{permission.resource}</span>
                            <p className="text-xs text-gray-600">
                              {permission.action}
                            </p>
                          </div>
                          <Badge variant="success" className="text-xs">
                            {permission.role_name}
                          </Badge>
                        </div>
                      ))}
                  </div>
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
            disabled={!selectedRoleId || assignEmployeeRole.isPending}
            className="w-full"
          >
            {assignEmployeeRole.isPending ? '割り当て中...' : 'ロールを割り当て'}
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
                <div className="mt-1 space-y-2">
                  {Array.from(new Set(employeePermissions
                    .filter(p => p.role_name === role.name)
                    .map(p => p.application_name)))
                    .map(appName => (
                      <div key={appName}>
                        <span className="font-medium">{appName}:</span>
                        <div className="ml-2 flex flex-wrap gap-1">
                          {employeePermissions
                            .filter(p => p.role_name === role.name && p.application_name === appName)
                            .map((permission, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 rounded">
                                {permission.resource}:{permission.action}
                              </span>
                            ))}
                        </div>
                      </div>
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