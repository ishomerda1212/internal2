import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type EmployeeRow = Database['public']['Tables']['employees']['Row']
type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export interface EmployeeFilters {
  search?: string
  status?: string
  organization_level_1_id?: string
  organization_level_2_id?: string
  organization_level_3_id?: string
}

export interface Employee extends EmployeeRow {
  current_assignment?: {
    id: string
    employee_id: string
    organization_level_1_id?: string | null
    organization_level_2_id?: string | null
    organization_level_3_id?: string | null
    position?: string | null
    staff_rank_master_id?: string | null
    start_date: string
    created_at: string
    updated_at: string
    organization_level_1?: {
      id: string
      name: string
      type: string
      level: number
    } | null
    organization_level_2?: {
      id: string
      name: string
      type: string
      level: number
    } | null
    organization_level_3?: {
      id: string
      name: string
      type: string
      level: number
    } | null
    staff_rank_master?: {
      id: string
      staff_rank: string
      personnel_costs?: number | null
      maintenance_costs?: number | null
      director_cost?: number | null
      ad_costs?: number | null
    } | null
  }
}

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      try {
        // データベースビューから一括取得
        const { data: employees, error } = await supabase
          .from('employees_with_current_assignments')
          .select('*')
          .order('employee_id', { ascending: true })

        if (error) {
          console.error('useEmployees - データ取得エラー:', error)
          throw new Error(`社員データの取得に失敗しました: ${error.message}`)
        }

        console.log('useEmployees - ビューから取得したデータ:', employees)

        if (!employees) {
          return []
        }

        // データを変換してEmployee型に合わせる
        const transformedEmployees = employees.map(emp => {
          console.log(`useEmployees - 社員${emp.employee_id}の変換処理:`, {
            transfer_history_id: emp.transfer_history_id,
            position: emp.position,
            org_level_1_name: emp.org_level_1_name,
            org_level_2_name: emp.org_level_2_name,
            org_level_3_name: emp.org_level_3_name
          })
          
          // 現在の配属先情報を構築
          const currentAssignment = emp.transfer_history_id ? {
            id: emp.transfer_history_id,
            employee_id: emp.id,
            organization_level_1_id: emp.org_level_1_id,
            organization_level_2_id: emp.org_level_2_id,
            organization_level_3_id: emp.org_level_3_id,
            position: emp.position || '',
            staff_rank_master_id: emp.staff_rank_master_id,
            start_date: emp.assignment_start_date,
            end_date: undefined,
            reason: undefined,
            notes: undefined,
            organization_snapshot: undefined,
            created_at: emp.created_at,
            updated_at: emp.updated_at,
            // 組織情報
            organization_level_1: emp.org_level_1_id ? {
              id: emp.org_level_1_id,
              name: emp.org_level_1_name,
              type: emp.org_level_1_type,
              level: emp.org_level_1_level,
              representative_id: undefined,
              parent_id: undefined,
              effective_date: '',
              end_date: undefined,
              is_current: true,
              successor_id: undefined,
              change_type: undefined,
              change_date: undefined,
              created_at: '',
              updated_at: ''
            } : null,
            organization_level_2: emp.org_level_2_id ? {
              id: emp.org_level_2_id,
              name: emp.org_level_2_name,
              type: emp.org_level_2_type,
              level: emp.org_level_2_level,
              representative_id: undefined,
              parent_id: undefined,
              effective_date: '',
              end_date: undefined,
              is_current: true,
              successor_id: undefined,
              change_type: undefined,
              change_date: undefined,
              created_at: '',
              updated_at: ''
            } : null,
            organization_level_3: emp.org_level_3_id ? {
              id: emp.org_level_3_id,
              name: emp.org_level_3_name,
              type: emp.org_level_3_type,
              level: emp.org_level_3_level,
              representative_id: undefined,
              parent_id: undefined,
              effective_date: '',
              end_date: undefined,
              is_current: true,
              successor_id: undefined,
              change_type: undefined,
              change_date: undefined,
              created_at: '',
              updated_at: ''
            } : null,
            // スタッフランク情報
            staff_rank_master: emp.staff_rank_master_id ? {
              id: emp.staff_rank_master_id,
              staff_rank: emp.staff_rank,
              personnel_costs: emp.personnel_costs,
              maintenance_costs: emp.maintenance_costs,
              director_cost: emp.director_cost,
              ad_costs: emp.ad_costs
            } : null
          } : undefined

                      return {
              id: emp.id,
              employee_id: emp.employee_id,
              last_name: emp.last_name,
              first_name: emp.first_name,
              last_name_kana: emp.last_name_kana,
              first_name_kana: emp.first_name_kana,
              roman_name: emp.roman_name,
              gender: emp.gender,
              email: emp.email,
              phone: emp.phone,
              job_type: emp.job_type,
              employment_type: emp.employment_type,
              status: emp.status,
              hire_date: emp.hire_date,
              resign_date: emp.resign_date,
              remarks: emp.remarks,
              created_at: emp.created_at,
              updated_at: emp.updated_at,
              current_assignment: currentAssignment
            }
        })

        // フィルター適用
        let filteredEmployees = transformedEmployees

        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase()
          filteredEmployees = filteredEmployees.filter(emp => {
            const searchableText = [
              emp.last_name,
              emp.first_name,
              emp.employee_id
            ].join(' ').toLowerCase()
            return searchableText.includes(searchTerm)
          })
        }

        if (filters?.status) {
          filteredEmployees = filteredEmployees.filter(emp => emp.status === filters.status)
        }

        // 階層組織フィルタリング
        if (filters?.organization_level_1_id) {
          filteredEmployees = filteredEmployees.filter(emp => 
            emp.current_assignment?.organization_level_1_id === filters.organization_level_1_id
          )
        }

        if (filters?.organization_level_2_id) {
          filteredEmployees = filteredEmployees.filter(emp => 
            emp.current_assignment?.organization_level_2_id === filters.organization_level_2_id
          )
        }

        if (filters?.organization_level_3_id) {
          filteredEmployees = filteredEmployees.filter(emp => 
            emp.current_assignment?.organization_level_3_id === filters.organization_level_3_id
          )
        }

        console.log('useEmployees - 最終結果:', filteredEmployees.length, '件')
        
        // 社員14005のデータを特別に確認
        const employee14005 = filteredEmployees.find(emp => emp.employee_id === '14005')
        if (employee14005) {
          console.log('useEmployees - 社員14005の最終データ:', employee14005)
        }
        
        return filteredEmployees

      } catch (error) {
        console.error('useEmployees - 全体エラー:', error)
        throw error
      }
    }
  })
}

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      // 1. 社員基本情報を取得
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single()

      if (employeeError) {
        throw new Error(`社員データの取得に失敗しました: ${employeeError.message}`)
      }

      if (!employeeData) {
        throw new Error('社員が見つかりません')
      }

      // 2. 最新の異動履歴を取得
      let currentAssignment = undefined
      try {
        let transferData = null
        let transferError = null

        try {
          const { data, error } = await supabase
            .from('transfer_histories')
            .select('*')
            .eq('employee_id', id)
            .order('start_date', { ascending: false })
            .limit(1)
            .single()
          
          transferData = data
          transferError = error
        } catch (error) {
          transferError = error
          console.warn('useEmployee - 異動履歴取得エラー:', error)
        }

        if (!transferError && transferData) {
          // 組織情報を個別に取得
          let orgLevel1 = null
          let orgLevel2 = null
          let orgLevel3 = null
          let staffRankMaster = null

          try {
            if (transferData.organization_level_1_id) {
              try {
                const { data: org1Data } = await supabase
                  .from('organizations')
                  .select('*')
                  .eq('id', transferData.organization_level_1_id)
                  .single()
                orgLevel1 = org1Data
              } catch (org1Error) {
                console.warn('useEmployee - 第一階層組織取得エラー:', org1Error)
              }
            }

            if (transferData.organization_level_2_id) {
              try {
                const { data: org2Data } = await supabase
                  .from('organizations')
                  .select('*')
                  .eq('id', transferData.organization_level_2_id)
                  .single()
                orgLevel2 = org2Data
              } catch (org2Error) {
                console.warn('useEmployee - 第二階層組織取得エラー:', org2Error)
              }
            }

            if (transferData.organization_level_3_id) {
              try {
                const { data: org3Data } = await supabase
                  .from('organizations')
                  .select('*')
                  .eq('id', transferData.organization_level_3_id)
                  .single()
                orgLevel3 = org3Data
              } catch (org3Error) {
                console.warn('useEmployee - 第三階層組織取得エラー:', org3Error)
              }
            }

            // staff_rank_master_idカラムが存在する場合のみ実行
            if (transferData.staff_rank_master_id && 'staff_rank_master_id' in transferData) {
              try {
                const { data: srmData } = await supabase
                  .from('staff_rank_master')
                  .select('*')
                  .eq('id', transferData.staff_rank_master_id)
                  .single()
                staffRankMaster = srmData
              } catch (srmError) {
                console.warn('useEmployee - スタッフランクマスター取得エラー:', srmError)
              }
            }
          } catch (orgError) {
            console.warn('useEmployee - 組織情報取得エラー:', orgError)
          }

          currentAssignment = {
            id: transferData.id,
            employee_id: employeeData.id,
            organization_level_1_id: transferData.organization_level_1_id,
            organization_level_2_id: transferData.organization_level_2_id,
            organization_level_3_id: transferData.organization_level_3_id,
            position: transferData.position,
            staff_rank_master_id: transferData.staff_rank_master_id || undefined,
            start_date: transferData.start_date,
            created_at: transferData.created_at,
            updated_at: transferData.updated_at,
            organization_level_1: orgLevel1,
            organization_level_2: orgLevel2,
            organization_level_3: orgLevel3,
            staff_rank_master: staffRankMaster
          }
        }
      } catch (error) {
        console.warn('useEmployee - 異動履歴処理エラー:', error)
      }

                   return {
        ...employeeData,
        current_assignment: currentAssignment
      }
    }
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employee: EmployeeInsert) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single()

      if (error) {
        throw new Error(`社員の作成に失敗しました: ${error.message}`)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...employee }: EmployeeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`社員の更新に失敗しました: ${error.message}`)
      }

      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] })
    }
  })
}

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`社員の削除に失敗しました: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}