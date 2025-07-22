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
          representative_id?: string
          parent_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          level: number
          type: string
          representative_id?: string
          parent_id?: string
        }
        Update: {
          name?: string
          level?: number
          type?: string
          representative_id?: string
          parent_id?: string
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
          email?: string
          phone?: string
        }
        Update: {
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
          remarks?: string
        }
      }
      transfer_history: {
        Row: {
          id: string
          employee_id: string
          organization_id: string
          position: string
          staff_rank?: string
          start_date: string
          end_date?: string
          transfer_type: string
          reason?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          employee_id: string
          organization_id: string
          position: string
          staff_rank?: string
          start_date: string
          end_date?: string
          transfer_type: string
          reason?: string
          notes?: string
        }
        Update: {
          organization_id?: string
          position?: string
          staff_rank?: string
          start_date?: string
          end_date?: string
          transfer_type?: string
          reason?: string
          notes?: string
        }
      }
    }
  }
}