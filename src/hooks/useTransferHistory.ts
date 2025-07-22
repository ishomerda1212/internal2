import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockTransferHistory, mockOrganizations } from '../data/mockData'
import type { TransferHistory } from '../types'

export const useTransferHistory = (employeeId?: string) => {
  return useQuery({
    queryKey: ['transfer-history', employeeId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let history = [...mockTransferHistory]
      
      if (employeeId) {
        history = history.filter(th => th.employee_id === employeeId)
      }
      
      // Add organization data
      const historyWithOrg = history.map(th => {
        const findOrgInTree = (orgs: any[], id: string): any => {
          for (const org of orgs) {
            if (org.id === id) return org
            if (org.children) {
              const found = findOrgInTree(org.children, id)
              if (found) return found
            }
          }
          return null
        }
        
        const organization = findOrgInTree(mockOrganizations, th.organization_id)
        return { ...th, organization }
      })
      
      return historyWithOrg.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    },
    enabled: !!employeeId
  })
}

export const useCreateTransfer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<TransferHistory>) => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ...data, id: Math.random().toString() } as TransferHistory
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-history'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })
}