import React, { useState } from 'react'
import { Search, Plus, Filter, Download } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { EmployeeForm } from '../forms/EmployeeForm'
import { useEmployees } from '../../hooks/useEmployees'
import { useAuthStore } from '../../stores/authStore'
import type { Employee, EmployeeFilters } from '../../types'
import { format } from 'date-fns'

interface EmployeeListProps {
  filters?: EmployeeFilters
  onEmployeeSelect: (employee: Employee) => void
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  filters: initialFilters = {},
  onEmployeeSelect
}) => {
  const { checkPermission } = useAuthStore()
  const [filters, setFilters] = useState<EmployeeFilters>(initialFilters)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { data: employees = [], isLoading } = useEmployees(filters)
  
  const statusOptions = [
    { value: '', label: '全てのステータス' },
    { value: 'active', label: '在籍中' },
    { value: 'upcoming', label: '入社予定' },
    { value: 'resigned', label: '退職済み' }
  ]
  
  const jobTypeOptions = [
    { value: '', label: '全ての職種' },
    { value: '営業', label: '営業' },
    { value: '事務', label: '事務' },
    { value: '設計', label: '設計' },
    { value: '施工管理', label: '施工管理' }
  ]
  
  const employmentTypeOptions = [
    { value: '', label: '全ての雇用形態' },
    { value: '正社員', label: '正社員' },
    { value: 'パート', label: 'パート' },
    { value: '役員', label: '役員' },
    { value: '代表', label: '代表' }
  ]
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">在籍中</Badge>
      case 'upcoming':
        return <Badge variant="warning">入社予定</Badge>
      case 'resigned':
        return <Badge variant="default">退職済み</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }
  
  const canCreate = checkPermission('create', 'employees')
  
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <Input
              placeholder="社員名、社員番号で検索..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <Select
            options={statusOptions}
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          />
          
          <Select
            options={jobTypeOptions}
            value={filters.job_type || ''}
            onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
          />
          
          <Select
            options={employmentTypeOptions}
            value={filters.employment_type || ''}
            onChange={(e) => setFilters({ ...filters, employment_type: e.target.value })}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              詳細フィルタ
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
          </div>
          
          {canCreate && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新規社員登録
            </Button>
          )}
        </div>
      </Card>
      
      {showCreateForm && (
        <EmployeeForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            // データを再取得するためにクエリを無効化
            // React Queryが自動的に再フェッチする
          }}
        />
      )}
      
      {/* Employee Table */}
      <Card title="社員一覧" subtitle={`${employees.length}名の社員が見つかりました`}>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    社員番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    氏名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所属
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    役職
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    職種
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    雇用形態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    入社日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    退職日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map(employee => (
                  <tr 
                    key={employee.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onEmployeeSelect(employee)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {employee.employee_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.last_name} {employee.first_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.last_name_kana} {employee.first_name_kana}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        const assignment = employee.current_assignment
                        if (!assignment) return '-'
                        
                        const orgNames = [
                          assignment.organization_level_1?.name,
                          assignment.organization_level_2?.name,
                          assignment.organization_level_3?.name
                        ].filter(Boolean)
                        
                        return orgNames.length > 0 ? orgNames.join(' ') : '-'
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.current_assignment?.position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.job_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employment_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.hire_date ? format(new Date(employee.hire_date), 'yyyy/MM/dd') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.resign_date ? format(new Date(employee.resign_date), 'yyyy/MM/dd') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}