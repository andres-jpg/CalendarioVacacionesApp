import type { VacationSummary } from "@/types"

function fmt(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(2)
}

export async function exportBulkPDF(summaries: VacationSummary[], year: number) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(`Resumen de vacaciones ${year}`, 14, 16)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-ES")}  ·  Total empleados: ${summaries.length}`,
    14,
    23
  )

  autoTable(doc, {
    startY: 28,
    head: [
      ["Empleado", "Año anterior", "Días año", "Tomados", "Disponibles año", "Disponibles hoy"],
    ],
    body: summaries.map((s) => [
      s.employeeName,
      fmt(s.daysFromPreviousYear),
      fmt(s.daysCurrentYear),
      fmt(s.daysTaken),
      fmt(s.availableDays),
      fmt(s.availableToday),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [15, 118, 110] },
    columnStyles: {
      0: { cellWidth: 60 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data: any) => {
      const pageCount = (doc as any).internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.getWidth() - 30,
        doc.internal.pageSize.getHeight() - 8
      )
    },
  })

  doc.save(`vacaciones_resumen_${year}.pdf`)
}
