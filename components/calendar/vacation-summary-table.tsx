"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { VacationSummary } from "@/types"
import { cn } from "@/lib/utils"
import { getEmployeesVacationSummary } from "@/app/(dashboard)/calendar/actions"

interface VacationSummaryTableProps {
  initialData: VacationSummary[]
  years: number[]
  initialYear: number
}

export function VacationSummaryTable({ initialData, years, initialYear }: VacationSummaryTableProps) {
  const [search, setSearch] = useState("")
  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()

  const handleYearChange = (value: string) => {
    const year = parseInt(value, 10)
    setSelectedYear(year)
    startTransition(async () => {
      const result = await getEmployeesVacationSummary(year)
      if (result.success) {
        setData(result.data)
      }
    })
  }

  const filtered = data.filter((item) =>
    item.employeeName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <Select value={String(selectedYear)} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className={cn("rounded-md border", isPending && "opacity-50")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead className="text-right">Días año anterior</TableHead>
              <TableHead className="text-right">Días este año</TableHead>
              <TableHead className="text-right">Días tomados</TableHead>
              <TableHead className="text-right">Días disponibles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No se encontraron empleados
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.employeeId}>
                  <TableCell className="font-medium">{item.employeeName}</TableCell>
                  <TableCell className="text-right">{Math.round(item.daysFromPreviousYear)}</TableCell>
                  <TableCell className="text-right">{Math.round(item.daysCurrentYear)}</TableCell>
                  <TableCell className="text-right">{Math.round(item.daysTaken)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      item.availableDays <= 0 ? "text-destructive" : ""
                    )}
                  >
                    {Math.round(item.availableDays)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
