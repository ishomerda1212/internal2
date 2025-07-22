import React, { useState } from 'react'
import { ArrowLeft, Edit, Plus, Calendar, MapPin, Phone, Mail, User, Briefcase, Clock, FileText } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { EmployeeEditForm } from '../forms/EmployeeEditForm'
import { TransferForm } from '../forms/TransferForm'
import { QualificationForm } from '../forms/QualificationForm'
import { useEmployee } from '../../hooks/useEmployees'
import { useTransferHistory } from '../../hooks/useTransferHistory'
import { useAuthStore } from '../../stores/authStore'
import type { Employee } from '../../types'
import { format } from 'date-fns'

interface EmployeeDetailProps {
  employeeId: string
  onBack: () => void
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employeeId,
  onBack
}) => {
  const { checkPermission } = useAuthStore()
  const { data: employee, isLoading } = useEmployee(employeeId)
  const { data: transferHistory = [] } = useTransferHistory(employeeId)
  const [activeTab, setActiveTab] = useState<'basic' | 'transfer' | 'qualifications'>('basic')
  const [showEditForm, setShowEditForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [showQualificationForm, setShowQualificationForm] = useState(false)
  
  const canUpdate = checkPermission('update', 'employees')
  const canCreateTransfer = checkPermission('create', 'transfers')
  
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
  
  const getTransferTypeBadge = (type: string) => {
    switch (type) {
      case 'hire':
        return <Badge variant="success">入社</Badge>
      case 'transfer':
        return <Badge variant="info">異動</Badge>
      case 'promotion':
        return <Badge variant="warning">昇進</Badge>
      case 'demotion':
        return <Badge variant="default">降格</Badge>
      case 'lateral':
        return <Badge variant="default">横異動</Badge>
      default:
        return <Badge variant="default">{type}</Badge>
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">社員が見つかりません</p>
        <Button onClick={onBack} className="mt-4">
          戻る
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.last_name} {employee.first_name}
            </h1>
            <p className="text-sm text-gray-500">
              社員番号: {employee.employee_id}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge(employee.status)}
          {canUpdate && (
            <Button onClick={() => setShowEditForm(true)}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          )}
        </div>
      </div>
      
      {/* Employee Summary Card */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">氏名（カナ）</p>
              <p className="text-sm text-gray-900">
                {employee.last_name_kana} {employee.first_name_kana}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Briefcase className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">現在の所属</p>
              <p className="text-sm text-gray-900">
                {employee.current_assignment?.organization?.name || '-'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">役職</p>
              <p className="text-sm text-gray-900">
                {employee.current_assignment?.position || '-'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">入社日</p>
              <p className="text-sm text-gray-900">
                {employee.hire_date ? format(new Date(employee.hire_date), 'yyyy年MM月dd日') : '-'}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            基本情報
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transfer'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            異動履歴
          </button>
          <button
            onClick={() => setActiveTab('qualifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'qualifications'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            資格・免許
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="個人情報">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">姓</dt>
                  <dd className="text-sm text-gray-900">{employee.last_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">名</dt>
                  <dd className="text-sm text-gray-900">{employee.first_name}</dd>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">姓（カナ）</dt>
                  <dd className="text-sm text-gray-900">{employee.last_name_kana}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">名（カナ）</dt>
                  <dd className="text-sm text-gray-900">{employee.first_name_kana}</dd>
                </div>
              </div>
              
              {employee.roman_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">ローマ字名</dt>
                  <dd className="text-sm text-gray-900">{employee.roman_name}</dd>
                </div>
              )}
              
              {employee.gender && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">性別</dt>
                  <dd className="text-sm text-gray-900">{employee.gender}</dd>
                </div>
              )}
            </div>
          </Card>
          
          <Card title="雇用情報">
            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">社員番号</dt>
                <dd className="text-sm text-gray-900">{employee.employee_id}</dd>
              </div>
              
              {employee.job_type && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">職種</dt>
                  <dd className="text-sm text-gray-900">{employee.job_type}</dd>
                </div>
              )}
              
              {employee.employment_type && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">雇用形態</dt>
                  <dd className="text-sm text-gray-900">{employee.employment_type}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                <dd className="text-sm text-gray-900">{getStatusBadge(employee.status)}</dd>
              </div>
              
              {employee.hire_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">入社日</dt>
                  <dd className="text-sm text-gray-900">
                    {format(new Date(employee.hire_date), 'yyyy年MM月dd日')}
                  </dd>
                </div>
              )}
              
              {employee.resign_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">退職日</dt>
                  <dd className="text-sm text-gray-900">
                    {format(new Date(employee.resign_date), 'yyyy年MM月dd日')}
                  </dd>
                </div>
              )}
            </div>
          </Card>
          
          <Card title="連絡先情報">
            <div className="space-y-4">
              {employee.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                    <dd className="text-sm text-gray-900">{employee.email}</dd>
                  </div>
                </div>
              )}
              
              {employee.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">電話番号</dt>
                    <dd className="text-sm text-gray-900">{employee.phone}</dd>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {employee.remarks && (
            <Card title="備考">
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-gray-400 mt-1" />
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{employee.remarks}</p>
              </div>
            </Card>
          )}
        </div>
      )}
      
      {activeTab === 'transfer' && (
        <Card 
          title="異動履歴" 
          subtitle={`${transferHistory.length}件の異動記録`}
          actions={
            canCreateTransfer ? (
              <Button size="sm" onClick={() => setShowTransferForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                異動記録追加
              </Button>
            ) : undefined
          }
        >
          {transferHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>異動履歴がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transferHistory.map((transfer, index) => (
                <div key={transfer.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTransferTypeBadge(transfer.transfer_type)}
                        <span className="text-sm font-medium text-gray-900">
                          {transfer.organization?.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {transfer.position}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">期間:</span>{' '}
                        {format(new Date(transfer.start_date), 'yyyy年MM月dd日')}
                        {transfer.end_date && (
                          <span> 〜 {format(new Date(transfer.end_date), 'yyyy年MM月dd日')}</span>
                        )}
                        {!transfer.end_date && <span> 〜 現在</span>}
                      </div>
                      
                      {transfer.staff_rank && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">職階:</span> {transfer.staff_rank}
                        </div>
                      )}
                      
                      {transfer.reason && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">理由:</span> {transfer.reason}
                        </div>
                      )}
                      
                      {transfer.notes && (
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">備考:</span> {transfer.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {index === 0 && !transfer.end_date && (
                        <Badge variant="info" size="sm">現在</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      
      {activeTab === 'qualifications' && (
        <Card 
          title="資格・免許" 
          subtitle="保有資格と免許の一覧"
          actions={
            canUpdate ? (
              <Button size="sm" onClick={() => setShowQualificationForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                資格追加
              </Button>
            ) : undefined
          }
        >
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>資格・免許情報がありません</p>
            {canUpdate && (
              <Button size="sm" className="mt-4" onClick={() => setShowQualificationForm(true)}>
                最初の資格を追加
              </Button>
            )}
          </div>
        </Card>
      )}
      
      {/* Forms */}
      {showEditForm && employee && (
        <EmployeeEditForm
          employee={employee}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            // データを再取得するためにクエリを無効化
            // React Queryが自動的に再フェッチする
          }}
        />
      )}
      
      {showTransferForm && (
        <TransferForm
          employeeId={employeeId}
          onClose={() => setShowTransferForm(false)}
          onSuccess={() => {
            // データを再取得するためにクエリを無効化
            // React Queryが自動的に再フェッチする
          }}
        />
      )}
      
      {showQualificationForm && (
        <QualificationForm
          employeeId={employeeId}
          onClose={() => setShowQualificationForm(false)}
          onSuccess={() => {
            // データを再取得するためにクエリを無効化
            // React Queryが自動的に再フェッチする
          }}
        />
      )}
    </div>
  )
}