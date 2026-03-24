import { createClient } from "@/lib/supabase/server"

/**
 * Returns the company_id for the currently authenticated user.
 * Throws if the user is not authenticated or has no user_profile row.
 * Call this at the top of any Server Action that needs tenant scoping.
 */
export async function getCurrentCompanyId(): Promise<string> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("No autenticado")
  }

  const { data: profile, error: profileError } = await (supabase
    .from("user_profiles") as any)
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.company_id) {
    throw new Error("Perfil de empresa no encontrado")
  }

  return profile.company_id as string
}
