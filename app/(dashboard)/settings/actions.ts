"use server"

import { createClient } from "@/lib/supabase/server"
import { getCurrentCompanyId } from "@/lib/supabase/get-company-id"
import { revalidatePath } from "next/cache"
import type { VacationSettingsFormData } from "@/types"

export async function getVacationSettings() {
  try {
    const supabase = await createClient()
    const companyId = await getCurrentCompanyId()

    const { data: settings, error } = await (supabase
      .from("vacation_settings") as any)
      .select("*")
      .eq("company_id", companyId)
      .order("year", { ascending: false })

    if (error) {
      console.error("Error fetching vacation settings:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: settings }
  } catch (error) {
    console.error("Error in getVacationSettings:", error)
    return { success: false, error: "Error inesperado al obtener la configuración", data: [] }
  }
}

export async function upsertVacationSetting(data: VacationSettingsFormData) {
  try {
    const supabase = await createClient()
    const companyId = await getCurrentCompanyId()

    const { data: setting, error } = await (supabase
      .from("vacation_settings") as any)
      .upsert(
        {
          year: data.year,
          default_days: data.default_days,
          company_id: companyId,
        },
        { onConflict: "company_id,year" }
      )
      .select()
      .single()

    if (error) {
      console.error("Error upserting vacation setting:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/settings")
    return { success: true, data: setting }
  } catch (error) {
    console.error("Error in upsertVacationSetting:", error)
    return { success: false, error: "Error inesperado al guardar la configuración" }
  }
}

export async function deleteVacationSetting(id: string) {
  try {
    const supabase = await createClient()
    const companyId = await getCurrentCompanyId()

    const { error } = await (supabase
      .from("vacation_settings") as any)
      .delete()
      .eq("id", id)
      .eq("company_id", companyId)

    if (error) {
      console.error("Error deleting vacation setting:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteVacationSetting:", error)
    return { success: false, error: "Error inesperado al eliminar la configuración" }
  }
}
