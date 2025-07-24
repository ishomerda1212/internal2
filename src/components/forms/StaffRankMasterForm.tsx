import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useOrganizationsForStaffRankMaster } from '../../hooks/useOrganizations'
import { useCreateStaffRankMaster, useUpdateStaffRankMaster } from '../../hooks/useStaffRankMaster'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import type { StaffRankMaster } from '../../types'

const schema = yup.object({
  staff_rank: yup.string().required('スタッフランクは必須です'),
  organization_id: yup.string().required('組織は必須です'),
  personnel_costs: yup.number().required('人件費は必須です').min(0, '0以上で入力してください'),
  maintenance_costs: yup.number().required('経費保守費は必須です').min(0, '0以上で入力してください'),
  director_cost: yup.number().required('ディレクター費は必須です').min(0, '0以上で入力してください'),
  ad_costs: yup.number().required('広告費は必須です').min(0, '0以上で入力してください'),
  effective_date: yup.string().required('適用開始日は必須です'),
  end_date: yup.string().optional(),
  is_current: yup.boolean().required()
}).required()

interface StaffRankMasterFormProps {
  staffRankMaster?: StaffRankMaster
  onCancel: () => void
  onSuccess?: () => void
}

export const StaffRankMasterForm: React.FC<StaffRankMasterFormProps> = ({
  staffRankMaster,
  onCancel,
  onSuccess
}) => {
  const { data: organizations } = useOrganizationsForStaffRankMaster()
  const createMutation = useCreateStaffRankMaster()
  const updateMutation = useUpdateStaffRankMaster()

  // 組織を階層別にグループ化
  const groupedOrganizations = useMemo(() => {
    if (!organizations) return []
    
    const departments = organizations.filter(org => org.level === 1)
    const teams = organizations.filter(org => org.level === 2)
    
    return [
      ...departments.map(org => ({
        value: org.id,
        label: `部: ${org.name}`,
        group: 'departments'
      })),
      ...teams.map(org => ({
        value: org.id,
        label: `チーム: ${org.name}`,
        group: 'teams'
      }))
    ]
  }, [organizations])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: staffRankMaster ? {
      staff_rank: staffRankMaster.staff_rank,
      organization_id: staffRankMaster.organization_id,
      personnel_costs: staffRankMaster.personnel_costs,
      maintenance_costs: staffRankMaster.maintenance_costs,
      director_cost: staffRankMaster.director_cost,
      ad_costs: staffRankMaster.ad_costs,
      effective_date: staffRankMaster.effective_date,
      end_date: staffRankMaster.end_date || undefined,
      is_current: staffRankMaster.is_current
    } : {
      staff_rank: '',
      organization_id: '',
      personnel_costs: 0,
      maintenance_costs: 0,
      director_cost: 0,
      ad_costs: 0,
      effective_date: new Date().toISOString().split('T')[0],
      end_date: undefined,
      is_current: true
    }
  })

  const watchedValues = watch()
  const totalCost = watchedValues.personnel_costs + watchedValues.maintenance_costs + watchedValues.director_cost + watchedValues.ad_costs

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    try {
      // 空文字列の日付をundefinedに変換
      const processedData = {
        ...data,
        end_date: data.end_date === '' || data.end_date === undefined ? undefined : data.end_date
      }

      if (staffRankMaster) {
        await updateMutation.mutateAsync({
          id: staffRankMaster.id,
          ...processedData
        })
      } else {
        await createMutation.mutateAsync(processedData)
      }
      onSuccess?.()
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>戻る</span>
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {staffRankMaster ? 'スタッフランクマスター編集' : 'スタッフランクマスター追加'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">基本情報</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    組織 *
                  </label>
                  <Select
                    {...register('organization_id')}
                    error={errors.organization_id?.message}
                    options={[
                      { value: '', label: '組織を選択' },
                      ...groupedOrganizations
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    スタッフランク *
                  </label>
                  <Input
                    {...register('staff_rank')}
                    placeholder="例: A, B, C, S"
                    error={errors.staff_rank?.message}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      適用開始日 *
                    </label>
                    <Input
                      type="date"
                      {...register('effective_date')}
                      error={errors.effective_date?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      適用終了日
                    </label>
                    <Input
                      type="date"
                      {...register('end_date')}
                      error={errors.end_date?.message}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('is_current')}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">現在有効</span>
                  </label>
                </div>
              </div>

              {/* コスト情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">コスト設定</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    人件費 *
                  </label>
                  <Input
                    type="number"
                    {...register('personnel_costs', { valueAsNumber: true })}
                    placeholder="0"
                    error={errors.personnel_costs?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    経費保守費 *
                  </label>
                  <Input
                    type="number"
                    {...register('maintenance_costs', { valueAsNumber: true })}
                    placeholder="0"
                    error={errors.maintenance_costs?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ディレクター費 *
                  </label>
                  <Input
                    type="number"
                    {...register('director_cost', { valueAsNumber: true })}
                    placeholder="0"
                    error={errors.director_cost?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    広告費 *
                  </label>
                  <Input
                    type="number"
                    {...register('ad_costs', { valueAsNumber: true })}
                    placeholder="0"
                    error={errors.ad_costs?.message}
                  />
                </div>
              </div>
            </div>

            {/* 合計コスト表示 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">合計コスト</span>
                <span className="text-2xl font-bold text-orange-600">
                  ¥{formatCurrency(totalCost)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                人件費: ¥{formatCurrency(watchedValues.personnel_costs || 0)} + 
                経費保守費: ¥{formatCurrency(watchedValues.maintenance_costs || 0)} + 
                ディレクター費: ¥{formatCurrency(watchedValues.director_cost || 0)} + 
                広告費: ¥{formatCurrency(watchedValues.ad_costs || 0)}
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : staffRankMaster ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{staffRankMaster ? '更新' : '追加'}</span>
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
} 