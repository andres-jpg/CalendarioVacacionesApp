"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({ date, onDateChange, placeholder = "dd/mm/aaaa", disabled = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          value={date ? format(date, "dd/MM/yyyy") : ""}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "pl-10 cursor-pointer",
            !date && "text-muted-foreground"
          )}
        />
        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && !disabled && (
        <div className="border rounded-lg bg-card shadow-lg p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate)
              if (selectedDate) {
                setIsOpen(false)
              }
            }}
            initialFocus
            locale={es}
            className="rounded-md"
          />
        </div>
      )}
    </div>
  )
}
