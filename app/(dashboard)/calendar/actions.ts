"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { VacationSummary } from "@/types"
import { toISODate } from "@/lib/utils/date-helpers"
import { calculateAccruedToDate } from "@/lib/utils/vacation-calculator"

export async function getEmployeesVacationSummary(year: number): Promise<{
  success: boolean
  error?: string
  data: VacationSummary[]
}> {
  try {
    const supabase = await createClient()

    // Obtener empleados activos
    const { data: employees, error: empError } = await (supabase
      .from("employees") as any)
      .select("id, full_name, hire_date")
      .eq("is_active", true)
      .order("full_name")

    if (empError) {
      console.error("Error fetching employees:", empError)
      return { success: false, error: empError.message, data: [] }
    }

    if (!employees || employees.length === 0) {
      return { success: true, data: [] }
    }

    const employeeIds = employees.map((e: any) => e.id)

    // Obtener balances y días de vacaciones en paralelo
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const [balancesResult, vacationDaysResult] = await Promise.all([
      (supabase.from("vacation_balance") as any)
        .select("employee_id, days_from_previous_year, days_current_year")
        .eq("year", year)
        .in("employee_id", employeeIds),
      (supabase.from("vacation_days") as any)
        .select("employee_id")
        .gte("date", startDate)
        .lte("date", endDate)
        .in("employee_id", employeeIds),
    ])

    const { data: balances, error: balError } = balancesResult
    if (balError) {
      console.error("Error fetching balances:", balError)
      return { success: false, error: balError.message, data: [] }
    }

    const { data: vacationDays, error: vdError } = vacationDaysResult
    if (vdError) {
      console.error("Error fetching vacation days:", vdError)
      return { success: false, error: vdError.message, data: [] }
    }

    // Contar días tomados por empleado
    const daysTakenMap: Record<string, number> = {}
    for (const vd of vacationDays || []) {
      daysTakenMap[vd.employee_id] = (daysTakenMap[vd.employee_id] || 0) + 1
    }

    // Mapear balances por empleado
    const balanceMap: Record<string, { days_from_previous_year: number; days_current_year: number }> = {}
    for (const b of balances || []) {
      balanceMap[b.employee_id] = {
        days_from_previous_year: b.days_from_previous_year,
        days_current_year: b.days_current_year,
      }
    }

    // Construir resumen
    const today = new Date()
    const summary: VacationSummary[] = employees.map((emp: any) => {
      const balance = balanceMap[emp.id]
      const daysFromPreviousYear = balance?.days_from_previous_year ?? 0
      const daysCurrentYear = balance?.days_current_year ?? 0
      const daysTaken = daysTakenMap[emp.id] ?? 0

      const hireDate = emp.hire_date ? new Date(emp.hire_date + "T00:00:00") : new Date(year, 0, 1)
      const accruedToDate = calculateAccruedToDate(hireDate, year, daysCurrentYear, today)
      const availableToday = daysFromPreviousYear + accruedToDate - daysTaken

      return {
        employeeId: emp.id,
        employeeName: emp.full_name,
        year,
        daysFromPreviousYear,
        daysCurrentYear,
        daysTaken,
        availableDays: daysFromPreviousYear + daysCurrentYear - daysTaken,
        accruedToDate,
        availableToday,
      }
    })

    return { success: true, data: summary }
  } catch (error) {
    console.error("Error in getEmployeesVacationSummary:", error)
    return {
      success: false,
      error: "Error inesperado al obtener el resumen de vacaciones",
      data: [],
    }
  }
}

export async function getHolidaysByYear(year: number): Promise<{
  success: boolean
  error?: string
  data: { date: string; name: string; type: 'nacional' | 'autonomico' | 'local' }[]
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from("holidays") as any)
      .select("date, name, type")
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`)
      .order("date")

    if (error) {
      console.error("Error fetching holidays:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error in getHolidaysByYear:", error)
    return { success: false, error: "Error inesperado", data: [] }
  }
}

export async function getActiveEmployees(): Promise<{
  success: boolean
  error?: string
  data: { id: string; full_name: string }[]
}> {
  try {
    const supabase = await createClient()

    const { data: employees, error } = await (supabase
      .from("employees") as any)
      .select("id, full_name")
      .eq("is_active", true)
      .order("full_name")

    if (error) {
      console.error("Error fetching active employees:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: employees || [] }
  } catch (error) {
    console.error("Error in getActiveEmployees:", error)
    return { success: false, error: "Error inesperado", data: [] }
  }
}

export async function getEmployeeVacationDays(
  employeeId: string,
  year: number
): Promise<{
  success: boolean
  error?: string
  data: string[]
}> {
  try {
    const supabase = await createClient()

    const { data: days, error } = await (supabase
      .from("vacation_days") as any)
      .select("date")
      .eq("employee_id", employeeId)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`)
      .order("date")

    if (error) {
      console.error("Error fetching vacation days:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: (days || []).map((d: any) => d.date) }
  } catch (error) {
    console.error("Error in getEmployeeVacationDays:", error)
    return { success: false, error: "Error inesperado", data: [] }
  }
}

