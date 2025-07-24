import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          level: number
          type: string
          representative_id: string | null
          parent_id: string | null
          effective_date: string
          end_date: string | null
          is_current: boolean
          successor_id: string | null
          change_type: string | null
          change_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          level: number
          type: string
          representative_id?: string | null
          parent_id?: string | null
          effective_date?: string
          end_date?: string | null
          is_current?: boolean
          successor_id?: string | null
          change_type?: string | null
          change_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: number
          type?: string
          representative_id?: string | null
          parent_id?: string | null
          effective_date?: string
          end_date?: string | null
          is_current?: boolean
          successor_id?: string | null
          change_type?: string | null
          change_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      staff_rank_master: {
        Row: {
          id: string
          staff_rank: string
          organization_id: string
          personnel_costs: number
          maintenance_costs: number
          director_cost: number
          ad_costs: number
          effective_date: string
          end_date: string | null
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_rank: string
          organization_id: string
          personnel_costs: number
          maintenance_costs: number
          director_cost: number
          ad_costs: number
          effective_date?: string
          end_date?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_rank?: string
          organization_id?: string
          personnel_costs?: number
          maintenance_costs?: number
          director_cost?: number
          ad_costs?: number
          effective_date?: string
          end_date?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
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
          status: string
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
        }
        Insert: {
          employee_id: string
          last_name: string
          first_name: string
          last_name_kana: string
          first_name_kana: string
          roman_name?: string
          job_type?: string
          employment_type?: string
          gender?: string
          status?: string
          hire_date?: string
          resign_date?: string
          email?: string
          phone?: string
          gmail?: string
          is_mail?: string
          common_password?: string
        }
        Update: {
          employee_id?: string
          last_name?: string
          first_name?: string
          last_name_kana?: string
          first_name_kana?: string
          roman_name?: string
          job_type?: string
          employment_type?: string
          gender?: string
          status?: string
          hire_date?: string
          resign_date?: string
          email?: string
          phone?: string
          gmail?: string
          is_mail?: string
          common_password?: string
          remarks?: string
        }
      }
      transfer_histories: {
        Row: {
          id: string
          employee_id: string
          organization_id: string
          position: string | null
          staff_rank: string | null
          transfer_type: string
          start_date: string
          organization_snapshot: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          employee_id: string
          organization_id: string
          position?: string | null
          staff_rank?: string | null
          transfer_type?: string
          start_date: string
          organization_snapshot?: any | null
        }
        Update: {
          employee_id?: string
          organization_id?: string
          position?: string | null
          staff_rank?: string | null
          transfer_type?: string
          start_date?: string
          organization_snapshot?: any | null
        }
      }
      employees_with_current_assignment: {
        Row: {
          id: string
          employee_id: string
          last_name: string
          first_name: string
          last_name_kana: string | null
          first_name_kana: string | null
          roman_name: string | null
          gender: string | null
          gmail: string | null
          is_mail: string | null
          common_password: string | null
          phone: string | null
          hire_date: string | null
          resign_date: string | null
          job_type: string | null
          employment_type: string | null
          status: string
          created_at: string
          updated_at: string
          current_assignment_id: string | null
          current_position: string | null
          current_staff_rank: string | null
          current_assignment_start_date: string | null
          current_organization_id: string | null
          current_organization_name: string | null
          current_organization_level: number | null
          current_organization_type: string | null
        }
        Insert: never
        Update: never
      }
    }
  }
}