export interface Organization {
  id: string
  name: string
  level: number
  type: string
  representative_id?: string
  parent_id?: string
  created_at: string
  updated_at: string
  children?: Organization[]
  representative?: Employee
  employee_count?: number
}

export interface Employee {
  id: string
  employee_id: string
  last_name: string
  first_name: string
  last_name_kana: string
  first_name_kana: string
  roman_name?: string
  job_type?: string
  employment_type?: string
  gender?: string
  status: 'upcoming' | 'active' | 'resigned'
  hire_date?: string
  resign_date?: string
  email?: string
  phone?: string
  remarks?: string
  created_at: string
  updated_at: string
  current_assignment?: TransferHistory
}

export interface TransferHistory {
  id: string
  employee_id: string
  organization_id: string
  position: string
  staff_rank?: string
  start_date: string
  end_date?: string
  transfer_type: 'hire' | 'transfer' | 'promotion' | 'demotion' | 'lateral'
  reason?: string
  notes?: string
  created_at: string
  updated_at: string
  organization?: Organization
  employee?: Employee
}

export interface EmployeeFilters {
  search?: string
  status?: string
  job_type?: string
  employment_type?: string
  organization_id?: string
}

export interface User {
  id: string
  email: string
  role: 'hr' | 'manager' | 'employee'
}

export interface CompanyCar {
  id: string
  vehicle_number_1: string
  vehicle_number_2?: string
  vehicle_number_3?: string
  car_model: string
  lease_company: string
  gas_card?: string
  etc_card?: string
  contract_date: string
  expiry_date: string
  lease_remaining_days: number
  assigned_store: string
  vehicle_registration?: string
  maintenance_card?: string
  created_at: string
  updated_at: string
  current_user?: Employee
}

export interface CarUsageHistory {
  id: string
  car_id: string
  employee_id: string
  start_date: string
  end_date?: string
  purpose?: string
  notes?: string
  created_at: string
  updated_at: string
  car?: CompanyCar
  employee?: Employee
}