export async function addVacationDays(
  employeeId: string,
  dates: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "No autenticado" }
    }

    if (!dates.length) {
      return { success: false, error: "No se seleccionaron días" }
    }

    // Agrupar fechas por año para validar cada año por separado
    const byYear = new Map<number, string[]>()
    for (const date of dates) {
      const y = parseInt(date.substring(0, 4), 10)
      byYear.set(y, [...(byYear.get(y) ?? []), date])
    }
    const years = [...byYear.keys()]

    // Obtener balances y días existentes de todos los años en paralelo
    const [balancesResult, ...existingResults] = await Promise.all([
      (supabase.from("vacation_balance") as any)
        .select("year, days_from_previous_year, days_current_year")
        .eq("employee_id", employeeId)
        .in("year", years),
      ...years.map((y) =>
        (supabase.from("vacation_days") as any)
          .select("id")
          .eq("employee_id", employeeId)
          .gte("date", `${y}-01-01`)
          .lte("date", `${y}-12-31`)
      ),
    ])

    const { data: balances, error: balError } = balancesResult
    if (balError) {
      console.error("Error fetching balances:", balError)
      return { success: false, error: balError.message }
    }

    // Mapear días existentes por año
    const existingByYear = new Map<number, number>()
    for (let i = 0; i < years.length; i++) {
      const { data: existingDays, error: existError } = existingResults[i]
      if (existError) {
        console.error("Error fetching existing days:", existError)
        return { success: false, error: existError.message }
      }
      existingByYear.set(years[i], existingDays?.length ?? 0)
    }

    // Validar con cascada: el excedente de años anteriores cubre el déficit de años posteriores.
    // Ej: 3 días sobrantes en 2026 + 0 en 2027 → se pueden seleccionar 2 en dic-2026 y 1 en ene-2027.
    const sortedYears = [...byYear.keys()].sort((a, b) => a - b)
    let surplus = 0

    for (const y of sortedYears) {
      const balance = (balances ?? []).find((b: any) => b.year === y)
      const totalAvailable = (balance?.days_from_previous_year ?? 0) + (balance?.days_current_year ?? 0)
      const daysTaken = existingByYear.get(y) ?? 0
      const available = totalAvailable - daysTaken
      const requesting = byYear.get(y)!.length
      const diff = available - requesting

      if (diff >= 0) {
        surplus += diff
      } else if (surplus + diff >= 0) {
        surplus += diff
      } else {
        const totalAvailableWithSurplus = Math.round(surplus + available)
        return {
          success: false,
          error: `Sin días suficientes. Disponibles: ${totalAvailableWithSurplus}, solicitados para ${y}: ${requesting}`,
        }
      }
    }

    // Insertar todos los días
    const rows = dates.map((date) => ({ employee_id: employeeId, date }))

    const { error: insertError } = await (supabase
      .from("vacation_days") as any)
      .upsert(rows, { onConflict: "employee_id,date", ignoreDuplicates: true })

    if (insertError) {
      console.error("Error inserting vacation days:", insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath("/calendar")
    return { success: true }
  } catch (error) {
    console.error("Error in addVacationDays:", error)
    return { success: false, error: "Error inesperado al guardar los días de vacaciones" }
  }
}

export async function getEmployeeComments(
  employeeId: string,
  year: number
): Promise<{
  success: boolean
  error?: string
  data: { id: string; text: string }[]
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from("comments") as any)
      .select("id, text")
      .eq("employee_id", employeeId)
      .eq("year", year)

    if (error) {
      console.error("Error fetching comments:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error in getEmployeeComments:", error)
    return { success: false, error: "Error inesperado", data: [] }
  }
}

export async function addComment(
  employeeId: string,
  text: string,
  year: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "No autenticado" }
    }

    const date = toISODate(new Date())

    const { error: insertError } = await (supabase
      .from("comments") as any)
      .insert({ employee_id: employeeId, text, date, year })

    if (insertError) {
      console.error("Error inserting comment:", insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath("/calendar")
    return { success: true }
  } catch (error) {
    console.error("Error in addComment:", error)
    return { success: false, error: "Error inesperado al guardar el comentario" }
  }
}
