import React, { useState, useMemo } from 'react'
import { useStaffRankMaster, useDeleteStaffRankMaster } from '../../hooks/useStaffRankMaster'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Plus, Edit, Trash2, DollarSign, Building2, ChevronDown, ChevronRight } from 'lucide-react'
import type { StaffRankMaster } from '../../types'

interface StaffRankMasterListProps {
  onAddNew?: () => void
  onEdit?: (staffRankMaster: StaffRankMaster) => void
}

interface GroupedData {
  organizationId: string
  organizationName: string
  organizationType: string
  items: StaffRankMaster[]
  totalCost: number
}

export const StaffRankMasterList: React.FC<StaffRankMasterListProps> = ({
  onAddNew,
  onEdit
}) => {
  const { data: staffRankMasters, isLoading, error } = useStaffRankMaster()
  const deleteMutation = useDeleteStaffRankMaster()
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'all'>('current')
  const [expandedOrganizations, setExpandedOrganizations] = useState<Set<string>>(new Set())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount)
  }

  const getTotalCost = (item: StaffRankMaster) => {
    return item.personnel_costs + item.maintenance_costs + item.director_cost + item.ad_costs
  }

  const filteredData = selectedPeriod === 'current' 
    ? staffRankMasters?.filter(item => item.is_current)
    : staffRankMasters

  // 組織ごとにデータをグループ化
  const groupedData = useMemo(() => {
    if (!filteredData) return []

    const grouped = filteredData.reduce((acc, item) => {
      const orgId = item.organization_id
      const orgName = item.organization?.name || '不明'
      const orgType = item.organization?.type || ''

      if (!acc[orgId]) {
        acc[orgId] = {
          organizationId: orgId,
          organizationName: orgName,
          organizationType: orgType,
          items: [],
          totalCost: 0
        }
      }

      acc[orgId].items.push(item)
      acc[orgId].totalCost += getTotalCost(item)

      return acc
    }, {} as Record<string, GroupedData>)

    return Object.values(grouped).sort((a, b) => a.organizationName.localeCompare(b.organizationName))
      .map(group => ({
        ...group,
        items: group.items.sort((a, b) => {
          // Sを最初に、その後A,B,C...の順番
          if (a.staff_rank === 'S') return -1
          if (b.staff_rank === 'S') return 1
          return a.staff_rank.localeCompare(b.staff_rank)
        })
      }))
  }, [filteredData])

  const handleDelete = async (id: string) => {
    if (window.confirm('このスタッフランクマスターを削除しますか？')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        console.error('削除エラー:', error)
        alert('削除に失敗しました')
      }
    }
  }

  const toggleOrganization = (organizationId: string) => {
    const newExpanded = new Set(expandedOrganizations)
    if (newExpanded.has(organizationId)) {
      newExpanded.delete(organizationId)
    } else {
      newExpanded.add(organizationId)
    }
    setExpandedOrganizations(newExpanded)
  }

  const expandAll = () => {
    const allOrgIds = new Set(groupedData.map(group => group.organizationId))
    setExpandedOrganizations(allOrgIds)
  }

  const collapseAll = () => {
    setExpandedOrganizations(new Set())
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">エラーが発生しました: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">スタッフランクマスター</h2>
          <p className="text-gray-600">組織別のスタッフランクとコスト設定</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod('current')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'current'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              現在
            </button>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              全期間
            </button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="text-sm"
            >
              全て展開
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="text-sm"
            >
              全て閉じる
            </Button>
          </div>
          {onAddNew && (
            <Button onClick={onAddNew} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>新規追加</span>
            </Button>
          )}
        </div>
      </div>

      {/* データテーブル */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  組織
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  スタッフランク
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  人件費
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  経費保守費
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ディレクター費
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  広告費
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  合計
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  適用期間
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
              {groupedData.map((group) => {
                const isExpanded = expandedOrganizations.has(group.organizationId)
                const hasMultipleItems = group.items.length > 1

                return (
                  <React.Fragment key={group.organizationId}>
                    {/* 組織ヘッダー行 */}
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {hasMultipleItems && (
                            <button
                              onClick={() => toggleOrganization(group.organizationId)}
                              className="mr-2 p-1 hover:bg-gray-200 rounded"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                              )}
                            </button>
                          )}
                          <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                                                     <div>
                             <div className="text-sm font-semibold text-gray-900">
                               {group.organizationName}
                             </div>
                             <div className="text-sm text-gray-500">
                               {group.items[0]?.organization?.level === 1 ? '部' : 'チーム'} • {group.items.length}件
                             </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ¥{formatCurrency(group.totalCost)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                    </tr>

                    {/* 詳細行（展開時のみ表示） */}
                    {isExpanded && group.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center pl-8">
                            <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                            <div className="text-sm text-gray-500">
                              スタッフランク詳細
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="default" className="text-sm">
                            {item.staff_rank}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{formatCurrency(item.personnel_costs)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{formatCurrency(item.maintenance_costs)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{formatCurrency(item.director_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{formatCurrency(item.ad_costs)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ¥{formatCurrency(getTotalCost(item))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>{new Date(item.effective_date).toLocaleDateString('ja-JP')}</div>
                            {item.end_date && (
                              <div>〜 {new Date(item.end_date).toLocaleDateString('ja-JP')}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={item.is_current ? 'default' : 'info'}>
                            {item.is_current ? '現在' : '過去'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {onEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(item)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {groupedData.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              スタッフランクマスターがありません
            </h3>
            <p className="text-sm text-gray-500">
              {onAddNew ? '新規追加ボタンからデータを追加してください' : 'データが登録されていません'}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
} 