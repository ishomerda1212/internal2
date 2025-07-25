import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useApplications, usePermissions, useRoles, useUserRoles, useAssignUserRole, useRemoveUserRole } from '../../hooks/usePermissions'
import { useAuthStore } from '../../stores/authStore'
import type { PermissionCheck } from '../../types/permission'

export const PermissionManagement: React.FC = () => {
  const { user } = useAuthStore()
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  
  const { data: applications = [] } = useApplications()
  const { data: permissions = [] } = usePermissions()
  const { data: roles = [] } = useRoles()
  const { data: userRoles = [] } = useUserRoles(selectedUserId)
  
  const assignUserRole = useAssignUserRole()
  const removeUserRole = useRemoveUserRole()
  
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId || !user) return
    
    try {
      await assignUserRole.mutateAsync({
        userId: selectedUserId,
        roleId: selectedRoleId,
        assignedBy: user.id
      })
      setSelectedRoleId('')
    } catch (error) {
      console.error('ロール割り当てエラー:', error)
    }
  }
  
  const handleRemoveRole = async (roleId: string) => {
    if (!selectedUserId) return
    
    try {
      await removeUserRole.mutateAsync({
        userId: selectedUserId,
        roleId
      })
    } catch (error) {
      console.error('ロール削除エラー:', error)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">権限管理</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* アプリケーション一覧 */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">アプリケーション</h3>
          <div className="space-y-2">
            {applications.map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{app.display_name}</h4>
                  <p className="text-sm text-gray-600">{app.description}</p>
                </div>
                <Badge variant={app.is_active ? 'success' : 'default'}>
                  {app.is_active ? '有効' : '無効'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        
        {/* ロール一覧 */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">ロール</h3>
          <div className="space-y-2">
            {roles.map(role => (
              <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{role.display_name}</h4>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {role.is_system_role && (
                    <Badge variant="warning">システム</Badge>
                  )}
                  <Badge variant={role.is_active ? 'success' : 'default'}>
                    {role.is_active ? '有効' : '無効'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* 権限一覧 */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">権限一覧</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アプリケーション
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  リソース
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  表示名
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map(permission => (
                <tr key={permission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applications.find(app => app.id === permission.application_id)?.display_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permission.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permission.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permission.display_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* ユーザーロール管理 */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">ユーザーロール管理</h3>
        
        <div className="space-y-4">
          {/* ユーザー選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザーID
            </label>
            <input
              type="text"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="ユーザーIDを入力"
            />
          </div>
          
          {/* 現在のロール */}
          {selectedUserId && (
            <div>
              <h4 className="font-medium mb-2">現在のロール</h4>
              <div className="space-y-2">
                {userRoles.map(userRole => (
                  <div key={userRole.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{userRole.role?.display_name}</span>
                      <p className="text-sm text-gray-600">
                        割り当て日: {new Date(userRole.assigned_at).toLocaleDateString()}
                      </p>
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
                {userRoles.length === 0 && (
                  <p className="text-gray-500">ロールが割り当てられていません</p>
                )}
              </div>
            </div>
          )}
          
          {/* ロール割り当て */}
          {selectedUserId && (
            <div>
              <h4 className="font-medium mb-2">ロールを割り当て</h4>
              <div className="flex space-x-2">
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">ロールを選択</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAssignRole}
                  disabled={!selectedRoleId || assignUserRole.isPending}
                >
                  {assignUserRole.isPending ? '割り当て中...' : '割り当て'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
} 