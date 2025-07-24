import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockCompanyCars, mockCarUsageHistory, mockEmployees } from '../data/mockData'
import type { CompanyCar } from '../types'

export const useCompanyCars = () => {
  return useQuery({
    queryKey: ['company-cars'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockCompanyCars
    }
  })
}

export const useCompanyCar = (id: string) => {
  return useQuery({
    queryKey: ['company-cars', id],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const car = mockCompanyCars.find(car => car.id === id)
      if (!car) {
        throw new Error('Company car not found')
      }
      
      return car
    },
    enabled: !!id
  })
}

export const useCarUsageHistory = (carId?: string) => {
  return useQuery({
    queryKey: ['car-usage-history', carId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let history = [...mockCarUsageHistory]
      
      if (carId) {
        history = history.filter(h => h.car_id === carId)
      }
      
      // Add employee data
      const historyWithEmployee = history.map(h => {
        const employee = mockEmployees.find(emp => emp.id === h.employee_id)
        return { ...h, employee }
      })
      
      return historyWithEmployee.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    },
    enabled: !!carId
  })
}

export const useCreateCompanyCar = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<CompanyCar>) => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ...data, id: Math.random().toString() } as CompanyCar
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-cars'] })
    }
  })
}

export const useUpdateCompanyCar = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CompanyCar> & { id: string }) => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ...data, id } as CompanyCar
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-cars'] })
    }
  })
}