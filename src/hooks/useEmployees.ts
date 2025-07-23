import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockEmployees } from '../data/mockData'
import type { Employee, EmployeeFilters } from '../types'

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredEmployees = [...mockEmployees]
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredEmployees = filteredEmployees.filter(emp => 
          emp.last_name.toLowerCase().includes(searchTerm) ||
          emp.first_name.toLowerCase().includes(searchTerm) ||
          emp.employee_id.toLowerCase().includes(searchTerm)
        )
      }
      
      if (filters?.status) {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === filters.status)
      }
      
      if (filters?.job_type) {
        filteredEmployees = filteredEmployees.filter(emp => emp.job_type === filters.job_type)
      }
      
      if (filters?.employment_type) {
        filteredEmployees = filteredEmployees.filter(emp => emp.employment_type === filters.employment_type)
      }
      
      if (filters?.organization_id) {
        filteredEmployees = filteredEmployees.filter(emp => 
          emp.current_assignment?.organization_id === filters.organization_id
        )
      }
      
      return filteredEmployees
    }
  })
}

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const employee = mockEmployees.find(emp => emp.id === id)
      if (!employee) {
        throw new Error('Employee not found')
      }
      
      return employee
    },
    enabled: !!id
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Employee>) => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ...data, id: Math.random().toString() } as Employee
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Employee> & { id: string }) => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ...data, id } as Employee
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}