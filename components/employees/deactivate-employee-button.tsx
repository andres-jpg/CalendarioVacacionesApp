"use client"

import { useState } from "react"
import { UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deactivateEmployee } from "@/app/(dashboard)/employees/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DeactivateEmployeeButtonProps {
  employeeId: string
  employeeName: string
}

export function DeactivateEmployeeButton({ employeeId, employeeName }: DeactivateEmployeeButtonProps) {
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleDeactivate() {
    setIsDeactivating(true)

    try {
      const result = await deactivateEmployee(employeeId)

      if (result.success) {
        toast.success(`${employeeName} ha sido dado de baja`)
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Error al dar de baja al empleado")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al dar de baja al empleado")
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
          <UserX className="h-4 w-4" />
          Dar de baja
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Dar de baja a este empleado?</AlertDialogTitle>
          <AlertDialogDescription>
            Está a punto de dar de baja a <span className="font-semibold text-foreground">{employeeName}</span>.
            El empleado dejará de aparecer en la lista de empleados activos, pero sus registros de vacaciones se mantendrán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeactivating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeactivating ? "Dando de baja..." : "Dar de baja"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
