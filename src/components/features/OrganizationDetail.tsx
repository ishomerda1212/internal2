import React, { useState } from 'react'
import { Edit, Trash2, Building2, Users, Calendar, User, ArrowRight, Eye } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { OrganizationEditForm } from '../forms/OrganizationEditForm'
import { useOrganizationById, useDeleteOrganization } from '../../hooks/useOrganizations'
import { useEmployees } from '../../hooks/useEmployees'
import { useAuthStore } from '../../stores/authStore'
import { format } from 'date-fns'
import type { Organization } from '../../types'

interface OrganizationDetailProps {
  organizationId: string
  onViewFullDetail?: () => void
  onBack?: () => void
  isCompact?: boolean
}

export const OrganizationDetail: React.FC<OrganizationDetailProps> = ({
  organizationId,
  onViewFullDetail,
  onBack,
  isCompact = false
}) => {
  const { checkPermission } = useAuthStore()
  const { data: organization, isLoading } = useOrganizationById(organizationId)
  const { data: employees = [] } = useEmployees({ organization_id: organizationId })
  const deleteOrganization = useDeleteOrganization()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const canUpdate = checkPermission('update', 'organizations')
  const canDelete = checkPermission('delete', 'organizations')
  
  const getOrgTypeColor = (type: string) => {
    switch (type) {
      case 'headquarters': return 'bg-blue-100 text-blue-800'
      case 'department': return 'bg-orange-100 text-orange-800'
      case 'section': return 'bg-purple-100 text-purple-800'
      case 'team': return 'bg-green-100 text-green-800'
      case 'store': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getOrgTypeLabel = (type: string) => {
    switch (type) {
      case 'headquarters': return '本社'
      case 'department': return '部'
      case 'section': return '課'
      case 'team': return 'チーム'
      case 'store': return '店舗'
      default: return type
    }
  }
  
  const handleDelete = async () => {
    if (!organization) return
    
    try {
      await deleteOrganization.mutateAsync(organization.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('組織の削除に失敗しました:', error)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">組織が見つかりません</p>
        {onBack && (
          <Button onClick={onBack} className="mt-4">
            戻る
          </Button>
        )}
      </div>
    )
  }

  if (isCompact) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {organization.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getOrgTypeColor(organization.type)}>
                {getOrgTypeLabel(organization.type)}
              </Badge>
              <span className="text-sm text-gray-500">
                階層レベル: {organization.level}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canUpdate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditForm(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">所属社員数</p>
                <p className="text-sm font-semibold text-gray-900">{employees.length}名</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">責任者</p>
                <p className="text-sm font-semibold text-gray-900">
                  {organization.representative ? 
                    `${organization.representative.last_name} ${organization.representative.first_name}` : 
                    '未設定'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Basic Information */}
        <Card title="基本情報">
          <div className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-gray-500">組織名</dt>
              <dd className="text-sm text-gray-900">{organization.name}</dd>
            </div>
            
            <div>
              <dt className="text-xs font-medium text-gray-500">組織タイプ</dt>
              <dd className="text-sm text-gray-900">{getOrgTypeLabel(organization.type)}</dd>
            </div>
            
            <div>
              <dt className="text-xs font-medium text-gray-500">階層レベル</dt>
              <dd className="text-sm text-gray-900">{organization.level}</dd>
            </div>
            
            {organization.parent_id && (
              <div>
                <dt className="text-xs font-medium text-gray-500">親組織</dt>
                <dd className="text-sm text-gray-900">
                  親組織ID: {organization.parent_id}
                </dd>
              </div>
            )}
            
            {organization.representative && (
              <div>
                <dt className="text-xs font-medium text-gray-500">責任者</dt>
                <dd className="text-sm text-gray-900">
                  {organization.representative.last_name} {organization.representative.first_name}
                  {organization.representative.employee_id && (
                    <span className="text-gray-500 ml-2">
                      ({organization.representative.employee_id})
                    </span>
                  )}
                </dd>
              </div>
            )}
          </div>
        </Card>
        
        {/* Recent Employees */}
        <Card title="所属社員（最新10名）">
          <div className="space-y-2">
            {employees.length === 0 ? (
              <p className="text-sm text-gray-500">所属社員はいません</p>
            ) : (
              employees.slice(0, 10).map(employee => (
                <div key={employee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {employee.last_name} {employee.first_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {employee.employee_id} • {employee.current_assignment?.position || '-'}
                    </p>
                  </div>
                  <Badge 
                    size="sm" 
                    variant={employee.status === 'active' ? 'success' : 'warning'}
                  >
                    {employee.status === 'active' ? '在籍中' : '入社予定'}
                  </Badge>
                </div>
              ))
            )}
            {employees.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                他 {employees.length - 10} 名の社員が所属しています
              </p>
            )}
          </div>
        </Card>
        
        {/* View Full Detail Button */}
        {onViewFullDetail && (
          <Card>
            <div className="text-center">
              <Button 
                onClick={onViewFullDetail}
                className="w-full"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                詳細情報を見る
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}
        
        {/* Edit Form Modal */}
        {showEditForm && (
          <OrganizationEditForm
            organization={organization}
            onClose={() => setShowEditForm(false)}
            onSuccess={() => setShowEditForm(false)}
          />
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  組織の削除
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  「{organization.name}」を削除しますか？この操作は取り消せません。
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={deleteOrganization.isPending}
                  >
                    {deleteOrganization.isPending ? '削除中...' : '削除'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Full detail view (existing implementation)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              戻る
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {organization.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getOrgTypeColor(organization.type)}>
                {getOrgTypeLabel(organization.type)}
              </Badge>
              <span className="text-sm text-gray-500">
                階層レベル: {organization.level}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {canUpdate && (
            <Button onClick={() => setShowEditForm(true)}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          )}
          {canDelete && (
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">組織タイプ</p>
              <p className="text-sm text-gray-900">{getOrgTypeLabel(organization.type)}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">所属社員数</p>
              <p className="text-sm text-gray-900">{employees.length}名</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">責任者</p>
              <p className="text-sm text-gray-900">
                {organization.representative ? 
                  `${organization.representative.last_name} ${organization.representative.first_name}` : 
                  '未設定'
                }
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">作成日</p>
              <p className="text-sm text-gray-900">
                {format(new Date(organization.created_at), 'yyyy年MM月dd日')}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="基本情報">
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">組織名</dt>
              <dd className="text-sm text-gray-900">{organization.name}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">組織タイプ</dt>
              <dd className="text-sm text-gray-900">{getOrgTypeLabel(organization.type)}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">階層レベル</dt>
              <dd className="text-sm text-gray-900">{organization.level}</dd>
            </div>
            
            {organization.parent_id && (
              <div>
                <dt className="text-sm font-medium text-gray-500">親組織</dt>
                <dd className="text-sm text-gray-900">
                  {/* 親組織名を表示する場合は、親組織のデータを取得する必要があります */}
                  親組織ID: {organization.parent_id}
                </dd>
              </div>
            )}
            
            {organization.representative && (
              <div>
                <dt className="text-sm font-medium text-gray-500">責任者</dt>
                <dd className="text-sm text-gray-900">
                  {organization.representative.last_name} {organization.representative.first_name}
                  {organization.representative.employee_id && (
                    <span className="text-gray-500 ml-2">
                      ({organization.representative.employee_id})
                    </span>
                  )}
                </dd>
              </div>
            )}
          </div>
        </Card>
        
        <Card title="所属社員一覧">
          <div className="space-y-3">
            {employees.length === 0 ? (
              <p className="text-sm text-gray-500">所属社員はいません</p>
            ) : (
              employees.slice(0, 10).map(employee => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {employee.last_name} {employee.first_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {employee.employee_id} • {employee.current_assignment?.position || '-'}
                    </p>
                  </div>
                  <Badge 
                    size="sm" 
                    variant={employee.status === 'active' ? 'success' : 'warning'}
                  >
                    {employee.status === 'active' ? '在籍中' : '入社予定'}
                  </Badge>
                </div>
              ))
            )}
            {employees.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                他 {employees.length - 10} 名の社員が所属しています
              </p>
            )}
          </div>
        </Card>
      </div>
      
      {/* System Information */}
      <Card title="システム情報">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">作成日時</dt>
            <dd className="text-sm text-gray-900">
              {format(new Date(organization.created_at), 'yyyy年MM月dd日 HH:mm')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">最終更新日時</dt>
            <dd className="text-sm text-gray-900">
              {format(new Date(organization.updated_at), 'yyyy年MM月dd日 HH:mm')}
            </dd>
          </div>
        </div>
      </Card>
      
      {/* Edit Form Modal */}
      {showEditForm && (
        <OrganizationEditForm
          organization={organization}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                組織の削除
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                「{organization.name}」を削除しますか？この操作は取り消せません。
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleteOrganization.isPending}
                >
                  {deleteOrganization.isPending ? '削除中...' : '削除'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 