export interface Organization {
  id: string
  name: string
  level: number
  type: '部' | 'チーム' | '課' | '店舗' | '室'
  representative_id?: string
  parent_id?: string
  effective_date: string
  end_date?: string
  is_current: boolean
  successor_id?: string
  change_type?: string
  change_date?: string
  created_at: string
  updated_at: string
  children?: Organization[]
  representative?: Employee
  employee_count?: number
  parent?: Organization
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
  gmail?: string
  is_mail?: string
  common_password?: string
  remarks?: string
  created_at: string
  updated_at: string
  current_assignment?: TransferHistory
}

export interface TransferHistory {
  id: string
  employee_id: string
  organization_level_1_id?: string
  organization_level_2_id?: string
  organization_level_3_id?: string
  position: string
  staff_rank_master_id?: string
  start_date: string
  end_date?: string
  reason?: string
  notes?: string
  organization_snapshot?: unknown
  created_at: string
  updated_at: string
  organization_level_1?: Organization
  organization_level_2?: Organization
  organization_level_3?: Organization
  employee?: Employee
  staff_rank_master?: StaffRankMaster
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

export interface StaffRankMaster {
  id: string
  staff_rank: string
  organization_id: string
  personnel_costs: number
  maintenance_costs: number
  director_cost: number
  ad_costs: number
  effective_date: string
  end_date?: string
  is_current: boolean
  created_at: string
  updated_at: string
  organization?: Organization
}