import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Employee, EmployeeFilters } from '../types'
import type { Database } from '../lib/supabase'

type EmployeeRow = Database['public']['Tables']['employees']['Row']
type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      console.log('useEmployees - 開始:', { filters })
      
      try {
        // 基本的な社員データを取得
        let query = supabase
          .from('employees')
          .select('*')
          .order('employee_id', { ascending: true })

        const { data: employeesData, error: employeesError } = await query

        if (employeesError) {
          console.error('useEmployees - 社員データ取得エラー:', employeesError)
          throw new Error(`社員データの取得に失敗しました: ${employeesError.message}`)
        }

        console.log('useEmployees - 基本社員データ取得:', employeesData?.length || 0, '件')

        // 各社員の最新の異動履歴を取得（エラーハンドリングを強化）
        const employees: Employee[] = await Promise.all(
          (employeesData || []).map(async (emp) => {
            try {
              // 最新の異動履歴を取得（シンプルなクエリから開始）
              const { data: transferData, error: transferError } = await supabase
                .from('transfer_histories')
                .select('*')
                .eq('employee_id', emp.id)
                .order('start_date', { ascending: false })
                .limit(1)
                .single()

              console.log(`useEmployees - 社員${emp.employee_id}の異動履歴:`, transferData)

              let currentAssignment = undefined
              
              if (!transferError && transferData) {
                // 組織情報を個別に取得
                let orgLevel1 = null
                let orgLevel2 = null
                let orgLevel3 = null
                let staffRankMaster = null

                try {
                  if (transferData.organization_level_1_id) {
                    const { data: org1Data } = await supabase
                      .from('organizations')
                      .select('*')
                      .eq('id', transferData.organization_level_1_id)
                      .single()
                    orgLevel1 = org1Data
                    console.log(`useEmployees - 社員${emp.employee_id}の第一階層組織:`, org1Data)
                  }

                  if (transferData.organization_level_2_id) {
                    const { data: org2Data } = await supabase
                      .from('organizations')
                      .select('*')
                      .eq('id', transferData.organization_level_2_id)
                      .single()
                    orgLevel2 = org2Data
                    console.log(`useEmployees - 社員${emp.employee_id}の第二階層組織:`, org2Data)
                  }

                  if (transferData.organization_level_3_id) {
                    const { data: org3Data } = await supabase
                      .from('organizations')
                      .select('*')
                      .eq('id', transferData.organization_level_3_id)
                      .single()
                    orgLevel3 = org3Data
                    console.log(`useEmployees - 社員${emp.employee_id}の第三階層組織:`, org3Data)
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
                      console.warn(`useEmployees - スタッフランクマスター取得エラー (社員${emp.employee_id}):`, srmError)
                    }
                  }
                } catch (orgError) {
                  console.warn(`useEmployees - 組織情報取得エラー (社員${emp.employee_id}):`, orgError)
                }

                currentAssignment = {
                  id: transferData.id,
                  employee_id: emp.id,
                  organization_level_1_id: transferData.organization_level_1_id,
                  organization_level_2_id: transferData.organization_level_2_id,
                  organization_level_3_id: transferData.organization_level_3_id,
                  position: transferData.position,
                  staff_rank_master_id: transferData.staff_rank_master_id || undefined,
                  start_date: transferData.start_date,
                  transfer_type: transferData.transfer_type,
                  created_at: transferData.created_at,
                  updated_at: transferData.updated_at,
                  organization_level_1: orgLevel1,
                  organization_level_2: orgLevel2,
                  organization_level_3: orgLevel3,
                  staff_rank_master: staffRankMaster
                }
              }

              // フィルター適用
              let shouldInclude = true
              
              if (filters?.search) {
                const searchTerm = filters.search.toLowerCase()
                const searchableText = [
                  emp.last_name,
                  emp.first_name,
                  emp.employee_id
                ].join(' ').toLowerCase()
                shouldInclude = searchableText.includes(searchTerm)
              }

              if (shouldInclude && filters?.status) {
                shouldInclude = emp.status === filters.status
              }

              if (shouldInclude && filters?.job_type) {
                shouldInclude = emp.job_type === filters.job_type
              }

              if (shouldInclude && filters?.employment_type) {
                shouldInclude = emp.employment_type === filters.employment_type
              }

              if (shouldInclude && filters?.organization_id) {
                const currentOrgId = currentAssignment?.organization_level_3_id || 
                                   currentAssignment?.organization_level_2_id || 
                                   currentAssignment?.organization_level_1_id
                shouldInclude = currentOrgId === filters.organization_id
              }

              if (!shouldInclude) {
                return null
              }

              return {
                id: emp.id,
                employee_id: emp.employee_id,
                last_name: emp.last_name,
                first_name: emp.first_name,
                last_name_kana: emp.last_name_kana,
                first_name_kana: emp.first_name_kana,
                roman_name: emp.roman_name,
                job_type: emp.job_type,
                employment_type: emp.employment_type,
                gender: emp.gender,
                status: emp.status,
                hire_date: emp.hire_date,
                resign_date: emp.resign_date,
                phone: emp.phone,
                gmail: emp.gmail,
                is_mail: emp.is_mail,
                common_password: emp.common_password,
                created_at: emp.created_at,
                updated_at: emp.updated_at,
                current_assignment: currentAssignment
              }
            } catch (error) {
              console.error(`useEmployees - 社員${emp.employee_id}の処理エラー:`, error)
              // エラーが発生しても社員データは返す（current_assignmentはundefined）
              return {
                ...emp,
                current_assignment: undefined
              }
            }
          })
        )

        // nullを除外してフィルタリング
        const filteredEmployees = employees.filter(Boolean) as Employee[]
        
        console.log('useEmployees - 最終結果:', filteredEmployees.length, '件')
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
        const { data: transferData, error: transferError } = await supabase
          .from('transfer_histories')
          .select('*')
          .eq('employee_id', id)
          .order('start_date', { ascending: false })
          .limit(1)
          .single()

        if (!transferError && transferData) {
          // 組織情報を個別に取得
          let orgLevel1 = null
          let orgLevel2 = null
          let orgLevel3 = null
          let staffRankMaster = null

          try {
            if (transferData.organization_level_1_id) {
              const { data: org1Data } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', transferData.organization_level_1_id)
                .single()
              orgLevel1 = org1Data
            }

            if (transferData.organization_level_2_id) {
              const { data: org2Data } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', transferData.organization_level_2_id)
                .single()
              orgLevel2 = org2Data
            }

            if (transferData.organization_level_3_id) {
              const { data: org3Data } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', transferData.organization_level_3_id)
                .single()
              orgLevel3 = org3Data
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
            ...transferData,
            organization_level_1: orgLevel1,
            organization_level_2: orgLevel2,
            organization_level_3: orgLevel3,
            staff_rank_master: staffRankMaster
          }
        }
      } catch (error) {
        console.log('useEmployee - 異動履歴取得エラー:', error)
      }

      // Transform data to match Employee type
      const employee: Employee = {
        ...employeeData,
        current_assignment: currentAssignment || undefined
      }

      // デバッグ用: 取得したデータを確認
      console.log('useEmployee - employee data:', employeeData)
      console.log('useEmployee - current assignment:', currentAssignment)
      console.log('useEmployee - final employee:', employee)

      return employee
    },
    enabled: !!id
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: EmployeeInsert) => {
      const { data: newEmployee, error } = await supabase
        .from('employees')
        .insert(data)
        .select()
        .single()

      if (error) {
        throw new Error(`社員の作成に失敗しました: ${error.message}`)
      }

      return newEmployee
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: EmployeeUpdate & { id: string }) => {
      console.log('useUpdateEmployee - 更新開始:', { id, data })
      console.log('useUpdateEmployee - 更新データ（JSON）:', JSON.stringify(data, null, 2))
      
      const { data: updatedEmployee, error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      console.log('useUpdateEmployee - Supabase結果:', { updatedEmployee, error })
      console.log('useUpdateEmployee - Supabase結果（JSON）:', JSON.stringify({ updatedEmployee, error }, null, 2))

      if (error) {
        console.error('useUpdateEmployee - エラー詳細:', error)
        throw new Error(`社員の更新に失敗しました: ${error.message}`)
      }

      console.log('useUpdateEmployee - 更新成功:', updatedEmployee)
      console.log('useUpdateEmployee - 更新成功（JSON）:', JSON.stringify(updatedEmployee, null, 2))
      return updatedEmployee
    },
    onSuccess: (updatedEmployee) => {
      console.log('useUpdateEmployee - キャッシュ無効化')
      // 社員一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      // 個別の社員データのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['employees', updatedEmployee.id] })
      // 特定の社員IDのキャッシュを更新（current_assignmentを含める）
      const updatedEmployeeWithAssignment = {
        ...updatedEmployee,
        current_assignment: undefined // 一時的にundefinedに設定
      }
      queryClient.setQueryData(['employees', updatedEmployee.id], updatedEmployeeWithAssignment)
    },
    onError: (error) => {
      console.error('useUpdateEmployee - ミューテーションエラー:', error)
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

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}