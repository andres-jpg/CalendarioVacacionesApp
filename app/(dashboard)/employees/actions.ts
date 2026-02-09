"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { EmployeeFormData, EmployeeInsert } from "@/types"

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

    const { data: employee, error } = await (supabase
      .from("employees") as any)
      .insert([employeeData])
      .select()
      .single()

    if (error) {
      console.error("Error creating employee:", error)
      return {
        success: false,
        error: error.message
      }
    }

    // Calcular y crear el balance de vacaciones para el año actual
    const currentYear = new Date().getFullYear()
    const hireDate = new Date(data.hire_date)

    // Obtener la configuración de días de vacaciones para el año actual
    const { data: settings } = await (supabase
      .from("vacation_settings") as any)
      .select("default_days")
      .eq("year", currentYear)
      .single()

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
