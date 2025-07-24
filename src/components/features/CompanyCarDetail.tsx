import React, { useState } from 'react'
import { ArrowLeft, Edit, Plus, Car, Calendar, CreditCard, MapPin, FileText, User, Clock } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { CompanyCarEditForm } from '../forms/CompanyCarEditForm'
import { CarUsageForm } from '../forms/CarUsageForm'
import { useCompanyCar } from '../../hooks/useCompanyCars'
import { useCarUsageHistory } from '../../hooks/useCompanyCars'
import { useAuthStore } from '../../stores/authStore'

import { format } from 'date-fns'

interface CompanyCarDetailProps {
  carId: string
  onBack: () => void
}

export const CompanyCarDetail: React.FC<CompanyCarDetailProps> = ({
  carId,
  onBack
}) => {
  const { checkPermission } = useAuthStore()
  const { data: car, isLoading } = useCompanyCar(carId)
  const { data: usageHistory = [] } = useCarUsageHistory(carId)
  const [activeTab, setActiveTab] = useState<'basic' | 'usage'>('basic')
  const [showEditForm, setShowEditForm] = useState(false)
  const [showUsageForm, setShowUsageForm] = useState(false)
  
  const canUpdate = checkPermission('update', 'organizations') // 仮の権限設定
  const canCreateUsage = checkPermission('create', 'organizations') // 仮の権限設定
  
  const getLeaseStatusBadge = (remainingDays: number) => {
    if (remainingDays <= 30) {
      return <Badge variant="danger">期限切れ間近</Badge>
    } else if (remainingDays <= 90) {
      return <Badge variant="warning">要注意</Badge>
    } else {
      return <Badge variant="success">正常</Badge>
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }
  
  if (!car) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">車両が見つかりません</p>
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
              {car.vehicle_number_1} {car.vehicle_number_2}
            </h1>
            <p className="text-sm text-gray-500">
              {car.car_model}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getLeaseStatusBadge(car.lease_remaining_days)}
          {canUpdate && (
            <Button onClick={() => setShowEditForm(true)}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          )}
        </div>
      </div>
      
      {/* Car Summary Card */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Car className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">車種</p>
              <p className="text-sm text-gray-900">{car.car_model}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">配置店舗</p>
              <p className="text-sm text-gray-900">{car.assigned_store}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">現在の使用者</p>
              <p className="text-sm text-gray-900">
                {car.current_user ? 
                  `${car.current_user.last_name} ${car.current_user.first_name}` : 
                  '未割当'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">契約満了日</p>
              <p className="text-sm text-gray-900">
                {format(new Date(car.expiry_date), 'yyyy年MM月dd日')}
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
            onClick={() => setActiveTab('usage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usage'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            使用者履歴
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="車両情報">
            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">車両番号1</dt>
                <dd className="text-sm text-gray-900">{car.vehicle_number_1}</dd>
              </div>
              
              {car.vehicle_number_2 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">車両番号2</dt>
                  <dd className="text-sm text-gray-900">{car.vehicle_number_2}</dd>
                </div>
              )}
              
              {car.vehicle_number_3 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">車両番号3</dt>
                  <dd className="text-sm text-gray-900">{car.vehicle_number_3}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-sm font-medium text-gray-500">車種</dt>
                <dd className="text-sm text-gray-900">{car.car_model}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">配置店舗</dt>
                <dd className="text-sm text-gray-900">{car.assigned_store}</dd>
              </div>
            </div>
          </Card>
          
          <Card title="リース情報">
            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">リース会社</dt>
                <dd className="text-sm text-gray-900">{car.lease_company}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">契約日</dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(car.contract_date), 'yyyy年MM月dd日')}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">満了日</dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(car.expiry_date), 'yyyy年MM月dd日')}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">リース残日数</dt>
                <dd className="text-sm text-gray-900">{car.lease_remaining_days}日</dd>
              </div>
            </div>
          </Card>
          
          <Card title="カード情報">
            <div className="space-y-4">
              {car.gas_card && (
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ガソリンカード</dt>
                    <dd className="text-sm text-gray-900">{car.gas_card}</dd>
                  </div>
                </div>
              )}
              
              {car.etc_card && (
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ETCカード</dt>
                    <dd className="text-sm text-gray-900">{car.etc_card}</dd>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          <Card title="その他">
            <div className="space-y-4">
              {car.vehicle_registration && (
                <div className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">車検証</dt>
                    <dd className="text-sm text-gray-900">{car.vehicle_registration}</dd>
                  </div>
                </div>
              )}
              
              {car.maintenance_card && (
                <div className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">メンテナンスカード</dt>
                    <dd className="text-sm text-gray-900">{car.maintenance_card}</dd>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
      
      {activeTab === 'usage' && (
        <Card 
          title="使用者履歴" 
          subtitle={`${usageHistory.length}件の使用記録`}
          actions={
            canCreateUsage ? (
              <Button size="sm" onClick={() => setShowUsageForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                使用記録追加
              </Button>
            ) : undefined
          }
        >
          {usageHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>使用履歴がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usageHistory.map((usage, index) => (
                <div key={usage.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {usage.employee?.last_name} {usage.employee?.first_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({usage.employee?.employee_id})
                        </span>
                        {index === 0 && !usage.end_date && (
                          <Badge variant="info" size="sm">現在</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">期間:</span>{' '}
                        {format(new Date(usage.start_date), 'yyyy年MM月dd日')}
                        {usage.end_date && (
                          <span> 〜 {format(new Date(usage.end_date), 'yyyy年MM月dd日')}</span>
                        )}
                        {!usage.end_date && <span> 〜 現在</span>}
                      </div>
                      
                      {usage.purpose && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">目的:</span> {usage.purpose}
                        </div>
                      )}
                      
                      {usage.notes && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">備考:</span> {usage.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      
      {/* Forms */}
      {showEditForm && car && (
        <CompanyCarEditForm
          car={car}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            // データを再取得するためにクエリを無効化
            // React Queryが自動的に再フェッチする
          }}
        />
      )}
      
      {showUsageForm && (
        <CarUsageForm
          carId={carId}
          onClose={() => setShowUsageForm(false)}
          onSuccess={() => {
            // データを再取得するためにクエリを無効化
            // React Queryが自動的に再フェッチする
          }}
        />
      )}
    </div>
  )
}