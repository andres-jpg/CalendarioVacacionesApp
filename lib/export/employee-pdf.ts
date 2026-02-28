import type { jsPDF } from "jspdf"
import type { SingleEmployeeExportData } from "@/app/(dashboard)/employees/actions"

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
]
const DAY_NAMES = ["L", "M", "X", "J", "V", "S", "D"]

function fmt(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(2)
}

/**
 * Dibuja un mini-calendario mensual con jsPDF puro (sin html2canvas).
 * Los días de vacaciones se resaltan en amarillo.
 * Devuelve la Y final (bajo del último row dibujado).
 */
function drawMonthCalendar(
  doc: jsPDF,
  year: number,
  monthIndex: number,
  vacationSet: Set<string>,
  x: number,
  y: number,
  width: number
): void {
  const cellW = width / 7
  const rowH = 5.2

  // Cabecera del mes
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 30, 30)
  doc.text(MONTH_NAMES[monthIndex], x + width / 2, y + 4, { align: "center" })

  // Nombres de días
  doc.setFontSize(5.5)
  doc.setFont("helvetica", "bold")
  DAY_NAMES.forEach((name, i) => {
    const cx = x + i * cellW + cellW / 2
    // Sábado y domingo en gris
    doc.setTextColor(i >= 5 ? 160 : 60, i >= 5 ? 160 : 60, i >= 5 ? 160 : 60)
    doc.text(name, cx, y + 9, { align: "center" })
  })

  // Línea separadora
  doc.setDrawColor(210, 210, 210)
  doc.line(x, y + 10.5, x + width, y + 10.5)

  // Semanas
  const firstDay = new Date(year, monthIndex, 1).getDay()
  const firstDayMon = (firstDay + 6) % 7 // lunes = 0
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const weeks: (number | null)[][] = []
  let week: (number | null)[] = Array(firstDayMon).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  doc.setFont("helvetica", "normal")
  weeks.forEach((w, wIdx) => {
    const rowY = y + 14 + wIdx * rowH
    w.forEach((day, dIdx) => {
      if (!day) return
      const mm = String(monthIndex + 1).padStart(2, "0")
      const dd = String(day).padStart(2, "0")
      const iso = `${year}-${mm}-${dd}`
      const cx = x + dIdx * cellW + cellW / 2

      if (vacationSet.has(iso)) {
        doc.setFillColor(250, 204, 21)
        doc.roundedRect(cx - cellW / 2 + 0.4, rowY - 3.8, cellW - 0.8, rowH, 0.8, 0.8, "F")
        doc.setFontSize(5.5)
        doc.setTextColor(0, 0, 0)
        doc.text(String(day), cx, rowY, { align: "center" })
      } else {
        const isSatSun = dIdx >= 5
        doc.setFontSize(5.5)
        doc.setTextColor(isSatSun ? 160 : 50, isSatSun ? 160 : 50, isSatSun ? 160 : 50)
        doc.text(String(day), cx, rowY, { align: "center" })
      }
    })
  })

  // Reset color
  doc.setTextColor(0, 0, 0)
}

export async function exportEmployeePDF(data: SingleEmployeeExportData, year: number) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  const { employee, summary, vacationDates, comments } = data

  // ── Página 1: datos + tabla ───────────────────────────────────────
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(employee.full_name, 14, 18)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  if (employee.email) doc.text(`Email: ${employee.email}`, 14, 26)
  const hireFormatted = employee.hire_date
    ? new Date(employee.hire_date + "T00:00:00").toLocaleDateString("es-ES")
    : "-"
  doc.text(`Fecha de ingreso: ${hireFormatted}`, 14, 32)
  doc.text(`Año: ${year}`, 14, 38)

  autoTable(doc, {
    startY: 44,
    head: [["Año anterior", "Días año", "Tomados", "Disponibles año", "Disponibles hoy"]],
    body: [[
      fmt(summary.daysFromPreviousYear),
      fmt(summary.daysCurrentYear),
      fmt(summary.daysTaken),
      fmt(summary.availableDays),
      fmt(summary.availableToday),
    ]],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [15, 118, 110] },
    margin: { left: 14, right: 14 },
  })

  if (comments.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY ?? 70
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Observaciones", 14, finalY + 10)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    let cy = finalY + 16
    for (const c of comments) {
      const lines = doc.splitTextToSize(c.text, 260)
      doc.text(lines, 14, cy)
      cy += lines.length * 5 + 4
    }
  }

  // ── Página 2: calendario con jsPDF puro ──────────────────────────
  doc.addPage()
  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.text(`Calendario de vacaciones ${year}`, 14, 12)

  const vacationSet = new Set(vacationDates)

  // Layout: 4 columnas × 3 filas (landscape A4 = 297 × 210mm)
  const margin = 14
  const colCount = 4
  const colGap = 5
  const usableW = 297 - margin * 2
  const colW = (usableW - colGap * (colCount - 1)) / colCount // ~63mm

  const startY = 18
  const rowStep = 62 // espacio vertical por fila de meses

  for (let m = 0; m < 12; m++) {
    const col = m % colCount
    const row = Math.floor(m / colCount)
    const x = margin + col * (colW + colGap)
    const y = startY + row * rowStep
    drawMonthCalendar(doc, year, m, vacationSet, x, y, colW)
  }

  // Leyenda
  const legendY = startY + 3 * rowStep + 2
  doc.setFillColor(250, 204, 21)
  doc.roundedRect(margin, legendY, 4, 4, 0.5, 0.5, "F")
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(60, 60, 60)
  doc.text("Días de vacaciones tomados", margin + 6, legendY + 3.2)
  doc.setTextColor(0, 0, 0)

  const safeName = employee.full_name.replace(/\s+/g, "_")
  doc.save(`vacaciones_${safeName}_${year}.pdf`)
}
