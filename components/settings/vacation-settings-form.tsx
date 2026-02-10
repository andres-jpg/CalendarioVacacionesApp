"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { upsertVacationSetting } from "@/app/(dashboard)/settings/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { VacationSettings } from "@/types"

const vacationSettingsSchema = z.object({
  year: z
    .number()
    .min(2020, "El año debe ser 2020 o posterior")
    .max(2060, "El año debe ser 2060 o anterior"),
  default_days: z
    .number()
    .min(1, "Debe ser al menos 1 día")
    .max(365, "No puede superar 365 días"),
})

type VacationSettingsFormValues = z.infer<typeof vacationSettingsSchema>

interface VacationSettingsFormProps {
  initialData?: VacationSettings
  onCancel: () => void
  onSuccess: () => void
}

export function VacationSettingsForm({ initialData, onCancel, onSuccess }: VacationSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VacationSettingsFormValues>({
    resolver: zodResolver(vacationSettingsSchema),
    defaultValues: {
      year: initialData?.year ?? new Date().getFullYear(),
      default_days: initialData?.default_days ?? 22,
    },
  })

  async function onSubmit(data: VacationSettingsFormValues) {
    setIsSubmitting(true)

    try {
      const result = await upsertVacationSetting(data)

      if (result.success) {
        toast.success(
          isEditing
            ? `Configuración del año ${data.year} actualizada`
            : `Configuración del año ${data.year} creada`
        )
        router.refresh()
        onSuccess()
      } else {
        toast.error(result.error || "Error al guardar la configuración")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al guardar la configuración")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-3 p-4 border border-border rounded-lg bg-accent/30">
      <div className="flex-1 w-full sm:w-auto">
        <Label htmlFor="year">Año</Label>
        <Input
          id="year"
          type="number"
          {...register("year", { valueAsNumber: true })}
          disabled={isEditing}
          className="mt-1"
        />
        {errors.year && (
          <p className="text-sm text-destructive mt-1">{errors.year.message}</p>
        )}
      </div>
      <div className="flex-1 w-full sm:w-auto">
        <Label htmlFor="default_days">Días por defecto</Label>
        <Input
          id="default_days"
          type="number"
          {...register("default_days", { valueAsNumber: true })}
          className="mt-1"
        />
        {errors.default_days && (
          <p className="text-sm text-destructive mt-1">{errors.default_days.message}</p>
        )}
      </div>
      <div className="flex gap-2 pt-0 sm:pt-6">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
