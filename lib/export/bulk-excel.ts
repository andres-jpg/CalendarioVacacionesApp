import type { VacationSummary } from "@/types"

function fmt(n: number) {
  return n % 1 === 0 ? n : Math.round(n * 100) / 100
}

export async function exportBulkExcel(summaries: VacationSummary[], year: number) {
  const XLSX = await import("xlsx")

  const header = [
    "Empleado",
    "Año anterior",
    "Días año",
    "Tomados",
    "Disponibles año",
    "Disponibles hoy",
  ]

  const rows = summaries.map((s) => [
    s.employeeName,
    fmt(s.daysFromPreviousYear),
    fmt(s.daysCurrentYear),
    fmt(s.daysTaken),
    fmt(s.availableDays),
    fmt(s.availableToday),
  ])

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  ws["!cols"] = [
    { wch: 30 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Resumen")
  XLSX.writeFile(wb, `vacaciones_resumen_${year}.xlsx`)
}
