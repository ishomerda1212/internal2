import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useUpdateEmployee } from '../../hooks/useEmployees'
import type { Employee } from '../../types'

interface EmployeeEditFormProps {
  employee: Employee
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  employee_id: yup.string().required('社員番号は必須です'),
  last_name: yup.string().required('姓は必須です'),
  first_name: yup.string().required('名は必須です'),
  last_name_kana: yup.string().optional().default(''),
  first_name_kana: yup.string().optional().default(''),
  roman_name: yup.string().optional().default(''),
  job_type: yup.string().optional().default(''),
  employment_type: yup.string().optional().default(''),
  gender: yup.string().optional().default(''),
  status: yup.string().required('ステータスは必須です'),
  hire_date: yup.string().optional().default(''),
  resign_date: yup.string().optional().default(''),
  email: yup.string().email('正しいメールアドレスを入力してください').optional().default(''),
  phone: yup.string().optional().default(''),
  gmail: yup.string().email('正しいGmailアドレスを入力してください').optional().default(''),
  is_mail: yup.string().email('正しいISメールアドレスを入力してください').optional().default(''),
  common_password: yup.string().optional().default(''),
  remarks: yup.string().optional().default('')
})

type FormData = yup.InferType<typeof schema>

export const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({
  employee,
  onClose,
  onSuccess
}) => {
  const updateEmployee = useUpdateEmployee()
  
  // デバッグ用: employeeデータを確認
  console.log('EmployeeEditForm - employee data:', employee)
  
  const defaultValues = {
    employee_id: employee.employee_id,
    last_name: employee.last_name,
    first_name: employee.first_name,
    last_name_kana: employee.last_name_kana,
    first_name_kana: employee.first_name_kana,
    roman_name: employee.roman_name || '',
    job_type: employee.job_type || '',
    employment_type: employee.employment_type || '',
    gender: employee.gender || '',
    status: employee.status,
    hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
    resign_date: employee.resign_date ? employee.resign_date.split('T')[0] : '',
    email: employee.email || '',
    phone: employee.phone || '',
    gmail: employee.gmail || '',
    is_mail: employee.is_mail || '',
    common_password: employee.common_password || '',
    remarks: employee.remarks || ''
  }
  
  // デバッグ用: defaultValuesを確認
  console.log('EmployeeEditForm - defaultValues:', defaultValues)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues
  })
  
  // employeeデータが変更されたときにフォームをリセット
  useEffect(() => {
    if (employee) {
      reset(defaultValues)
    }
  }, [employee, reset])
  
  const jobTypeOptions = [
    { value: '', label: '選択してください' },
    { value: '管理職', label: '管理職' },
    { value: '営業', label: '営業' },
    { value: '営工', label: '営工' },
    { value: '施工管理', label: '施工管理' },
    { value: '現場補助', label: '現場補助' },
    { value: '内勤', label: '内勤' }
  ]
  
  const employmentTypeOptions = [
    { value: '', label: '選択してください' },
    { value: '代表', label: '代表' },
    { value: '役員', label: '役員' },
    { value: '正社員', label: '正社員' },
    { value: '契約社員', label: '契約社員' },
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
  
  const onSubmit = async (data: FormData) => {
    try {
      console.log('EmployeeEditForm - 送信データ:', data)
      console.log('EmployeeEditForm - 社員ID:', employee.id)
      console.log('EmployeeEditForm - 元のemployeeデータ:', employee)
      
      const updateData = {
        id: employee.id,
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
        resign_date: data.resign_date || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        gmail: data.gmail || undefined,
        is_mail: data.is_mail || undefined,
        common_password: data.common_password || undefined,
        remarks: data.remarks || undefined
      }
      
      console.log('EmployeeEditForm - 更新データ:', updateData)
      console.log('EmployeeEditForm - 更新データ（JSON）:', JSON.stringify(updateData, null, 2))
      
      const result = await updateEmployee.mutateAsync(updateData)
      console.log('EmployeeEditForm - 更新結果:', result)
      console.log('EmployeeEditForm - 更新結果（JSON）:', JSON.stringify(result, null, 2))
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('社員更新エラー:', error)
      // エラーの詳細を表示
      if (error instanceof Error) {
        console.error('エラーメッセージ:', error.message)
        console.error('エラースタック:', error.stack)
      }
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">社員情報編集</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="社員番号"
                {...register('employee_id')}
                error={errors.employee_id?.message}
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
              />
              
              <Input
                label="名"
                {...register('first_name')}
                error={errors.first_name?.message}
              />
              
              <Input
                label="姓（カナ）"
                {...register('last_name_kana')}
                error={errors.last_name_kana?.message}
              />
              
              <Input
                label="名（カナ）"
                {...register('first_name_kana')}
                error={errors.first_name_kana?.message}
              />
              
              <Input
                label="ローマ字名"
                {...register('roman_name')}
                error={errors.roman_name?.message}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <Input
                label="退職日"
                type="date"
                {...register('resign_date')}
                error={errors.resign_date?.message}
              />
            </div>
          </div>
          
          {/* 連絡先情報 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">連絡先情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="メールアドレス"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
              
              <Input
                label="電話番号"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Input
                label="Gmail"
                type="email"
                {...register('gmail')}
                error={errors.gmail?.message}
              />
              
              <Input
                label="ISメール"
                type="email"
                {...register('is_mail')}
                error={errors.is_mail?.message}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <Input
                label="共通パスワード"
                type="password"
                {...register('common_password')}
                error={errors.common_password?.message}
              />
            </div>
          </div>
          
          {/* 備考 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備考
            </label>
            <textarea
              {...register('remarks')}
              rows={4}
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
              更新
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}