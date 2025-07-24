import React, { useState } from 'react'
import { Plus, Edit, Trash2, Clock } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { OrganizationForm } from '../forms/OrganizationForm'
import { OrganizationEditForm } from '../forms/OrganizationEditForm'
import { HistoricalOrganizationForm } from '../forms/HistoricalOrganizationForm'
import { useOrganizations, useAllOrganizations, useDeleteOrganization, useOrganizationHistory } from '../../hooks/useOrganizations'
import { useAuthStore } from '../../stores/authStore'
import { format } from 'date-fns'
import type { Organization } from '../../types'

export const OrganizationManagement: React.FC = () => {
  const { checkPermission } = useAuthStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current')
  const [selectedOrgForHistory, setSelectedOrgForHistory] = useState<string | null>(null)
  const [showHistoricalForm, setShowHistoricalForm] = useState(false)
  
  const { data: organizations = [], isLoading } = useOrganizations()
  const { data: allOrganizations = [], isLoading: allOrganizationsLoading } = useAllOrganizations()
  const { data: organizationHistory = [] } = useOrganizationHistory(selectedOrgForHistory || '')
  const deleteOrganization = useDeleteOrganization()
  
  const canCreate = checkPermission('create', 'organizations')
  const canUpdate = checkPermission('update', 'organizations')
  const canDelete = checkPermission('delete', 'organizations')
  
  const getOrgTypeColor = (type: string) => {
    switch (type) {
      case '部': return 'bg-blue-100 text-blue-800'
      case 'チーム': return 'bg-orange-100 text-orange-800'
      case '課': return 'bg-purple-100 text-purple-800'
      case '店舗': return 'bg-red-100 text-red-800'
      case '室': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getOrgTypeLabel = (type: string) => {
    switch (type) {
      case '部': return '部'
      case 'チーム': return 'チーム'
      case '課': return '課'
      case '店舗': return '店舗'
      case '室': return '室'
      default: return type
    }
  }
  
  const handleDelete = async (id: string) => {
    try {
      await deleteOrganization.mutateAsync(id)
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('組織の削除に失敗しました:', error)
    }
  }
  
  if (isLoading || allOrganizationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">組織管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            組織の追加、編集、履歴管理を行います
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('current')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'current' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              現在の組織
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'history' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              履歴管理
            </button>
          </div>
          
          {canCreate && viewMode === 'current' && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              組織を追加
            </Button>
          )}
          {canCreate && viewMode === 'history' && (
            <Button onClick={() => setShowHistoricalForm(true)}>
              <Clock className="h-4 w-4 mr-2" />
              過去の変更を登録
            </Button>
          )}
        </div>
      </div>
      
      {/* Organization List */}
      {viewMode === 'current' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  組織名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイプ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  階層レベル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  親組織
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  有効期間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {org.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getOrgTypeColor(org.type)}>
                      {getOrgTypeLabel(org.type)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {org.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {org.parent_id ? '親組織ID: ' + org.parent_id : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>開始: {format(new Date(org.effective_date), 'yyyy/MM/dd')}</div>
                      {org.end_date && (
                        <div>終了: {format(new Date(org.end_date), 'yyyy/MM/dd')}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={org.is_current ? 'success' : 'default'}
                      size="sm"
                    >
                      {org.is_current ? '現在' : '過去'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {canUpdate && org.is_current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingOrganization(org)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          編集
                        </Button>
                      )}
                      {canDelete && org.is_current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(org.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          削除
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      ) : (
        <Card>
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">組織履歴管理</h3>
              <p className="text-sm text-gray-600">
                組織を選択して履歴（名前変更など）を確認できます
              </p>
            </div>
            
            {selectedOrgForHistory ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {organizations.find(org => org.id === selectedOrgForHistory)?.name} の履歴
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrgForHistory(null)}
                  >
                    選択解除
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {organizationHistory.map((history, index) => (
                    <div key={history.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {history.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(history.effective_date), 'yyyy/MM/dd')} から
                            {history.end_date ? ` ${format(new Date(history.end_date), 'yyyy/MM/dd')} まで` : ' 現在'}
                          </p>
                          {/* 親組織の情報を表示 */}
                          {history.parent && (
                            <p className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">親組織:</span> {history.parent.name}
                            </p>
                          )}
                          {/* 変更タイプを表示 */}
                          {history.change_type && (
                            <p className="text-xs text-blue-600 mt-1">
                              <span className="font-medium">変更内容:</span> {
                                history.change_type === 'name_change' ? '名前変更' :
                                history.change_type === 'parent_change' ? '親組織変更' :
                                history.change_type === 'both' ? '名前・親組織変更' : '変更'
                              }
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge 
                          variant={history.is_current ? 'success' : 'default'}
                          size="sm"
                        >
                          {history.is_current ? '現在' : '過去'}
                        </Badge>
                        {/* 組織タイプを表示 */}
                        <span className="text-xs text-gray-500">
                          {getOrgTypeLabel(history.type)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">履歴を確認したい組織を選択してください：</p>
                
                {/* デバッグ情報 */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">デバッグ情報:</p>
                  <p className="text-xs text-yellow-700">全組織数: {allOrganizations.length}</p>
                  <p className="text-xs text-yellow-700">現在の組織数: {allOrganizations.filter(org => org.is_current).length}</p>
                  <p className="text-xs text-yellow-700">過去の組織数: {allOrganizations.filter(org => !org.is_current).length}</p>
                  <p className="text-xs text-yellow-700">過去の組織: {allOrganizations.filter(org => !org.is_current).map(org => org.name).join(', ')}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allOrganizations
                    .filter(org => !org.is_current) // 過去の組織（is_current = false）のみ
                    .map((org) => (
                      <button
                        key={org.id}
                        onClick={() => setSelectedOrgForHistory(org.id)}
                        className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{org.name}</p>
                        <p className="text-sm text-gray-500">{getOrgTypeLabel(org.type)}</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(org.effective_date), 'yyyy/MM/dd')} - {org.end_date ? format(new Date(org.end_date), 'yyyy/MM/dd') : '現在'}
                        </p>
                        {org.change_type && (
                          <p className="text-xs text-blue-600">
                            {org.change_type === 'name_change' ? '名前変更' : '組織変更'}
                          </p>
                        )}
                      </button>
                    ))}
                </div>
                {allOrganizations.filter(org => !org.is_current).length === 0 && (
                  <p className="text-gray-500 text-center py-4">履歴のある組織がありません</p>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* Add Organization Form Modal */}
      {showAddForm && (
        <OrganizationForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => setShowAddForm(false)}
        />
      )}
      
      {/* Edit Organization Form Modal */}
      {editingOrganization && (
        <OrganizationEditForm
          organization={editingOrganization}
          onClose={() => setEditingOrganization(null)}
          onSuccess={() => setEditingOrganization(null)}
        />
      )}
      
      {/* Historical Organization Form Modal */}
      {showHistoricalForm && (
        <HistoricalOrganizationForm
          onClose={() => setShowHistoricalForm(false)}
          onSuccess={() => setShowHistoricalForm(false)}
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
                この組織を削除しますか？この操作は取り消せません。
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(showDeleteConfirm)}
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