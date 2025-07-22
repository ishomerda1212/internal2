import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useOrganizations, useUpdateOrganization } from '../../hooks/useOrganizations'
import { useEmployees } from '../../hooks/useEmployees'
import type { Organization } from '../../types'

interface OrganizationEditFormProps {
  organization: Organization
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  name: yup.string().required('組織名は必須です'),
  type: yup.string().required('組織タイプは必須です'),
  level: yup.number().required('階層レベルは必須です'),
  representative_id: yup.string().optional(),
  parent_id: yup.string().optional()
})

type FormData = yup.InferType<typeof schema>

export const OrganizationEditForm: React.FC<OrganizationEditFormProps> = ({
  organization,
  onClose,
  onSuccess
}) => {
  const { data: organizations = [] } = useOrganizations()
  const { data: employees = [] } = useEmployees({ status: 'active' })
  const updateOrganization = useUpdateOrganization()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: organization.name,
      type: organization.type,
      level: organization.level,
      representative_id: organization.representative_id || '',
      parent_id: organization.parent_id || ''
    }
  })
  
  const watchLevel = watch('level')
  
  // 階層に応じた組織タイプオプション
  const getTypeOptions = (level: number) => {
    const baseOptions = [{ value: '', label: '選択してください' }]
    
    switch (level) {
      case 1:
        return [...baseOptions, { value: '代表', label: '代表' }]
      case 2:
        return [...baseOptions, { value: '部', label: '部' }]
      case 3:
        return [...baseOptions, 
          { value: '課', label: '課' },
          { value: 'チーム', label: 'チーム' },
          { value: '店舗', label: '店舗' },
          { value: '係', label: '係' },
          { value: '室', label: '室' }
        ]
      default:
        return baseOptions
    }
  }
  
  // 親組織オプション（自分自身は除外）
  const flattenOrganizations = (orgs: Organization[]): Organization[] => {
    const result: Organization[] = []
    const flatten = (orgList: Organization[]) => {
      orgList.forEach(org => {
        if (org.id !== organization.id) { // 自分自身を除外
          result.push(org)
          if (org.children) {
            flatten(org.children)
          }
        }
      })
    }
    flatten(orgs)
    return result
  }
  
  const flatOrgs = flattenOrganizations(organizations)
  const parentOptions = [
    { value: '', label: '親組織なし（最上位）' },
    ...flatOrgs.map(org => ({
      value: org.id,
      label: `${org.name} (${org.type})`
    }))
  ]
  
  // 責任者オプション
  const representativeOptions = [
    { value: '', label: '責任者なし' },
    ...employees.map(emp => ({
      value: emp.id,
      label: `${emp.last_name} ${emp.first_name} (${emp.employee_id})`
    }))
  ]
  
  const levelOptions = [
    { value: '1', label: '1階層（最上位）' },
    { value: '2', label: '2階層' },
    { value: '3', label: '3階層' }
  ]
  
  const onSubmit = async (data: FormData) => {
    try {
      await updateOrganization.mutateAsync({
        id: organization.id,
        name: data.name,
        type: data.type,
        level: data.level,
        representative_id: data.representative_id || undefined,
        parent_id: data.parent_id || undefined
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('組織更新エラー:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">組織情報編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <Input
            label="組織名"
            {...register('name')}
            error={errors.name?.message}
          />
          
          <Select
            label="階層レベル"
            {...register('level', { valueAsNumber: true })}
            options={levelOptions}
            error={errors.level?.message}
          />
          
          <Select
            label="組織タイプ"
            {...register('type')}
            options={getTypeOptions(watchLevel)}
            error={errors.type?.message}
          />
          
          <Select
            label="親組織"
            {...register('parent_id')}
            options={parentOptions}
            error={errors.parent_id?.message}
          />
          
          <Select
            label="責任者"
            {...register('representative_id')}
            options={representativeOptions}
            error={errors.representative_id?.message}
          />
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
            >
              更新
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}