"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { EmployeeFormData, EmployeeInsert, VacationSummary } from "@/types"
import { calculateAccruedToDate } from "@/lib/utils/vacation-calculator"

export interface SingleEmployeeExportData {
  employee: { id: string; full_name: string; email: string | null; hire_date: string }
  summary: VacationSummary
  vacationDates: string[]
  comments: { id: string; text: string }[]
}

export async function getEmployeeExportData(
  employeeId: string,
  year: number
): Promise<{ success: boolean; error?: string; data: SingleEmployeeExportData | null }> {
  try {
    const supabase = await createClient()

    const [empResult, balanceResult, daysResult, commentsResult] = await Promise.all([
      (supabase.from("employees") as any)
        .select("id, full_name, email, hire_date")
        .eq("id", employeeId)
        .single(),
      (supabase.from("vacation_balance") as any)
        .select("days_from_previous_year, days_current_year")
        .eq("employee_id", employeeId)
        .eq("year", year)
        .single(),
      (supabase.from("vacation_days") as any)
        .select("date")
        .eq("employee_id", employeeId)
        .gte("date", `${year}-01-01`)
        .lte("date", `${year}-12-31`)
        .order("date"),
      (supabase.from("comments") as any)
        .select("id, text")
        .eq("employee_id", employeeId)
        .eq("year", year),
    ])

    if (empResult.error) {
      return { success: false, error: empResult.error.message, data: null }
    }

    const employee = empResult.data
    const balance = balanceResult.data
    const daysFromPreviousYear = balance?.days_from_previous_year ?? 0
    const daysCurrentYear = balance?.days_current_year ?? 0
    const vacationDates: string[] = (daysResult.data || []).map((d: any) => d.date)
    const daysTaken = vacationDates.length
    const comments: { id: string; text: string }[] = commentsResult.data || []

    const hireDate = employee.hire_date
      ? new Date(employee.hire_date + "T00:00:00")
      : new Date(year, 0, 1)
    const today = new Date()
    const accruedToDate = calculateAccruedToDate(hireDate, year, daysCurrentYear, today)
    const availableToday = daysFromPreviousYear + accruedToDate - daysTaken

    const summary: VacationSummary = {
      employeeId,
      employeeName: employee.full_name,
      year,
      daysFromPreviousYear,
      daysCurrentYear,
      daysTaken,
      availableDays: daysFromPreviousYear + daysCurrentYear - daysTaken,
      accruedToDate,
      availableToday,
    }

    return { success: true, data: { employee, summary, vacationDates, comments } }
  } catch (error) {
    console.error("Error in getEmployeeExportData:", error)
    return { success: false, error: "Error inesperado al obtener datos de exportación", data: null }
  }
}

export async function createEmployee(data: EmployeeFormData) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "No autenticado"
      }
    }

    // Crear el empleado
    const employeeData: EmployeeInsert = {
      full_name: data.full_name,
      email: data.email || null,
      hire_date: data.hire_date,
      is_active: data.is_active ?? true,
    }

    const currentYear = new Date().getFullYear()
    const hireDate = new Date(data.hire_date)

    // Insertar empleado y obtener configuración de vacaciones en paralelo
    const [employeeResult, settingsResult] = await Promise.all([
      (supabase.from("employees") as any)
        .insert([employeeData])
        .select()
        .single(),
      (supabase.from("vacation_settings") as any)
        .select("default_days")
        .eq("year", currentYear)
        .single(),
    ])

    const { data: employee, error } = employeeResult
    if (error) {
      console.error("Error creating employee:", error)
      return {
        success: false,
        error: error.message
      }
    }

    const { data: settings } = settingsResult

    if (settings) {
      // Calcular días proporcionales si ingresó durante el año actual
      let daysCurrentYear = settings.default_days

      if (hireDate.getFullYear() === currentYear) {
        const startOfYear = new Date(currentYear, 0, 1)
        const endOfYear = new Date(currentYear, 11, 31)
        const daysInYear = Math.ceil((endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const daysWorked = Math.ceil((endOfYear.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

        daysCurrentYear = (settings.default_days / daysInYear) * daysWorked
      }

      // Crear el balance de vacaciones
      await (supabase
        .from("vacation_balance") as any)
        .insert({
          employee_id: employee.id,
          year: currentYear,
          days_from_previous_year: 0,
          days_current_year: daysCurrentYear,
        })
    }

    // Revalidar la página de empleados
    revalidatePath("/employees")

    return {
      success: true,
      data: employee
    }
  } catch (error) {
    console.error("Error in createEmployee:", error)
    return {
      success: false,
      error: "Error inesperado al crear el empleado"
    }
  }
}

export async function getEmployees(onlyActive = true) {
  try {
    const supabase = await createClient()

    let query = (supabase.from("employees") as any).select("*")

    if (onlyActive) {
      query = query.eq("is_active", true)
    }

    const { data: employees, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching employees:", error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }

    return {
      success: true,
      data: employees
    }
  } catch (error) {
    console.error("Error in getEmployees:", error)
    return {
      success: false,
      error: "Error inesperado al obtener empleados",
      data: []
    }
  }
}

export async function getEmployee(employeeId: string) {
  try {
    const supabase = await createClient()

    const { data: employee, error } = await (supabase
      .from("employees") as any)
      .select("*")
      .eq("id", employeeId)
      .single()

    if (error) {
      console.error("Error fetching employee:", error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: employee
    }
  } catch (error) {
    console.error("Error in getEmployee:", error)
    return {
      success: false,
      error: "Error inesperado al obtener el empleado",
      data: null
    }
  }
}

export async function updateEmployee(employeeId: string, data: EmployeeFormData) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "No autenticado"
      }
    }

    // Actualizar el empleado
    const { data: employee, error } = await (supabase
      .from("employees") as any)
      .update({
        full_name: data.full_name,
        email: data.email || null,
        hire_date: data.hire_date,
      })
      .eq("id", employeeId)
      .select()
      .single()

    if (error) {
      console.error("Error updating employee:", error)
      return {
        success: false,
        error: error.message
      }
    }

    // Revalidar la página de empleados
    revalidatePath("/employees")
    revalidatePath(`/employees/${employeeId}`)

    return {
      success: true,
      data: employee
    }
  } catch (error) {
    console.error("Error in updateEmployee:", error)
    return {
      success: false,
      error: "Error inesperado al actualizar el empleado"
    }
  }
}

