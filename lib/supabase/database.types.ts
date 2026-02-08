export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          full_name: string
          email: string | null
          hire_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          hire_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          hire_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vacation_settings: {
        Row: {
          id: string
          year: number
          default_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year: number
          default_days: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year?: number
          default_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      vacation_days: {
        Row: {
          id: string
          employee_id: string
          date: string
          observations: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          observations?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          observations?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vacation_balance: {
        Row: {
          id: string
          employee_id: string
          year: number
          days_from_previous_year: number
          days_current_year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          year: number
          days_from_previous_year?: number
          days_current_year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          year?: number
          days_from_previous_year?: number
          days_current_year?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
