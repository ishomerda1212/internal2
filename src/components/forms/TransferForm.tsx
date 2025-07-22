import React from 'react'
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
  staff_rank: yup.string().optional(),
  start_date: yup.string().required('開始日は必須です'),
  end_date: yup.string().optional(),
  transfer_type: yup.string().required('異動タイプは必須です'),
  reason: yup.string().optional(),
  notes: yup.string().optional()
})

type FormData = yup.InferType<typeof schema>

export const TransferForm: React.FC<TransferFormProps> = ({
  employeeId,
  onClose,
  onSuccess
}) => {
  const { data: organizations = [] } = useOrganizations()
  const createTransfer = useCreateTransfer()
  
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
  
  // 組織オプション
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
  const organizationOptions = [
    { value: '', label: '選択してください' },
    ...flatOrgs.map(org => ({
      value: org.id,
      label: `${org.name} (${org.type})`
    }))
  ]
  
  const transferTypeOptions = [
    { value: '', label: '選択してください' },
    { value: 'hire', label: '入社' },
    { value: 'transfer', label: '異動' },
    { value: 'promotion', label: '昇進' },
    { value: 'demotion', label: '降格' },
    { value: 'lateral', label: '横異動' }
  ]
  
  const positionOptions = [
    { value: '', label: '選択してください' },
    { value: '代表取締役', label: '代表取締役' },
    { value: '部長', label: '部長' },
    { value: '課長', label: '課長' },
    { value: '主任', label: '主任' },
    { value: '係長', label: '係長' },
    { value: '一般', label: '一般' }
  ]
  
  const staffRankOptions = [
    { value: '', label: '選択してください' },
    { value: '1級', label: '1級' },
    { value: '2級', label: '2級' },
    { value: '3級', label: '3級' },
    { value: '4級', label: '4級' },
    { value: '5級', label: '5級' }
  ]
  
  const onSubmit = async (data: FormData) => {
    try {
      await createTransfer.mutateAsync({
        employee_id: employeeId,
        organization_id: data.organization_id,
        position: data.position,
        staff_rank: data.staff_rank || undefined,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
        transfer_type: data.transfer_type as 'hire' | 'transfer' | 'promotion' | 'demotion' | 'lateral',
        reason: data.reason || undefined,
        notes: data.notes || undefined
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
              label="職階"
              {...register('staff_rank')}
              options={staffRankOptions}
              error={errors.staff_rank?.message}
            />
            
            <Select
              label="異動タイプ"
              {...register('transfer_type')}
              options={transferTypeOptions}
              error={errors.transfer_type?.message}
            />
            
            <Input
              label="開始日"
              type="date"
              {...register('start_date')}
              error={errors.start_date?.message}
            />
            
            <Input
              label="終了日"
              type="date"
              {...register('end_date')}
              error={errors.end_date?.message}
              helpText="現在の配属の場合は空欄"
            />
          </div>
          
          <Input
            label="異動理由"
            {...register('reason')}
            error={errors.reason?.message}
            placeholder="例: 組織改編に伴う異動"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備考
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 px-4 py-3 text-base hover:border-gray-500 transition-colors"
              placeholder="特記事項があれば入力してください"
            />
            {errors.notes && (
              <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
            )}
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