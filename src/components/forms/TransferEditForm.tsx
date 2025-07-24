import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useOrganizations } from '../../hooks/useOrganizations'
import { useUpdateTransfer } from '../../hooks/useTransferHistory'
import { useStaffRankMasterByOrganization } from '../../hooks/useStaffRankMaster'
import type { Organization, TransferHistory } from '../../types'

interface TransferEditFormProps {
  transferHistory: TransferHistory
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  organization_level_1_id: yup.string().optional().nullable().default(''),
  organization_level_2_id: yup.string().optional().nullable().default(''),
  organization_level_3_id: yup.string().optional().nullable().default(''),
  position: yup.string().optional().nullable().default(''),
  staff_rank_master_id: yup.string().optional().nullable().default(''),
  start_date: yup.string().required('開始日は必須です')
})

type FormData = yup.InferType<typeof schema>

export const TransferEditForm: React.FC<TransferEditFormProps> = ({
  transferHistory,
  onClose,
  onSuccess
}) => {
  const [selectedLevel1Id, setSelectedLevel1Id] = useState<string>('')
  const [selectedLevel2Id, setSelectedLevel2Id] = useState<string>('')
  const [selectedLevel3Id, setSelectedLevel3Id] = useState<string>('')
  
  const { data: allOrganizations = [] } = useOrganizations()
  
  // 選択された親組織に基づいて子組織をフィルタリング
  const level1Organizations = allOrganizations.filter((org: Organization) => org.level === 1)
  const level2Organizations = selectedLevel1Id 
    ? allOrganizations.filter((org: Organization) => org.level === 2 && org.parent_id === selectedLevel1Id)
    : []
  const level3Organizations = selectedLevel1Id 
    ? allOrganizations.filter((org: Organization) => {
        if (org.level !== 3) return false
        // 第2階層が選択されている場合は、その第2階層の子組織のみ
        if (selectedLevel2Id) {
          return org.parent_id === selectedLevel2Id
        }
        // 第2階層が選択されていない場合は、第1階層の直接の子組織（第3階層）を表示
        return org.parent_id === selectedLevel1Id
      })
    : []
  const updateTransfer = useUpdateTransfer()
  
  // 選択された組織に基づいてスタッフランクマスターを取得
  const getStaffRankMasterOrganizationId = () => {
    // 第2階層が選択されている場合は第2階層を優先
    if (selectedLevel2Id) {
      return selectedLevel2Id
    }
    // 第3階層が選択されている場合は第3階層を使用（第2階層がない場合）
    if (selectedLevel3Id) {
      return selectedLevel3Id
    }
    // 第1階層が選択されている場合は第1階層を使用
    if (selectedLevel1Id) {
      return selectedLevel1Id
    }
    return ''
  }

  const selectedOrgId = getStaffRankMasterOrganizationId()
  const { data: staffRankMasters } = useStaffRankMasterByOrganization(selectedOrgId)
  
  // デバッグ用ログ
  console.log('TransferEditForm - 選択された組織ID:', {
    selectedLevel1Id,
    selectedLevel2Id,
    selectedLevel3Id,
    selectedOrgId
  })
  console.log('TransferEditForm - スタッフランクマスター:', staffRankMasters)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      organization_level_1_id: transferHistory.organization_level_1_id || '',
      organization_level_2_id: transferHistory.organization_level_2_id || '',
      organization_level_3_id: transferHistory.organization_level_3_id || '',
      position: transferHistory.position || '',
      staff_rank_master_id: transferHistory.staff_rank_master_id || '',
      start_date: transferHistory.start_date
    }
  })

  const watchedLevel1Id = watch('organization_level_1_id')
  const watchedLevel2Id = watch('organization_level_2_id')
  const watchedLevel3Id = watch('organization_level_3_id')

  // 階層1が変更されたときの処理
  useEffect(() => {
    setSelectedLevel1Id(watchedLevel1Id || '')
    if (watchedLevel1Id) {
      setValue('organization_level_2_id', '')
      setValue('organization_level_3_id', '')
      setValue('staff_rank_master_id', '')
    }
  }, [watchedLevel1Id, setValue])

  // 階層2が変更されたときの処理
  useEffect(() => {
    setSelectedLevel2Id(watchedLevel2Id || '')
    if (watchedLevel2Id) {
      setValue('organization_level_3_id', '')
      setValue('staff_rank_master_id', '')
    }
  }, [watchedLevel2Id, setValue])

  // 階層3が変更されたときの処理
  useEffect(() => {
    setSelectedLevel3Id(watchedLevel3Id || '')
    if (watchedLevel3Id) {
      setValue('staff_rank_master_id', '')
    }
  }, [watchedLevel3Id, setValue])

  // 組織が変更されたときにスタッフランクをリセット
  useEffect(() => {
    setValue('staff_rank_master_id', '')
  }, [selectedLevel1Id, selectedLevel2Id, selectedLevel3Id, setValue])

  // フォームの値が変更されたときに状態を即座に更新
  useEffect(() => {
    setSelectedLevel1Id(watchedLevel1Id || '')
  }, [watchedLevel1Id])

  useEffect(() => {
    setSelectedLevel2Id(watchedLevel2Id || '')
  }, [watchedLevel2Id])

  useEffect(() => {
    setSelectedLevel3Id(watchedLevel3Id || '')
  }, [watchedLevel3Id])

  // デバッグ用：watchの値も確認
  console.log('TransferEditForm - watch値:', {
    watchedLevel1Id,
    watchedLevel2Id,
    watchedLevel3Id
  })

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
    ...(staffRankMasters?.map(srm => ({
      value: srm.id,
      label: `${srm.staff_rank} (¥${new Intl.NumberFormat('ja-JP').format(srm.personnel_costs + srm.maintenance_costs + srm.director_cost + srm.ad_costs)})`
    })) || [])
  ]
  
  console.log('TransferEditForm - スタッフランクオプション:', staffRankOptions)

  const onSubmit = async (data: FormData) => {
    try {
      const transferData = {
        organization_level_1_id: data.organization_level_1_id === '' ? undefined : data.organization_level_1_id,
        organization_level_2_id: data.organization_level_2_id === '' ? undefined : data.organization_level_2_id,
        organization_level_3_id: data.organization_level_3_id === '' ? undefined : data.organization_level_3_id,
        position: data.position || '',
        staff_rank_master_id: data.staff_rank_master_id === '' ? undefined : data.staff_rank_master_id,
        start_date: data.start_date
      }
      
      console.log('更新データ:', transferData)
      
      await updateTransfer.mutateAsync({
        id: transferHistory.id,
        ...transferData
      } as any)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('異動記録更新エラー:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">異動記録編集</h2>
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
              label="第一階層（部）"
              {...register('organization_level_1_id')}
              options={[
                { value: '', label: '選択してください' },
                ...level1Organizations.map((org: Organization) => ({
                  value: org.id,
                  label: `${org.name} (${org.type})`
                }))
              ]}
              error={errors.organization_level_1_id?.message}
            />
            
            <Select
              label="第二階層（チーム）"
              {...register('organization_level_2_id')}
              options={[
                { value: '', label: '選択してください' },
                ...level2Organizations.map((org: Organization) => ({
                  value: org.id,
                  label: `${org.name} (${org.type})`
                }))
              ]}
              error={errors.organization_level_2_id?.message}
              disabled={!selectedLevel1Id}
            />
            
            <Select
              label="第三階層（課・店・室）"
              {...register('organization_level_3_id')}
              options={[
                { value: '', label: '選択してください' },
                ...level3Organizations.map((org: Organization) => ({
                  value: org.id,
                  label: `${org.name} (${org.type})`
                }))
              ]}
              error={errors.organization_level_3_id?.message}
              disabled={!selectedLevel1Id}
            />
            
            <Select
              label="役職"
              {...register('position')}
              options={positionOptions}
              error={errors.position?.message}
            />
            
            <Select
              label="スタッフランク"
              {...register('staff_rank_master_id')}
              options={staffRankOptions}
              error={errors.staff_rank_master_id?.message}
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
              更新
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 