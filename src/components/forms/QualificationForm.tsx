import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

interface QualificationFormProps {
  employeeId: string
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  name: yup.string().required('資格名は必須です'),
  type: yup.string().required('資格タイプは必須です'),
  level: yup.string().optional(),
  acquired_date: yup.string().required('取得日は必須です'),
  expiry_date: yup.string().optional(),
  issuing_organization: yup.string().optional(),
  certificate_number: yup.string().optional(),
  notes: yup.string().optional()
})

type FormData = yup.InferType<typeof schema>

export const QualificationForm: React.FC<QualificationFormProps> = ({
  employeeId,
  onClose,
  onSuccess
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  })
  
  const qualificationTypeOptions = [
    { value: '', label: '選択してください' },
    { value: '国家資格', label: '国家資格' },
    { value: '公的資格', label: '公的資格' },
    { value: '民間資格', label: '民間資格' },
    { value: '免許', label: '免許' },
    { value: '技能検定', label: '技能検定' },
    { value: 'その他', label: 'その他' }
  ]
  
  const onSubmit = async (data: FormData) => {
    try {
      // TODO: 資格追加のAPI呼び出し
      console.log('資格追加:', { employeeId, ...data })
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
      onSuccess()
      onClose()
    } catch (error) {
      console.error('資格追加エラー:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">資格・免許追加</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="資格名"
              {...register('name')}
              error={errors.name?.message}
              placeholder="例: 普通自動車第一種運転免許"
            />
            
            <Select
              label="資格タイプ"
              {...register('type')}
              options={qualificationTypeOptions}
              error={errors.type?.message}
            />
            
            <Input
              label="レベル・級"
              {...register('level')}
              error={errors.level?.message}
              placeholder="例: 1級、上級"
            />
            
            <Input
              label="取得日"
              type="date"
              {...register('acquired_date')}
              error={errors.acquired_date?.message}
            />
            
            <Input
              label="有効期限"
              type="date"
              {...register('expiry_date')}
              error={errors.expiry_date?.message}
              helpText="期限がない場合は空欄"
            />
            
            <Input
              label="発行機関"
              {...register('issuing_organization')}
              error={errors.issuing_organization?.message}
              placeholder="例: 警察庁"
            />
          </div>
          
          <Input
            label="証明書番号"
            {...register('certificate_number')}
            error={errors.certificate_number?.message}
            placeholder="例: 第123456789号"
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