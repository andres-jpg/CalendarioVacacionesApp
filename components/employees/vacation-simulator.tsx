"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { simulateVacationBalance, type SimulationResult } from "@/app/(dashboard)/employees/actions"

interface VacationSimulatorProps {
  employeeId: string
}

function fmt(n: number) {
  return Number(n).toLocaleString("es-ES", { maximumFractionDigits: 2 })
}

export function VacationSimulator({ employeeId }: VacationSimulatorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSimulate = async () => {
    if (!selectedDate) return
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const res = await simulateVacationBalance(employeeId, dateStr)
      if (!res.success || !res.data) {
        setError(res.error ?? "Error al simular el balance")
      } else {
        setResult(res.data)
      }
    } catch {
      setError("Error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <CardTitle>Simulador de vacaciones</CardTitle>
        <CardDescription>Calcula los días disponibles a una fecha futura</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 max-w-xs">
          <DatePicker
            date={selectedDate}
            onDateChange={setSelectedDate}
            placeholder="Selecciona una fecha"
            disabled={isLoading}
          />
          <Button
            onClick={handleSimulate}
            disabled={!selectedDate || isLoading}
            className="h-11"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Simular
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {result && !result.found && (
          <p className="text-sm text-muted-foreground">
            No hay balance configurado para {result.targetYear}
          </p>
        )}

        {result && result.found && (
          <div className="rounded-md border text-sm">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Días del año anterior</span>
              <span>{fmt(result.daysFromPreviousYear)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 border-t">
              <span className="text-muted-foreground">
                Devengados hasta {format(new Date(result.targetDate + "T00:00:00"), "d MMM yyyy", { locale: es })}
              </span>
              <span>{fmt(result.accruedByDate)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 border-t">
              <span className="text-muted-foreground">Días tomados</span>
              <span>−{fmt(result.daysTaken)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 border-t font-semibold">
              <span>Disponibles proyectados</span>
              <span className="text-primary">{fmt(result.projectedAvailable)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
