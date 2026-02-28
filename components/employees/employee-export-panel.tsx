"use client"

import { useState } from "react"
import { FileText, Sheet } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getEmployeeExportData } from "@/app/(dashboard)/employees/actions"

interface EmployeeExportPanelProps {
  employeeId: string
  availableYears: number[]
}

export function EmployeeExportPanel({ employeeId, availableYears }: EmployeeExportPanelProps) {
  const currentYear = new Date().getFullYear()
  const defaultYear =
    availableYears.includes(currentYear) ? currentYear : (availableYears[0] ?? currentYear)

  const [year, setYear] = useState(defaultYear)
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null)

  const handleExport = async (type: "pdf" | "excel") => {
    setIsExporting(type)
    try {
      const result = await getEmployeeExportData(employeeId, year)
      if (!result.success || !result.data) {
        toast.error(result.error ?? "Error al obtener datos")
        return
      }

      if (type === "pdf") {
        const { exportEmployeePDF } = await import("@/lib/export/employee-pdf")
        await exportEmployeePDF(result.data, year)
      } else {
        const { exportEmployeeExcel } = await import("@/lib/export/employee-excel")
        await exportEmployeeExcel(result.data, year)
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al generar el archivo")
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <CardTitle>Exportar vacaciones</CardTitle>
        <CardDescription>Descarga el resumen de vacaciones en PDF o Excel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={isExporting !== null}
          >
            <FileText className="h-4 w-4 mr-2" />
            {isExporting === "pdf" ? "Generando..." : "Exportar PDF"}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport("excel")}
            disabled={isExporting !== null}
          >
            <Sheet className="h-4 w-4 mr-2" />
            {isExporting === "excel" ? "Generando..." : "Exportar Excel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
