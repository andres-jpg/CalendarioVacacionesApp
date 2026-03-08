"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
  holidays: { date: string; name: string; type: 'nacional' | 'autonomico' | 'local' }[]
}

export function AddVacationForm({ employees, holidays }: AddVacationFormProps) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const [calendarYear, setCalendarYear] = useState(currentYear)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [existingDates, setExistingDates] = useState<Date[]>([])
  const [newSelectedDates, setNewSelectedDates] = useState<Date[]>([])
  const [availableDays, setAvailableDays] = useState(0)
  const [availableByYear, setAvailableByYear] = useState<Record<number, number>>({})
  const [comentario, setComentario] = useState("")
  const [comments, setComments] = useState<{ id: string; text: string }[]>([])
  const [isLoadingEmployee, startLoadingEmployee] = useTransition()
  const [isSaving, startSaving] = useTransition()

  const loadEmployeeData = (employeeId: string, year: number) => {
    startLoadingEmployee(async () => {
      const [daysResult, summaryResult, commentsResult] = await Promise.all([
        getEmployeeVacationDays(employeeId, year),
        getEmployeesVacationSummary(year),
        getEmployeeComments(employeeId, year),
      ])

      if (daysResult.success) {
        setExistingDates(daysResult.data.map((d) => new Date(d + "T00:00:00")))
      }

      if (summaryResult.success) {
        const empSummary = summaryResult.data.find((s) => s.employeeId === employeeId)
        const days = empSummary?.availableDays ?? 0
        setAvailableDays(days)
        setAvailableByYear((prev) => ({ ...prev, [year]: days }))
      }

      if (commentsResult.success) {
        setComments(commentsResult.data)
      }
    })
  }

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setNewSelectedDates([])
    setAvailableByYear({})
    setComments([])
    loadEmployeeData(employeeId, calendarYear)
  }

  const handleYearChange = (direction: -1 | 1) => {
    const nextYear = calendarYear + direction
    if (nextYear < currentYear || nextYear > currentYear + 1) return
    setCalendarYear(nextYear)
    if (selectedEmployeeId) {
      setComments([])
      loadEmployeeData(selectedEmployeeId, nextYear)
    }
  }

  const holidayNacional = useMemo(
    () => holidays.filter(h => h.type === 'nacional').map(h => new Date(h.date + 'T00:00:00')),
    [holidays]
  )
  const holidayAutonomico = useMemo(
    () => holidays.filter(h => h.type === 'autonomico').map(h => new Date(h.date + 'T00:00:00')),
    [holidays]
  )
  const holidayLocal = useMemo(
    () => holidays.filter(h => h.type === 'local').map(h => new Date(h.date + 'T00:00:00')),
    [holidays]
  )
  const allHolidays = useMemo(
    () => [...holidayNacional, ...holidayAutonomico, ...holidayLocal],
    [holidayNacional, holidayAutonomico, holidayLocal]
  )
  const holidaysSet = useMemo(
    () => new Set(holidays.map(h => h.date)),
    [holidays]
  )

  // Set para lookups O(1) en lugar de .some() O(n) (js-set-map-lookups)
  const existingDatesSet = useMemo(
    () => new Set(existingDates.map((d) => toISODate(d))),
    [existingDates]
  )

  const newSelectedThisYear = useMemo(
    () => newSelectedDates.filter((d) => d.getFullYear() === calendarYear),
    [newSelectedDates, calendarYear]
  )
  const newSelectedOtherYears = newSelectedDates.length - newSelectedThisYear.length

  // Misma lógica de cascada que el backend: el excedente de años anteriores
  // puede cubrir el déficit de años posteriores.
  const showOverdraftWarning = useMemo(() => {
    if (newSelectedDates.length === 0) return false
    const byYear = new Map<number, number>()
    for (const d of newSelectedDates) {
      const y = d.getFullYear()
      byYear.set(y, (byYear.get(y) ?? 0) + 1)
    }
    const sortedYears = [...byYear.keys()].sort((a, b) => a - b)
    let surplus = 0
    for (const y of sortedYears) {
      const available = availableByYear[y] ?? 0
      const diff = available - byYear.get(y)!
      if (diff >= 0) {
        surplus += diff
      } else if (surplus + diff >= 0) {
        surplus += diff
      } else {
        return true
      }
    }
    return false
  }, [newSelectedDates, availableByYear])

  const handleDayClick = (day: Date) => {
    const dayOfWeek = day.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return

    const iso = toISODate(day)
    if (existingDatesSet.has(iso)) return
    if (holidaysSet.has(iso)) return

    setNewSelectedDates((prev) => {
      const exists = prev.some((d) => toISODate(d) === iso)
      return exists
        ? prev.filter((d) => toISODate(d) !== iso)
        : [...prev, day]
    })
  }

  const reloadEmployeeData = async () => {
    const [daysResult, summaryResult, commentsResult] = await Promise.all([
      getEmployeeVacationDays(selectedEmployeeId, calendarYear),
      getEmployeesVacationSummary(calendarYear),
      getEmployeeComments(selectedEmployeeId, calendarYear),
    ])
    if (daysResult.success) {
      setExistingDates(daysResult.data.map((d) => new Date(d + "T00:00:00")))
    }
    if (summaryResult.success) {
      const empSummary = summaryResult.data.find((s) => s.employeeId === selectedEmployeeId)
      const days = empSummary?.availableDays ?? 0
      setAvailableDays(days)
      setAvailableByYear((prev) => ({ ...prev, [calendarYear]: days }))
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
        const result = await addComment(selectedEmployeeId, comentario.trim(), calendarYear)
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

  const canSaveDays = newSelectedDates.length > 0
  const canSaveComentario = comentario.trim().length > 0
  const hasDaysSelected = newSelectedDates.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
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

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleYearChange(-1)}
            disabled={calendarYear <= currentYear}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{calendarYear}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleYearChange(1)}
            disabled={calendarYear >= currentYear + 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-red-600 inline-block" />
          <span>Festivo Nacional</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-green-600 inline-block" />
          <span>Festivo Autonómico</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-blue-600 inline-block" />
          <span>Festivo Local</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm bg-yellow-400 inline-block" />
          <span>Vacaciones</span>
        </div>
      </div>

      {selectedEmployeeId && (
        <div className={cn(isLoadingEmployee && "opacity-50")}>
          <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
            <span>
              Seleccionados en {calendarYear}:{" "}
              <strong className={cn(showOverdraftWarning && "text-destructive")}>
                {newSelectedThisYear.length}
              </strong>
            </span>
            <span>
              Disponibles: <strong>{Math.round(availableDays)}</strong>
            </span>
            {newSelectedOtherYears > 0 && (
              <span className="text-muted-foreground">
                +{newSelectedOtherYears} día{newSelectedOtherYears > 1 ? "s" : ""} en otro año
              </span>
            )}
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
              key={calendarYear}
              locale={es}
              showOutsideDays={false}
              mode="multiple"
              selected={existingDates}
              onDayClick={handleDayClick}
              numberOfMonths={12}
              defaultMonth={new Date(calendarYear, 0)}
              startMonth={new Date(calendarYear, 0)}
              endMonth={new Date(calendarYear, 11)}
              disabled={[{ dayOfWeek: [0, 6] }, ...existingDates, ...allHolidays]}
              modifiers={{
                existing: existingDates,
                newSelected: newSelectedDates,
                holidayNacional: holidayNacional,
                holidayAutonomico: holidayAutonomico,
                holidayLocal: holidayLocal,
              }}
              modifiersClassNames={{
                existing: "!bg-yellow-400 !text-black !opacity-100 cursor-not-allowed font-medium",
                newSelected: "!bg-red-500 !text-black !rounded-md font-semibold",
                holidayNacional: "!bg-red-600 !text-white !opacity-100 cursor-not-allowed",
                holidayAutonomico: "!bg-green-600 !text-white !opacity-100 cursor-not-allowed",
                holidayLocal: "!bg-blue-600 !text-white !opacity-100 cursor-not-allowed",
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

          {showOverdraftWarning ? (
            <p className="text-sm text-destructive mt-2">
              Ha seleccionado más días de los disponibles
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
