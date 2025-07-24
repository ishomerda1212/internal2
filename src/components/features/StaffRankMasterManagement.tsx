import React, { useState } from 'react'
import { StaffRankMasterList } from './StaffRankMasterList'
import { StaffRankMasterForm } from '../forms/StaffRankMasterForm'
import type { StaffRankMaster } from '../../types'

export const StaffRankMasterManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
  const [editingStaffRankMaster, setEditingStaffRankMaster] = useState<StaffRankMaster | undefined>()

  const handleAddNew = () => {
    setEditingStaffRankMaster(undefined)
    setViewMode('form')
  }

  const handleEdit = (staffRankMaster: StaffRankMaster) => {
    setEditingStaffRankMaster(staffRankMaster)
    setViewMode('form')
  }

  const handleFormSuccess = () => {
    setViewMode('list')
    setEditingStaffRankMaster(undefined)
  }

  const handleFormCancel = () => {
    setViewMode('list')
    setEditingStaffRankMaster(undefined)
  }

  if (viewMode === 'form') {
    return (
      <StaffRankMasterForm
        staffRankMaster={editingStaffRankMaster}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
      />
    )
  }

  return (
    <StaffRankMasterList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
    />
  )
} 