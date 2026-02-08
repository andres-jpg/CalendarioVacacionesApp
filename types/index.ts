import type { Database } from '@/lib/supabase/database.types';

// Tipos extraídos de las tablas de Supabase
export type Employee = Database['public']['Tables']['employees']['Row'];
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];

export type VacationSettings = Database['public']['Tables']['vacation_settings']['Row'];
export type VacationSettingsInsert = Database['public']['Tables']['vacation_settings']['Insert'];
export type VacationSettingsUpdate = Database['public']['Tables']['vacation_settings']['Update'];

export type VacationDay = Database['public']['Tables']['vacation_days']['Row'];
export type VacationDayInsert = Database['public']['Tables']['vacation_days']['Insert'];
export type VacationDayUpdate = Database['public']['Tables']['vacation_days']['Update'];

export type VacationBalance = Database['public']['Tables']['vacation_balance']['Row'];
export type VacationBalanceInsert = Database['public']['Tables']['vacation_balance']['Insert'];
export type VacationBalanceUpdate = Database['public']['Tables']['vacation_balance']['Update'];

// Tipos de datos compuestos para vistas
export interface EmployeeWithBalance {
  employee: Employee;
  balance: VacationBalance | null;
  daysTaken: number;
  availableDays: number;
}

export interface VacationSummary {
  employeeId: string;
  employeeName: string;
  year: number;
  daysFromPreviousYear: number;
  daysCurrentYear: number;
  daysTaken: number;
  availableDays: number;
}

// Tipos para formularios
export interface EmployeeFormData {
  full_name: string;
  email?: string;
  hire_date: string;
  is_active: boolean;
}

export interface VacationSettingsFormData {
  year: number;
  default_days: number;
}

export interface VacationBalanceFormData {
  employee_id: string;
  year: number;
  days_from_previous_year: number;
  days_current_year: number;
}

// Tipos para calendario
export interface CalendarDay {
  date: Date;
  vacations: VacationDay[];
  isCurrentMonth: boolean;
}

export interface EmployeeColor {
  employeeId: string;
  employeeName: string;
  color: string;
}
