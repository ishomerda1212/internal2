import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Building2, Plus } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { OrganizationForm } from '../forms/OrganizationForm'

import { useOrganizationTree } from '../../hooks/useOrganizations'
import { useAuthStore } from '../../stores/authStore'
import type { Organization } from '../../types'

interface OrganizationTreeProps {
  selectedOrgId?: string
  onOrganizationSelect: (org: Organization) => void
  onDeleteOrganization: (org: Organization) => void
}

export const OrganizationTree: React.FC<OrganizationTreeProps> = ({
  selectedOrgId,
  onOrganizationSelect,
  onDeleteOrganization
}) => {
  const { data: organizations = [], isLoading } = useOrganizationTree()
  const { checkPermission } = useAuthStore()
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createParentId, setCreateParentId] = useState<string | undefined>()

  
  const canCreate = checkPermission('create', 'organizations')
  const canUpdate = checkPermission('update', 'organizations')
  const canDelete = checkPermission('delete', 'organizations')
  
  const toggleExpanded = (orgId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId)
    } else {
      newExpanded.add(orgId)
    }
    setExpandedNodes(newExpanded)
  }
  
  const renderOrganizationNode = (org: Organization, level: number = 0) => {
    const isExpanded = expandedNodes.has(org.id)
    const isSelected = selectedOrgId === org.id
    const hasChildren = org.children && org.children.length > 0
    
    const getOrgTypeColor = (type: string) => {
      switch (type) {
        case '部': return 'bg-orange-100 text-orange-800'
        case 'チーム': return 'bg-green-100 text-green-800'
        case '課': return 'bg-purple-100 text-purple-800'
        case '店舗': return 'bg-orange-100 text-orange-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    return (
      <div key={org.id}>
        <div 
          className={`
            flex items-center space-x-2 p-3 rounded-lg transition-colors
            ${isSelected ? 'bg-orange-50 border-l-4 border-orange-600' : 'hover:bg-gray-50'}
          `}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(org.id)
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0" />
            
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  onOrganizationSelect(org)
                  if (hasChildren) {
                    toggleExpanded(org.id)
                  }
                }}
              >
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 truncate">
                  {org.name}
                </span>
                <Badge size="sm" className={getOrgTypeColor(org.type)}>
                  {org.type}
                </Badge>
              </div>
              {org.representative && (
                <p className="text-xs text-gray-500 mt-1">
                  責任者: {org.representative.last_name} {org.representative.first_name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canCreate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setCreateParentId(org.id)
                  setShowCreateForm(true)
                }}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {org.children!.map(child => renderOrganizationNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <Card title="組織構造" subtitle="組織の階層構造を表示します">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }
  
  return (
    <Card 
      title="組織構造" 
      subtitle="組織の階層構造を表示します"
      actions={
        canCreate ? (
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            組織追加
          </Button>
        ) : undefined
      }
    >
      {showCreateForm && (
        <OrganizationForm
          parentId={createParentId}
          onClose={() => {
            setShowCreateForm(false)
            setCreateParentId(undefined)
          }}
          onSuccess={() => {
            // データを再取得するためにクエリを無効化
            // React Queryが自動的に再フェッチする
          }}
        />
      )}
      

      
      <div className="space-y-2 group">
        {organizations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>組織が登録されていません</p>
            {canCreate && (
              <Button 
                className="mt-4" 
                size="sm" 
                onClick={() => setShowCreateForm(true)}
              >
                最初の組織を作成
              </Button>
            )}
          </div>
        ) : (
          organizations.map(org => renderOrganizationNode(org))
        )}
      </div>
    </Card>
  )
}