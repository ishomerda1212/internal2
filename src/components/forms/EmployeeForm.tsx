import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useCreateEmployee } from '../../hooks/useEmployees'

interface EmployeeFormProps {
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  employee_id: yup.string().required('社員番号は必須です'),
  last_name: yup.string().required('姓は必須です'),
  first_name: yup.string().required('名は必須です'),
  last_name_kana: yup.string().required('姓（カナ）は必須です'),
  first_name_kana: yup.string().required('名（カナ）は必須です'),
  roman_name: yup.string().optional(),
  job_type: yup.string().optional(),
  employment_type: yup.string().optional(),
  gender: yup.string().optional(),
  status: yup.string().required('ステータスは必須です'),
  hire_date: yup.string().optional(),
  email: yup.string().email('正しいメールアドレスを入力してください').optional(),
  phone: yup.string().optional(),
  remarks: yup.string().optional()
})

type EmployeeFormData = yup.InferType<typeof schema>

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onClose,
  onSuccess
}) => {
  const createEmployee = useCreateEmployee()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<EmployeeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      status: 'upcoming'
    }
  })
  

  
  const jobTypeOptions = [
    { value: '', label: '選択してください' },
    { value: '営業', label: '営業' },
    { value: '事務', label: '事務' },
    { value: '設計', label: '設計' },
    { value: '施工管理', label: '施工管理' }
  ]
  
  const employmentTypeOptions = [
    { value: '', label: '選択してください' },
    { value: '代表', label: '代表' },
    { value: '役員', label: '役員' },
    { value: '正社員', label: '正社員' },
    { value: 'パート', label: 'パート' }
  ]
  
  const genderOptions = [
    { value: '', label: '選択してください' },
    { value: '男性', label: '男性' },
    { value: '女性', label: '女性' },
    { value: 'その他', label: 'その他' }
  ]
  
  const statusOptions = [
    { value: 'upcoming', label: '入社予定' },
    { value: 'active', label: '在籍中' },
    { value: 'resigned', label: '退職済み' }
  ]
  
  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee.mutateAsync({
        employee_id: data.employee_id,
        last_name: data.last_name,
        first_name: data.first_name,
        last_name_kana: data.last_name_kana,
        first_name_kana: data.first_name_kana,
        roman_name: data.roman_name || undefined,
        job_type: data.job_type || undefined,
        employment_type: data.employment_type || undefined,
        gender: data.gender || undefined,
        status: data.status as 'upcoming' | 'active' | 'resigned',
        hire_date: data.hire_date || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        remarks: data.remarks || undefined
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('社員作成エラー:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">新規社員登録</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* 基本情報 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="社員番号"
                {...register('employee_id')}
                error={errors.employee_id?.message}
                placeholder="例: EMP001"
              />
              
              <Select
                label="ステータス"
                {...register('status')}
                options={statusOptions}
                error={errors.status?.message}
              />
              
              <Input
                label="姓"
                {...register('last_name')}
                error={errors.last_name?.message}
                placeholder="例: 田中"
              />
              
              <Input
                label="名"
                {...register('first_name')}
                error={errors.first_name?.message}
                placeholder="例: 太郎"
              />
              
              <Input
                label="姓（カナ）"
                {...register('last_name_kana')}
                error={errors.last_name_kana?.message}
                placeholder="例: タナカ"
              />
              
              <Input
                label="名（カナ）"
                {...register('first_name_kana')}
                error={errors.first_name_kana?.message}
                placeholder="例: タロウ"
              />
              
              <Input
                label="ローマ字名"
                {...register('roman_name')}
                error={errors.roman_name?.message}
                placeholder="例: Taro Tanaka"
              />
              
              <Select
                label="性別"
                {...register('gender')}
                options={genderOptions}
                error={errors.gender?.message}
              />
            </div>
          </div>
          
          {/* 雇用情報 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">雇用情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="職種"
                {...register('job_type')}
                options={jobTypeOptions}
                error={errors.job_type?.message}
              />
              
              <Select
                label="雇用形態"
                {...register('employment_type')}
                options={employmentTypeOptions}
                error={errors.employment_type?.message}
              />
              
              <Input
                label="入社日"
                type="date"
                {...register('hire_date')}
                error={errors.hire_date?.message}
              />
            </div>
          </div>
          
          {/* 連絡先情報 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">連絡先情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="メールアドレス"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="例: tanaka@company.com"
              />
              
              <Input
                label="電話番号"
                {...register('phone')}
                error={errors.phone?.message}
                placeholder="例: 090-1234-5678"
              />
            </div>
          </div>
          
          {/* 備考 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              {...register('remarks')}
              rows={3}
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 px-4 py-3 text-base hover:border-gray-500 transition-colors"
              placeholder="特記事項があれば入力してください"
            />
            {errors.remarks && (
              <p className="text-sm text-red-600 mt-1">{errors.remarks.message}</p>
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
              登録
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}