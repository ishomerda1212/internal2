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
      let query = supabase
        .from('employees_with_current_assignment')
        .select('*')
        .order('employee_id', { ascending: true })

      // Apply filters
      if (filters?.search) {
        const searchTerm = filters.search
        query = query.or(`last_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.job_type) {
        query = query.eq('job_type', filters.job_type)
      }

      if (filters?.employment_type) {
        query = query.eq('employment_type', filters.employment_type)
      }

      if (filters?.organization_id) {
        query = query.eq('current_organization_id', filters.organization_id)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`社員データの取得に失敗しました: ${error.message}`)
      }

      // Transform data to match Employee type
      const employees: Employee[] = (data || []).map((emp) => {
        let currentAssignment = undefined
        
        if (emp.current_organization_id && emp.current_position) {
          currentAssignment = {
            id: emp.current_assignment_id,
            employee_id: emp.id,
            organization_id: emp.current_organization_id,
            position: emp.current_position,
            staff_rank: emp.current_staff_rank,
            start_date: emp.current_assignment_start_date,
            transfer_type: 'transfer' as const,
            created_at: emp.created_at,
            updated_at: emp.updated_at,
            organization: {
              id: emp.current_organization_id,
              name: emp.current_organization_name,
              level: emp.current_organization_level,
              type: emp.current_organization_type,
              created_at: emp.created_at,
              updated_at: emp.updated_at
            }
          }
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
      })

      return employees
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
          // 3. 組織情報を取得
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', transferData.organization_id)
            .single()

          if (!orgError && orgData) {
            currentAssignment = {
              ...transferData,
              organization: orgData
            }
          } else {
            console.log('useEmployee - 組織情報取得エラー:', orgError)
            currentAssignment = transferData
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