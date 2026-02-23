"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toISODate } from "@/lib/utils/date-helpers"
import {
  getEmployeeVacationDays,
  getEmployeesVacationSummary,
  addVacationDays,
  addComment,
  getEmployeeComments,
} from "@/app/(dashboard)/calendar/actions"
import { es } from "date-fns/locale"

interface AddVacationFormProps {
  employees: { id: string; full_name: string }[]
}

export function AddVacationForm({ employees }: AddVacationFormProps) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [existingDates, setExistingDates] = useState<Date[]>([])
  const [newSelectedDates, setNewSelectedDates] = useState<Date[]>([])
  const [availableDays, setAvailableDays] = useState(0)
  const [comentario, setComentario] = useState("")
  const [comments, setComments] = useState<{ id: string; text: string }[]>([])
  const [isLoadingEmployee, startLoadingEmployee] = useTransition()
  const [isSaving, startSaving] = useTransition()

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setNewSelectedDates([])
    setComments([])

    startLoadingEmployee(async () => {
      const [daysResult, summaryResult, commentsResult] = await Promise.all([
        getEmployeeVacationDays(employeeId, currentYear),
        getEmployeesVacationSummary(currentYear),
        getEmployeeComments(employeeId, currentYear),
      ])

      if (daysResult.success) {
        setExistingDates(daysResult.data.map((d) => new Date(d + "T00:00:00")))
      }

      if (summaryResult.success) {
        const empSummary = summaryResult.data.find((s) => s.employeeId === employeeId)
        setAvailableDays(empSummary?.availableDays ?? 0)
      }

      if (commentsResult.success) {
        setComments(commentsResult.data)
      }
    })
  }

  // Set para lookups O(1) en lugar de .some() O(n) (js-set-map-lookups)
  const existingDatesSet = useMemo(
    () => new Set(existingDates.map((d) => toISODate(d))),
    [existingDates]
  )

  const handleDayClick = (day: Date) => {
    const dayOfWeek = day.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return

    const iso = toISODate(day)
    if (existingDatesSet.has(iso)) return

    setNewSelectedDates((prev) => {
      const exists = prev.some((d) => toISODate(d) === iso)
      return exists
        ? prev.filter((d) => toISODate(d) !== iso)
        : [...prev, day]
    })
  }

  const reloadEmployeeData = async () => {
    const [daysResult, summaryResult, commentsResult] = await Promise.all([
      getEmployeeVacationDays(selectedEmployeeId, currentYear),
      getEmployeesVacationSummary(currentYear),
      getEmployeeComments(selectedEmployeeId, currentYear),
    ])
    if (daysResult.success) {
      setExistingDates(daysResult.data.map((d) => new Date(d + "T00:00:00")))
    }
    if (summaryResult.success) {
      const empSummary = summaryResult.data.find((s) => s.employeeId === selectedEmployeeId)
      setAvailableDays(empSummary?.availableDays ?? 0)
    }
    if (commentsResult.success) {
      setComments(commentsResult.data)
    }
  }

  const handleSave = () => {
    if (!selectedEmployeeId) return

    startSaving(async () => {
      const hasDays = newSelectedDates.length > 0
      const hasComentario = comentario.trim().length > 0

      if (hasDays) {
        const dates = newSelectedDates.map((d) => toISODate(d))
        const result = await addVacationDays(selectedEmployeeId, dates)

        if (!result.success) {
          toast.error(result.error || "Error al guardar los días")
          return
        }

        toast.success(`Se registraron ${dates.length} día(s) de vacaciones`)
        setNewSelectedDates([])
      }

      if (hasComentario) {
        const result = await addComment(selectedEmployeeId, comentario.trim(), currentYear)
        if (!result.success) {
          toast.error(result.error || "Error al guardar el comentario")
          return
        }
        toast.success("Comentario guardado")
        setComentario("")
      }

      await reloadEmployeeData()
      router.refresh()
    })
  }

  const canSaveDays = newSelectedDates.length > 0 && newSelectedDates.length <= availableDays
  const canSaveComentario = comentario.trim().length > 0
  const hasDaysSelected = newSelectedDates.length > 0

  return (
    <div className="space-y-4">
      <Select value={selectedEmployeeId} onValueChange={handleEmployeeChange}>
        <SelectTrigger className="max-w-sm">
          <SelectValue placeholder="Seleccionar empleado..." />
        </SelectTrigger>
        <SelectContent>
          {employees.map((emp) => (
            <SelectItem key={emp.id} value={emp.id}>
              {emp.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedEmployeeId && (
        <div className={cn(isLoadingEmployee && "opacity-50")}>
          <div className="flex items-center gap-4 mb-4 text-sm">
            <span>
              Días nuevos seleccionados:{" "}
              <strong className={cn(newSelectedDates.length > availableDays && "text-destructive")}>
                {newSelectedDates.length}
              </strong>
            </span>
            <span>
              Días disponibles: <strong>{Math.round(availableDays)}</strong>
            </span>
          </div>

          {comments.length > 0 && (
            <div className="mb-6 space-y-2 max-w-lg">
              <p className="text-sm font-medium">Observaciones del año</p>
              <ul className="space-y-2">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                    {c.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="overflow-x-auto">
            <Calendar
              locale={es}
              mode="multiple"
              selected={existingDates}
              onDayClick={handleDayClick}
              numberOfMonths={12}
              defaultMonth={new Date(currentYear, 0)}
              startMonth={new Date(currentYear, 0)}
              endMonth={new Date(currentYear, 11)}
              disabled={[{ dayOfWeek: [0, 6] }, ...existingDates]}
              modifiers={{
                existing: existingDates,
                newSelected: newSelectedDates,
              }}
              modifiersClassNames={{
                existing: "!bg-yellow-400 !text-black !opacity-100 cursor-not-allowed font-medium",
                newSelected: "!bg-red-500 !text-black !rounded-md font-semibold",
              }}
              className="[--cell-size:--spacing(8)]"
              classNames={{
                months: "flex flex-wrap gap-4",
                month: "w-auto",
              }}
            />
          </div>

          <div className="mt-6 space-y-2 max-w-lg">
            <label htmlFor="observaciones" className="text-sm font-medium">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe un comentario o nota sobre estas vacaciones..."
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-3 mt-4">
            {hasDaysSelected ? (
              <Button
                onClick={handleSave}
                disabled={!canSaveDays || isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar vacaciones"}
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={!canSaveComentario || isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar comentario"}
              </Button>
            )}
            {hasDaysSelected ? (
              <Button variant="outline" onClick={() => setNewSelectedDates([])}>
                Limpiar selección
              </Button>
            ) : null}
          </div>

          {newSelectedDates.length > availableDays ? (
            <p className="text-sm text-destructive mt-2">
              Ha seleccionado más días de los disponibles ({Math.round(availableDays)} días disponibles)
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
