import type { SingleEmployeeExportData } from "@/app/(dashboard)/employees/actions"

function fmt(n: number) {
  return n % 1 === 0 ? n : Math.round(n * 100) / 100
}

export async function exportEmployeeExcel(data: SingleEmployeeExportData, year: number) {
  const XLSX = await import("xlsx")
  const { employee, summary, vacationDates } = data

  const wb = XLSX.utils.book_new()

  // ── Hoja 1: Datos ─────────────────────────────────────────────────
  const hireFormatted = employee.hire_date
    ? new Date(employee.hire_date + "T00:00:00").toLocaleDateString("es-ES")
    : "-"

  const dataRows = [
    ["Nombre", employee.full_name],
    ["Email", employee.email ?? "-"],
    ["Fecha de ingreso", hireFormatted],
    ["Año", year],
    [],
    ["Días año anterior", fmt(summary.daysFromPreviousYear)],
    ["Días año actual", fmt(summary.daysCurrentYear)],
    ["Días tomados", fmt(summary.daysTaken)],
    ["Disponibles año completo", fmt(summary.availableDays)],
    ["Disponibles hoy", fmt(summary.availableToday)],
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(dataRows)
  ws1["!cols"] = [{ wch: 28 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, ws1, "Datos")

  // ── Hoja 2: Días ──────────────────────────────────────────────────
  const { es } = await import("date-fns/locale")
  const { format } = await import("date-fns")

  const daysHeader = [["Fecha", "Día de la semana"]]
  const daysRows = vacationDates.map((iso) => {
    const d = new Date(iso + "T00:00:00")
    return [iso, format(d, "EEEE", { locale: es })]
  })

  const ws2 = XLSX.utils.aoa_to_sheet([...daysHeader, ...daysRows])
  ws2["!cols"] = [{ wch: 14 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws2, "Días")

  const safeName = employee.full_name.replace(/\s+/g, "_")
  XLSX.writeFile(wb, `vacaciones_${safeName}_${year}.xlsx`)
}
