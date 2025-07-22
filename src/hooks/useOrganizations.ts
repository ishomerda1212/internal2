import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockOrganizations } from '../data/mockData'
import type { Organization } from '../types'

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockOrganizations
    }
  })
}

export const useOrganizationTree = () => {
  return useQuery({
    queryKey: ['organizations', 'tree'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockOrganizations
    }
  })
}

export const useCreateOrganization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Organization>) => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ...data, id: Math.random().toString() } as Organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    }
  })
}

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Organization> & { id: string }) => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ...data, id } as Organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    }
  })
}