export interface SimulationResult {
  found: boolean
  targetDate: string
  targetYear: number
  daysFromPreviousYear: number
  accruedByDate: number
  daysTaken: number
  projectedAvailable: number
}

export async function simulateVacationBalance(
  employeeId: string,
  targetDate: string
): Promise<{ success: boolean; error?: string; data: SimulationResult | null }> {
  try {
    const supabase = await createClient()
    const targetDateObj = new Date(targetDate + "T00:00:00")
    const targetYear = targetDateObj.getFullYear()

    const [balanceResult, empResult] = await Promise.all([
      (supabase.from("vacation_balance") as any)
        .select("days_from_previous_year, days_current_year")
        .eq("employee_id", employeeId)
        .eq("year", targetYear)
        .maybeSingle(),
      (supabase.from("employees") as any)
        .select("hire_date")
        .eq("id", employeeId)
        .single(),
    ])

    if (empResult.error) {
      return { success: false, error: empResult.error.message, data: null }
    }

    if (!balanceResult.data) {
      return {
        success: true,
        data: {
          found: false,
          targetDate,
          targetYear,
          daysFromPreviousYear: 0,
          accruedByDate: 0,
          daysTaken: 0,
          projectedAvailable: 0,
        },
      }
    }

    const { days_from_previous_year: daysFromPreviousYear, days_current_year: daysCurrentYear } = balanceResult.data

    const { count: daysTaken } = await (supabase.from("vacation_days") as any)
      .select("id", { count: "exact", head: true })
      .eq("employee_id", employeeId)
      .gte("date", `${targetYear}-01-01`)
      .lte("date", targetDate)

    const hireDate = empResult.data.hire_date
      ? new Date(empResult.data.hire_date + "T00:00:00")
      : new Date(targetYear, 0, 1)

    const accruedByDate = calculateAccruedToDate(hireDate, targetYear, daysCurrentYear, targetDateObj)
    const projectedAvailable = daysFromPreviousYear + accruedByDate - (daysTaken ?? 0)

    return {
      success: true,
      data: {
        found: true,
        targetDate,
        targetYear,
        daysFromPreviousYear,
        accruedByDate,
        daysTaken: daysTaken ?? 0,
        projectedAvailable,
      },
    }
  } catch (error) {
    console.error("Error in simulateVacationBalance:", error)
    return { success: false, error: "Error inesperado al simular el balance", data: null }
  }
}

export async function deactivateEmployee(employeeId: string) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "No autenticado"
      }
    }

    // Actualizar el empleado a inactivo
    const { error } = await (supabase
      .from("employees") as any)
      .update({ is_active: false })
      .eq("id", employeeId)

    if (error) {
      console.error("Error deactivating employee:", error)
      return {
        success: false,
        error: error.message
      }
    }

    // Revalidar la página de empleados
    revalidatePath("/employees")

    return {
      success: true
    }
  } catch (error) {
    console.error("Error in deactivateEmployee:", error)
    return {
      success: false,
      error: "Error inesperado al dar de baja al empleado"
    }
  }
}
