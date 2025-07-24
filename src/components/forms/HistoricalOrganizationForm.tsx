import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useOrganizations, useCreateOrganization, useUpdateOrganizationEffectiveDate } from '../../hooks/useOrganizations'
import { useEmployees } from '../../hooks/useEmployees'

interface HistoricalOrganizationFormProps {
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  old_name: yup.string().required('古い組織名は必須です'),
  new_name: yup.string().required('新しい組織名は必須です'),
  change_date: yup.string().required('変更日は必須です'),
  change_type: yup.string().oneOf(['name_change', 'parent_change', 'both']).required('変更タイプは必須です'),
  old_start_date: yup.string().required('古い組織の開始日は必須です')
})

type FormData = yup.InferType<typeof schema>

export const HistoricalOrganizationForm: React.FC<HistoricalOrganizationFormProps> = ({
  onClose,
  onSuccess
}) => {
  const createOrganization = useCreateOrganization()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      change_date: '2023-12-31',
      old_start_date: '2020-01-01',
      change_type: 'name_change'
    }
  })
  
  const watchChangeType = watch('change_type')
  
  // 変更タイプのオプション
  const changeTypeOptions = [
    { value: 'name_change', label: '名前変更のみ' },
    { value: 'parent_change', label: '親組織変更のみ' },
    { value: 'both', label: '名前・親組織両方変更' }
  ]
  
  const onSubmit = async (data: FormData) => {
    try {
      // 1. 古い組織の履歴レコードを作成（終了日付付き）
      const oldOrg = await createOrganization.mutateAsync({
        name: data.old_name,
        type: 'section', // デフォルト値
        level: 3, // デフォルト値
        effective_date: data.old_start_date,
        end_date: data.change_date,
        is_current: false,
        change_type: data.change_type,
        change_date: data.change_date
      })
      
      // 2. 新しい組織のレコードを作成（開始日付付き）
      const newOrg = await createOrganization.mutateAsync({
        name: data.new_name,
        type: 'section', // デフォルト値
        level: 3, // デフォルト値
        effective_date: data.change_date,
        is_current: true
      })
      
      // 3. 古い組織に後継組織IDを設定
      await createOrganization.mutateAsync({
        ...oldOrg,
        successor_id: newOrg.id
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('過去の組織変更登録エラー:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">過去の組織変更登録</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 border-b pb-2">過去の組織変更登録</h3>
            
            <Select
              label="既存の組織"
              {...register('existing_organization_id')}
              options={existingOrganizationOptions}
              error={errors.existing_organization_id?.message}
            />
            
            {selectedOrganization && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">選択された組織の情報</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>組織名: {selectedOrganization.name}</p>
                  <p>タイプ: {selectedOrganization.type}</p>
                  <p>階層レベル: {selectedOrganization.level}</p>
                </div>
              </div>
            )}
            
            <Input
              label="古い組織名"
              {...register('old_name')}
              error={errors.old_name?.message}
              placeholder="例: マンション"
            />
            
            <Input
              label="古い組織の開始日"
              type="date"
              {...register('old_start_date')}
              error={errors.old_start_date?.message}
            />
            
            <Input
              label="変更日"
              type="date"
              {...register('change_date')}
              error={errors.change_date?.message}
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
              登録
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 