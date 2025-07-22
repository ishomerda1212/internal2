import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useOrganizations } from '../../hooks/useOrganizations'
import { useUpdateCompanyCar } from '../../hooks/useCompanyCars'
import type { Organization, CompanyCar } from '../../types'

interface CompanyCarEditFormProps {
  car: CompanyCar
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  vehicle_number_1: yup.string().required('車両番号1は必須です'),
  vehicle_number_2: yup.string().optional(),
  vehicle_number_3: yup.string().optional(),
  car_model: yup.string().required('車種は必須です'),
  lease_company: yup.string().required('リース会社は必須です'),
  gas_card: yup.string().optional(),
  etc_card: yup.string().optional(),
  contract_date: yup.string().required('契約日は必須です'),
  expiry_date: yup.string().required('満了日は必須です'),
  assigned_store: yup.string().required('配置店舗は必須です'),
  vehicle_registration: yup.string().optional(),
  maintenance_card: yup.string().optional()
})

type FormData = yup.InferType<typeof schema>

export const CompanyCarEditForm: React.FC<CompanyCarEditFormProps> = ({
  car,
  onClose,
  onSuccess
}) => {
  const { data: organizations = [] } = useOrganizations()
  const updateCompanyCar = useUpdateCompanyCar()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      vehicle_number_1: car.vehicle_number_1,
      vehicle_number_2: car.vehicle_number_2 || '',
      vehicle_number_3: car.vehicle_number_3 || '',
      car_model: car.car_model,
      lease_company: car.lease_company,
      gas_card: car.gas_card || '',
      etc_card: car.etc_card || '',
      contract_date: car.contract_date,
      expiry_date: car.expiry_date,
      assigned_store: car.assigned_store,
      vehicle_registration: car.vehicle_registration || '',
      maintenance_card: car.maintenance_card || ''
    }
  })
  
  const contractDate = watch('contract_date')
  const expiryDate = watch('expiry_date')
  
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
  const storeOptions = [
    { value: '', label: '選択してください' },
    ...flatOrgs.map(org => ({
      value: org.name,
      label: org.name
    }))
  ]
  
  const leaseCompanyOptions = [
    { value: '', label: '選択してください' },
    { value: 'オリックス自動車', label: 'オリックス自動車' },
    { value: 'トヨタファイナンス', label: 'トヨタファイナンス' },
    { value: 'ニッサンファイナンス', label: 'ニッサンファイナンス' },
    { value: 'ホンダファイナンス', label: 'ホンダファイナンス' },
    { value: 'その他', label: 'その他' }
  ]
  
  const gasCardOptions = [
    { value: '', label: '選択してください' },
    { value: 'ENEOS', label: 'ENEOS' },
    { value: 'Shell', label: 'Shell' },
    { value: 'コスモ石油', label: 'コスモ石油' },
    { value: 'その他', label: 'その他' }
  ]
  
  // リース残日数を計算
  const calculateRemainingDays = (contractDate: string, expiryDate: string) => {
    if (!contractDate || !expiryDate) return 0
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }
  
  const onSubmit = async (data: FormData) => {
    try {
      const remainingDays = calculateRemainingDays(data.contract_date, data.expiry_date)
      
      await updateCompanyCar.mutateAsync({
        id: car.id,
        vehicle_number_1: data.vehicle_number_1,
        vehicle_number_2: data.vehicle_number_2 || undefined,
        vehicle_number_3: data.vehicle_number_3 || undefined,
        car_model: data.car_model,
        lease_company: data.lease_company,
        gas_card: data.gas_card || undefined,
        etc_card: data.etc_card || undefined,
        contract_date: data.contract_date,
        expiry_date: data.expiry_date,
        lease_remaining_days: remainingDays,
        assigned_store: data.assigned_store,
        vehicle_registration: data.vehicle_registration || undefined,
        maintenance_card: data.maintenance_card || undefined
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('社用車更新エラー:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">車両情報編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* 車両情報 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">車両情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="車両番号1"
                {...register('vehicle_number_1')}
                error={errors.vehicle_number_1?.message}
              />
              
              <Input
                label="車両番号2"
                {...register('vehicle_number_2')}
                error={errors.vehicle_number_2?.message}
              />
              
              <Input
                label="車両番号3"
                {...register('vehicle_number_3')}
                error={errors.vehicle_number_3?.message}
              />
              
              <Input
                label="車種"
                {...register('car_model')}
                error={errors.car_model?.message}
              />
              
              <Select
                label="配置店舗"
                {...register('assigned_store')}
                options={storeOptions}
                error={errors.assigned_store?.message}
              />
            </div>
          </div>
          
          {/* リース情報 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">リース情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="リース会社"
                {...register('lease_company')}
                options={leaseCompanyOptions}
                error={errors.lease_company?.message}
              />
              
              <Input
                label="契約日"
                type="date"
                {...register('contract_date')}
                error={errors.contract_date?.message}
              />
              
              <Input
                label="満了日"
                type="date"
                {...register('expiry_date')}
                error={errors.expiry_date?.message}
              />
              
              {contractDate && expiryDate && (
                <div className="flex items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">リース残日数: </span>
                    <span className="text-orange-600 font-semibold">
                      {calculateRemainingDays(contractDate, expiryDate)}日
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* カード情報 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">カード情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="ガソリンカード"
                {...register('gas_card')}
                options={gasCardOptions}
                error={errors.gas_card?.message}
              />
              
              <Input
                label="ETCカード"
                {...register('etc_card')}
                error={errors.etc_card?.message}
              />
            </div>
          </div>
          
          {/* その他 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">その他</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="車検証"
                {...register('vehicle_registration')}
                error={errors.vehicle_registration?.message}
              />
              
              <Input
                label="メンテナンスカード"
                {...register('maintenance_card')}
                error={errors.maintenance_card?.message}
              />
            </div>
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