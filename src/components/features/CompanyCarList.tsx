import React, { useState } from 'react'
import { Search, Plus, Car, Calendar } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { CompanyCarForm } from '../forms/CompanyCarForm'
import { useCompanyCars } from '../../hooks/useCompanyCars'
import { useAuthStore } from '../../stores/authStore'
import type { CompanyCar } from '../../types'
import { format } from 'date-fns'

interface CompanyCarListProps {
  onCarSelect: (car: CompanyCar) => void
}

export const CompanyCarList: React.FC<CompanyCarListProps> = ({
  onCarSelect
}) => {
  const { checkPermission } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { data: cars = [], isLoading } = useCompanyCars()
  
  const filteredCars = cars.filter(car =>
    car.vehicle_number_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.car_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.assigned_store.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (car.current_user && 
     `${car.current_user.last_name} ${car.current_user.first_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  const getLeaseStatusBadge = (remainingDays: number) => {
    if (remainingDays <= 30) {
      return <Badge variant="danger">期限切れ間近</Badge>
    } else if (remainingDays <= 90) {
      return <Badge variant="warning">要注意</Badge>
    } else {
      return <Badge variant="success">正常</Badge>
    }
  }
  
  const canCreate = checkPermission('create', 'organizations') // 仮の権限設定
  
  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="車両番号、車種、配置店舗、使用者で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {canCreate && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新規車両登録
            </Button>
          )}
        </div>
      </Card>
      
      {showCreateForm && (
        <CompanyCarForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            // データを再取得するためにクエリを無効化
            // React Queryが自動的に再フェッチする
          }}
        />
      )}
      
      {/* Car Table */}
      <Card title="社用車一覧" subtitle={`${filteredCars.length}台の車両が見つかりました`}>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    車両番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    車種
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    リース会社
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    配置店舗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    現在の使用者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    契約満了日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCars.map(car => (
                  <tr 
                    key={car.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onCarSelect(car)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-orange-600">
                            {car.vehicle_number_1}
                          </div>
                          {car.vehicle_number_2 && (
                            <div className="text-sm text-gray-500">
                              {car.vehicle_number_2}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {car.car_model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {car.lease_company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {car.assigned_store}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {car.current_user ? (
                        <div>
                          <div className="font-medium">
                            {car.current_user.last_name} {car.current_user.first_name}
                          </div>
                          <div className="text-gray-500">
                            {car.current_user.employee_id}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">未割当</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {format(new Date(car.expiry_date), 'yyyy/MM/dd')}
                          </div>
                          <div className="text-xs text-gray-500">
                            残り{car.lease_remaining_days}日
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLeaseStatusBadge(car.lease_remaining_days)}
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