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
        .from('employees')
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

      // TODO: organization_id filter will be implemented when transfer_history is properly linked
      // if (filters?.organization_id) {
      //   query = query.eq('transfer_history.organization_id', filters.organization_id)
      // }

      const { data, error } = await query

      if (error) {
        throw new Error(`社員データの取得に失敗しました: ${error.message}`)
      }

      // Transform data to match Employee type
      const employees: Employee[] = (data || []).map(emp => ({
        ...emp,
        current_assignment: undefined // TODO: Will be implemented when transfer_history is properly linked
      }))

      return employees
    }
  })
}

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      // 社員基本情報を取得
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

      // 現在の所属情報を取得（end_dateがnullまたは未来の日付の最新レコード）
      // 一時的にtransfer_historyの取得を無効化
      let currentAssignment = undefined
      // TODO: transfer_historyテーブルが作成されたら有効化

      // Transform data to match Employee type
      const employee: Employee = {
        ...employeeData,
        current_assignment: currentAssignment || undefined
      }

      // デバッグ用: 取得したデータを確認
      console.log('useEmployee - raw data:', employeeData)
      console.log('useEmployee - current assignment:', currentAssignment)
      console.log('useEmployee - transformed employee:', employee)

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