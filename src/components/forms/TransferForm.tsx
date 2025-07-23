import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useOrganizations } from '../../hooks/useOrganizations'
import { useCreateTransfer } from '../../hooks/useTransferHistory'
import type { Organization } from '../../types'

interface TransferFormProps {
  employeeId: string
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  organization_id: yup.string().required('配属先組織は必須です'),
  position: yup.string().required('役職は必須です'),
  staff_rank: yup.string().required('スタッフランクは必須です'),
  start_date: yup.string().required('開始日は必須です')
})

type FormData = yup.InferType<typeof schema>

export const TransferForm: React.FC<TransferFormProps> = ({
  employeeId,
  onClose,
  onSuccess
}) => {
  const { data: organizations = [] } = useOrganizations()
  const createTransfer = useCreateTransfer()
  const [organizationOptions, setOrganizationOptions] = useState<{ value: string, label: string }[]>([
    { value: '', label: '選択してください' }
  ])
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0] // 今日の日付
    }
  })
  
  // 組織オプション（階層表示）
  const getOrganizationHierarchy = (orgs: Organization[], level: number = 0): { value: string, label: string }[] => {
    const result: { value: string, label: string }[] = []
    
    orgs.forEach(org => {
      const indent = '　'.repeat(level) // 全角スペースでインデント
      const hierarchyText = level > 0 ? `（${level}階層）` : ''
      result.push({
        value: org.id,
        label: `${indent}${org.name}${hierarchyText}`
      })
      
      if (org.children && org.children.length > 0) {
        result.push(...getOrganizationHierarchy(org.children, level + 1))
      }
    })
    
    return result
  }
  
  // organizationsデータが更新されたときにorganizationOptionsを再計算
  useEffect(() => {
    if (organizations && organizations.length > 0) {
      const options = [
        { value: '', label: '選択してください' },
        ...getOrganizationHierarchy(organizations)
      ]
      setOrganizationOptions(options)
      
      // デバッグ用: 組織データを確認
      console.log('TransferForm - organizations:', organizations)
      console.log('TransferForm - organizationOptions:', options)
    }
  }, [organizations])
  
  const positionOptions = [
    { value: '', label: '選択してください' },
    { value: '代表取締役社長', label: '代表取締役社長' },
    { value: '役員', label: '役員' },
    { value: '本部長', label: '本部長' },
    { value: 'グループマネージャー', label: 'グループマネージャー' },
    { value: '部長', label: '部長' },
    { value: '課長', label: '課長' },
    { value: '室長', label: '室長' },
    { value: '店長', label: '店長' },
    { value: '副店長', label: '副店長' },
    { value: '係長', label: '係長' },
    { value: '主任', label: '主任' },
    { value: '一般', label: '一般' }
  ]
  
  const staffRankOptions = [
    { value: '', label: '選択してください' },
    { value: 'S', label: 'S' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
    { value: 'G', label: 'G' },
    { value: 'H', label: 'H' }
  ]
  
  const onSubmit = async (data: FormData) => {
    try {
      await createTransfer.mutateAsync({
        employee_id: employeeId,
        organization_id: data.organization_id,
        position: data.position,
        staff_rank: data.staff_rank,
        start_date: data.start_date,
        transfer_type: 'transfer' // デフォルトで異動
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('異動記録作成エラー:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">異動記録追加</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="配属先組織"
              {...register('organization_id')}
              options={organizationOptions}
              error={errors.organization_id?.message}
            />
            
            <Select
              label="役職"
              {...register('position')}
              options={positionOptions}
              error={errors.position?.message}
            />
            
            <Select
              label="スタッフランク"
              {...register('staff_rank')}
              options={staffRankOptions}
              error={errors.staff_rank?.message}
            />
            
            <Input
              label="開始日"
              type="date"
              {...register('start_date')}
              error={errors.start_date?.message}
            />
          </div>
          
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
              追加
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}