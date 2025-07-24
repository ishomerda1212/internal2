import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useOrganizations, useAllOrganizations } from '../../hooks/useOrganizations'
import { useCreateTransfer } from '../../hooks/useTransferHistory'
import type { Organization } from '../../types'

interface TransferFormProps {
  employeeId: string
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  organization_id: yup.string().required('配属先組織は必須です'),
  position: yup.string().optional().default(''),
  staff_rank: yup.string().optional().default(''),
  start_date: yup.string().required('開始日は必須です')
})

type FormData = yup.InferType<typeof schema>

export const TransferForm: React.FC<TransferFormProps> = ({
  employeeId,
  onClose,
  onSuccess
}) => {
  const { data: organizations = [] } = useOrganizations()
  const { data: allOrganizations = [] } = useAllOrganizations()
  const createTransfer = useCreateTransfer()
  const [organizationOptions, setOrganizationOptions] = useState<{ value: string, label: string, isPast?: boolean }[]>([
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
  
  // 組織オプション（現在・過去を含む）
  const getOrganizationOptions = (orgs: Organization[]): { value: string, label: string, isPast?: boolean }[] => {
    const result: { value: string, label: string, isPast?: boolean }[] = []
    
    orgs.forEach(org => {
      // 親組織名を取得
      const parentName = org.parent ? ` (${org.parent.name})` : ''
      
      // デバッグ用: 各組織の親組織情報を確認
      console.log(`組織: ${org.name}, parent_id: ${org.parent_id}, parent:`, org.parent)
      
      result.push({
        value: org.id,
        label: `${org.name}${parentName}`,
        isPast: !org.is_current
      })
    })
    
    return result
  }
  
  // allOrganizationsデータが更新されたときにorganizationOptionsを再計算
  useEffect(() => {
    if (allOrganizations && allOrganizations.length > 0) {
      const options = [
        { value: '', label: '選択してください' },
        ...getOrganizationOptions(allOrganizations)
      ]
      setOrganizationOptions(options)
      
      // デバッグ用: 組織データを確認
      console.log('TransferForm - allOrganizations:', allOrganizations)
      console.log('TransferForm - organizationOptions:', options)
    }
  }, [allOrganizations])
  
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