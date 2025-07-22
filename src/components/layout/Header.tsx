import React from 'react'
import { LogOut, Bell } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/authStore'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const { logout } = useAuthStore()
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {actions}
            
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-5 w-5" />
            </button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => logout()}
              className="text-gray-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}