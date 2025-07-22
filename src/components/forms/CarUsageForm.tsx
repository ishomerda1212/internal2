import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useEmployees } from '../../hooks/useEmployees'

interface CarUsageFormProps {
  carId: string
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  employee_id: yup.string().required('使用者は必須です'),
  start_date: yup.string().required('開始日は必須です'),
  end_date: yup.string().optional(),
  purpose: yup.string().optional(),
  notes: yup.string().optional()
})

type FormData = yup.InferType<typeof schema>

export const CarUsageForm: React.FC<CarUsageFormProps> = ({
  carId,
  onClose,
  onSuccess
}) => {
  const { data: employees = [] } = useEmployees({ status: 'active' })
  
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
  
  const employeeOptions = [
    { value: '', label: '選択してください' },
    ...employees.map(emp => ({
      value: emp.id,
      label: `${emp.last_name} ${emp.first_name} (${emp.employee_id})`
    }))
  ]
  
  const purposeOptions = [
    { value: '', label: '選択してください' },
    { value: '営業活動', label: '営業活動' },
    { value: '設計業務', label: '設計業務' },
    { value: '施工管理', label: '施工管理' },
    { value: '出張', label: '出張' },
    { value: '研修', label: '研修' },
    { value: 'その他', label: 'その他' }
  ]
  
  const onSubmit = async (data: FormData) => {
    try {
      // TODO: 使用者履歴追加のAPI呼び出し
      console.log('使用者履歴追加:', { carId, ...data })
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
      onSuccess()
      onClose()
    } catch (error) {
      console.error('使用者履歴追加エラー:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">使用者履歴追加</h2>
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
              label="使用者"
              {...register('employee_id')}
              options={employeeOptions}
              error={errors.employee_id?.message}
            />
            
            <Select
              label="使用目的"
              {...register('purpose')}
              options={purposeOptions}
              error={errors.purpose?.message}
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
              helpText="現在使用中の場合は空欄"
            />
          </div>
          
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