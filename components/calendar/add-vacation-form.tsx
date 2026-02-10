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
  const [isLoadingEmployee, startLoadingEmployee] = useTransition()
  const [isSaving, startSaving] = useTransition()

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setNewSelectedDates([])

    startLoadingEmployee(async () => {
      // Cargar días existentes y balance en paralelo
      const [daysResult, summaryResult] = await Promise.all([
        getEmployeeVacationDays(employeeId, currentYear),
        getEmployeesVacationSummary(currentYear),
      ])

      if (daysResult.success) {
        setExistingDates(daysResult.data.map((d) => new Date(d + "T00:00:00")))
      }

      if (summaryResult.success) {
        const empSummary = summaryResult.data.find((s) => s.employeeId === employeeId)
        setAvailableDays(empSummary?.availableDays ?? 0)
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

  const handleSave = () => {
    if (!selectedEmployeeId || newSelectedDates.length === 0) return

    startSaving(async () => {
      const dates = newSelectedDates.map((d) => toISODate(d))
      const result = await addVacationDays(selectedEmployeeId, dates)

      if (result.success) {
        toast.success(`Se registraron ${dates.length} día(s) de vacaciones`)
        setNewSelectedDates([])
        // Recargar días existentes y balance en paralelo (async-parallel)
        const [daysResult, summaryResult] = await Promise.all([
          getEmployeeVacationDays(selectedEmployeeId, currentYear),
          getEmployeesVacationSummary(currentYear),
        ])
        if (daysResult.success) {
          setExistingDates(daysResult.data.map((d) => new Date(d + "T00:00:00")))
        }
        if (summaryResult.success) {
          const empSummary = summaryResult.data.find((s) => s.employeeId === selectedEmployeeId)
          setAvailableDays(empSummary?.availableDays ?? 0)
        }
        router.refresh()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    })
  }

  const allSelected = [...existingDates, ...newSelectedDates]
  const canSave = newSelectedDates.length > 0 && newSelectedDates.length <= availableDays

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

          <div className="overflow-x-auto">
            <Calendar
              locale={es}
              mode="multiple"
              selected={allSelected}
              onDayClick={handleDayClick}
              numberOfMonths={12}
              defaultMonth={new Date(currentYear, 0)}
              startMonth={new Date(currentYear, 0)}
              endMonth={new Date(currentYear, 11)}
              disabled={[{ dayOfWeek: [0, 6] }]}
              modifiers={{
                existing: existingDates,
              }}
              modifiersClassNames={{
                existing: "opacity-60 cursor-not-allowed",
              }}
              className="[--cell-size:--spacing(8)]"
              classNames={{
                months: "flex flex-wrap gap-4",
                month: "w-auto",
              }}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleSave}
              disabled={!canSave || isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar vacaciones"}
            </Button>
            {newSelectedDates.length > 0 ? (
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
