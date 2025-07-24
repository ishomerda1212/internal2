import React, { useState, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/react-query'

// Components
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { EmployeeList } from './components/features/EmployeeList'
import { EmployeeDetail } from './components/features/EmployeeDetail'
import { OrganizationTree } from './components/features/OrganizationTree'
import { OrganizationDetail } from './components/features/OrganizationDetail'
import { OrganizationManagement } from './components/features/OrganizationManagement'
import { Building2 } from 'lucide-react'
import { CompanyCarList } from './components/features/CompanyCarList'
import { CompanyCarDetail } from './components/features/CompanyCarDetail'
import { EmployeeCarAssignment } from './components/features/EmployeeCarAssignment'
import { StaffRankMasterManagement } from './components/features/StaffRankMasterManagement'

// Types
import type { Employee, Organization, CompanyCar } from './types'

function App() {
  const [currentPage, setCurrentPage] = useState('organization-tree')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [organizationViewMode, setOrganizationViewMode] = useState<'tree' | 'detail'>('tree')
  const [selectedCar, setSelectedCar] = useState<CompanyCar | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  
  const getPageTitle = () => {
    switch (currentPage) {
      case 'employees': return '社員管理'
      case 'upcoming-employees': return '入社予定者'
      case 'organizations': return '組織管理'
      case 'organization-tree': return '組織構造'
      case 'company-cars': return '社用車管理'
      case 'company-car-detail': return '社用車詳細'
      case 'employee-car-assignment': return '社員・車両紐づけ'
      case 'staff-rank-master': return 'スタッフランクマスター'
      case 'settings': return '設定'
      default: return '社員管理'
    }
  }
  
  const getPageSubtitle = () => {
    switch (currentPage) {
      case 'employees': return '社員情報の管理と検索'
      case 'upcoming-employees': return '入社予定者の管理'
      case 'organizations': return '組織の追加、編集、履歴管理'
      case 'organization-tree': return '組織構造の表示と確認'
      case 'company-cars': return '社用車の管理と配置'
      case 'company-car-detail': return '社用車の詳細情報'
      case 'employee-car-assignment': return '社員と車両の紐づけ状況'
      case 'staff-rank-master': return '組織別のスタッフランクとコスト設定'
      case 'settings': return 'システム設定'
      default: return ''
    }
  }
  
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee)
    setViewMode('detail')
  }
  
  const handleCarSelect = (car: CompanyCar) => {
    setSelectedCar(car)
    setViewMode('detail')
  }
  
  const handleOrganizationSelect = (org: Organization) => {
    setSelectedOrganization(org)
    setOrganizationViewMode('tree')
  }
  
  const handleOrganizationBack = () => {
    setOrganizationViewMode('tree')
  }
  
  const handleBackToList = () => {
    setSelectedEmployee(null)
    setViewMode('list')
  }
  
  const renderPageContent = () => {
    switch (currentPage) {
      case 'employees':
      case 'upcoming-employees':
        if (viewMode === 'detail' && selectedEmployee) {
          return (
            <EmployeeDetail
              employeeId={selectedEmployee.id}
              onBack={handleBackToList}
            />
          )
        }
        
        return (
          <EmployeeList
            filters={currentPage === 'upcoming-employees' ? { status: 'upcoming' } : {}}
            onEmployeeSelect={handleEmployeeSelect}
          />
        )
      
      case 'organizations':
        return <OrganizationManagement />
      
      case 'organization-tree':
        if (organizationViewMode === 'detail' && selectedOrganization) {
          return (
            <OrganizationDetail
              organizationId={selectedOrganization.id}
              onViewFullDetail={handleOrganizationBack}
              onBack={handleOrganizationBack}
            />
          )
        }
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrganizationTree
              selectedOrgId={selectedOrganization?.id}
              onOrganizationSelect={handleOrganizationSelect}
              onDeleteOrganization={(org) => {
                // TODO: Show delete confirmation
                console.log('Delete organization', org)
              }}
            />
            
            {selectedOrganization ? (
              <OrganizationDetail
                organizationId={selectedOrganization.id}
                onViewFullDetail={() => setOrganizationViewMode('detail')}
                isCompact={true}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    組織詳細
                  </h3>
                  <p className="text-sm text-gray-500">
                    左側の組織を選択すると詳細情報が表示されます
                  </p>
                </div>
              </div>
            )}
          </div>
        )
      
      case 'company-cars':
        if (viewMode === 'detail' && selectedCar) {
          return (
            <CompanyCarDetail
              carId={selectedCar.id}
              onBack={handleBackToList}
            />
          )
        }
        
        return (
          <CompanyCarList
            onCarSelect={handleCarSelect}
          />
        )
      
      case 'employee-car-assignment':
        return <EmployeeCarAssignment />
      
      case 'staff-rank-master':
        return <StaffRankMasterManagement />
      
      case 'settings':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">設定機能は開発中です</p>
          </div>
        )
      
      default:
        return (
          <EmployeeList
            onEmployeeSelect={handleEmployeeSelect}
          />
        )
    }
  }
  
  // Reset view mode when changing pages
  useEffect(() => {
    setViewMode('list')
    setSelectedEmployee(null)
    setSelectedCar(null)
  }, [currentPage])
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        
        <div className="flex-1 flex flex-col">
          <Header 
            title={getPageTitle()}
            subtitle={getPageSubtitle()}
          />
          
          <main className="flex-1 p-6 overflow-auto">
            {renderPageContent()}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App