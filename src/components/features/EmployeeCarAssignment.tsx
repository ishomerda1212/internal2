import React, { useState } from 'react'
import { Search, Car, Users, AlertTriangle, Building2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { useEmployees } from '../../hooks/useEmployees'
import { useCompanyCars } from '../../hooks/useCompanyCars'
import { useOrganizations } from '../../hooks/useOrganizations'
import type { Employee, Organization } from '../../types'

export const EmployeeCarAssignment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrg, setSelectedOrg] = useState('')
  const { data: employees = [] } = useEmployees({ status: 'active' })
  const { data: cars = [] } = useCompanyCars()
  const { data: organizations = [] } = useOrganizations()
  
  // Flatten organizations for select options
  const flattenOrganizations = (orgs: Organization[]): Organization[] => {
    const result: Organization[] = []
    const flatten = (orgList: Organization[]) => {
      orgList.forEach(org => {
        result.push(org)
        if (org.children) {
          flatten(org.children)
        }
      })
    }
    flatten(orgs)
    return result
  }
  
  const flatOrgs = flattenOrganizations(organizations)
  
  const orgOptions = [
    { value: '', label: '全ての組織' },
    ...flatOrgs.map(org => ({
      value: org.id,
      label: org.name
    }))
  ]
  
  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = searchTerm === '' || 
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesOrg = selectedOrg === '' || 
      emp.current_assignment?.organization_id === selectedOrg
    
    return matchesSearch && matchesOrg
  })
  
  // Get car assignment for employee
  const getCarAssignment = (employeeId: string) => {
    return cars.find(car => car.current_user?.id === employeeId)
  }
  
  // Group employees by organization
  const groupEmployeesByOrg = () => {
    const groups: { [key: string]: { org: Organization, employees: Employee[] } } = {}
    
    filteredEmployees.forEach(emp => {
      if (emp.current_assignment?.organization) {
        const orgId = emp.current_assignment.organization.id
        if (!groups[orgId]) {
          groups[orgId] = {
            org: emp.current_assignment.organization,
            employees: []
          }
        }
        groups[orgId].employees.push(emp)
      }
    })
    
    return Object.values(groups).sort((a, b) => a.org.name.localeCompare(b.org.name))
  }
  
  // Get organization stats
  const getOrgStats = (orgName: string) => {
    const orgEmployees = employees.filter(emp => 
      emp.current_assignment?.organization?.name === orgName && emp.status === 'active'
    )
    const orgCars = cars.filter(car => car.assigned_store === orgName)
    
    return {
      employeeCount: orgEmployees.length,
      carCount: orgCars.length,
      shortage: Math.max(0, orgEmployees.length - orgCars.length),
      surplus: Math.max(0, orgCars.length - orgEmployees.length)
    }
  }
  
  const groupedEmployees = groupEmployeesByOrg()
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="社員名、社員番号で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            options={orgOptions}
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          />
        </div>
      </Card>
      
      {/* Overall Summary */}
      <Card title="全体サマリー">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{employees.filter(e => e.status === 'active').length}</div>
            <div className="text-sm text-gray-600">総在籍社員数</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Car className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{cars.length}</div>
            <div className="text-sm text-gray-600">総車両数</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(0, employees.filter(e => e.status === 'active').length - cars.length)}
            </div>
            <div className="text-sm text-gray-600">全体車両不足数</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{groupedEmployees.length}</div>
            <div className="text-sm text-gray-600">対象組織数</div>
          </div>
        </div>
      </Card>
      
      {/* Grouped by Organization */}
      {groupedEmployees.map(group => {
        const stats = getOrgStats(group.org.name)
        
        return (
          <Card 
            key={group.org.id}
            title={`${group.org.name} (${group.org.type})`}
            subtitle={`社員${stats.employeeCount}名 / 車両${stats.carCount}台`}
          >
            {/* Organization Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-600">{stats.employeeCount}</div>
                <div className="text-xs text-gray-600">在籍社員数</div>
              </div>
              
              <div className="text-center">
                <Car className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-600">{stats.carCount}</div>
                <div className="text-xs text-gray-600">配置車両数</div>
              </div>
              
              {stats.shortage > 0 && (
                <div className="text-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-red-600">{stats.shortage}</div>
                  <div className="text-xs text-gray-600">車両不足数</div>
                </div>
              )}
              
              {stats.surplus > 0 && (
                <div className="text-center">
                  <Car className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-green-600">+{stats.surplus}</div>
                  <div className="text-xs text-gray-600">車両余剰数</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-lg font-bold">
                  {stats.shortage > 0 ? (
                    <Badge variant="danger">不足</Badge>
                  ) : stats.surplus > 0 ? (
                    <Badge variant="success">余剰</Badge>
                  ) : (
                    <Badge variant="success">適正</Badge>
                  )}
                </div>
                <div className="text-xs text-gray-600">配置状況</div>
              </div>
            </div>
            
            {/* Employee Table */}
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
                      役職
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      職種
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      割当車両
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      車種
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.employees.map(employee => {
                    const assignedCar = getCarAssignment(employee.id)
                    
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
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
                          {employee.current_assignment?.position || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.job_type || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {assignedCar ? (
                            <div className="flex items-center">
                              <Car className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {assignedCar.vehicle_number_1}
                                </div>
                                {assignedCar.vehicle_number_2 && (
                                  <div className="text-sm text-gray-500">
                                    {assignedCar.vehicle_number_2}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">未割当</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignedCar?.car_model || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {assignedCar ? (
                            <Badge variant="success">割当済み</Badge>
                          ) : (
                            <Badge variant="warning">未割当</Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      })}
    </div>
  )
}