import React from 'react'
import { Users, Building2, Settings, ChevronDown, ChevronRight, UserPlus, Car } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, checkPermission } = useAuthStore()
  const [expandedMenus, setExpandedMenus] = React.useState<Set<string>>(new Set(['employees']))
  
  const menuItems = [
    { id: 'employees', label: '社員管理', icon: Users, permission: ['employees', 'read'] },
    { id: 'organizations', label: '組織管理', icon: Building2, permission: ['organizations', 'read'] },
    { id: 'company-cars', label: '社用車管理', icon: Car, permission: ['organizations', 'read'] },
    { id: 'settings', label: '設定', icon: Settings, permission: null }
  ]
  
  const subMenuItems = {
    'employees': [
      { id: 'upcoming-employees', label: '入社予定者', icon: UserPlus, permission: ['employees', 'read'] }
    ],
    'company-cars': [
      { id: 'employee-car-assignment', label: '社員・車両紐づけ', icon: Users, permission: ['organizations', 'read'] }
    ]
  }
  
  const visibleItems = menuItems.filter(item => 
    !item.permission || checkPermission(item.permission[1], item.permission[0])
  )
  
  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMenus(newExpanded)
  }
  
  return (
    <div className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-orange-600" />
          <h1 className="text-xl font-bold text-gray-900">組織管理システム</h1>
        </div>
      </div>
      
      <nav className="mt-8">
        <div className="px-6 pb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            メインメニュー
          </h2>
        </div>
        <div className="space-y-1 px-3">
          {visibleItems.map(item => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            const hasSubMenu = subMenuItems[item.id]
            const isExpanded = expandedMenus.has(item.id)
            
            return (
              <div key={item.id}>
                <div className="flex items-center">
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`
                      flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive 
                        ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-600' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                  {hasSubMenu && (
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                
                {hasSubMenu && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {subMenuItems[item.id].map(subItem => {
                      const SubIcon = subItem.icon
                      const isSubActive = currentPage === subItem.id
                      const canViewSubItem = !subItem.permission || checkPermission(subItem.permission[1], subItem.permission[0])
                      
                      if (!canViewSubItem) return null
                      
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => onPageChange(subItem.id)}
                          className={`
                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                            ${isSubActive 
                              ? 'bg-orange-50 text-orange-600 border-l-2 border-orange-600' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <SubIcon className="mr-3 h-4 w-4" />
                          {subItem.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>
      
      {user && (
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-500">
                {user.role === 'hr' ? '人事部' : user.role === 'manager' ? '管理者' : '一般社員'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}