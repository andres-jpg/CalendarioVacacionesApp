"use client"

import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
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
import { deleteVacationSetting } from "@/app/(dashboard)/settings/actions"
import { VacationSettingsForm } from "./vacation-settings-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { VacationSettings } from "@/types"

interface VacationSettingsListProps {
  settings: VacationSettings[]
}

export function VacationSettingsList({ settings }: VacationSettingsListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingSetting, setEditingSetting] = useState<VacationSettings | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    setDeletingId(id)

    try {
      const result = await deleteVacationSetting(id)

      if (result.success) {
        toast.success("Configuración eliminada")
        router.refresh()
      } else {
        toast.error(result.error || "Error al eliminar la configuración")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al eliminar la configuración")
    } finally {
      setDeletingId(null)
    }
  }

  function handleEdit(setting: VacationSettings) {
    setShowForm(false)
    setEditingSetting(setting)
  }

  function handleCancelForm() {
    setShowForm(false)
    setEditingSetting(null)
  }

  function handleFormSuccess() {
    setShowForm(false)
    setEditingSetting(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditingSetting(null)
            setShowForm(true)
          }}
          disabled={showForm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir año
        </Button>
      </div>

      {showForm && (
        <VacationSettingsForm
          onCancel={handleCancelForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {settings.length === 0 && !showForm ? (
        <div className="text-center py-12 px-4">
          <p className="text-sm text-muted-foreground mb-4">No hay configuraciones registradas</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir primera configuración
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {settings.map((setting) => (
            <div key={setting.id}>
              {editingSetting?.id === setting.id ? (
                <VacationSettingsForm
                  initialData={setting}
                  onCancel={handleCancelForm}
                  onSuccess={handleFormSuccess}
                />
              ) : (
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-sm text-muted-foreground">Año</p>
                      <p className="font-semibold text-lg">{setting.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Días por defecto</p>
                      <p className="font-semibold text-lg">{setting.default_days}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(setting)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar configuración?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Está a punto de eliminar la configuración del año{" "}
                            <span className="font-semibold text-foreground">{setting.year}</span>.
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deletingId === setting.id}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(setting.id)}
                            disabled={deletingId === setting.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === setting.id ? "Eliminando..." : "Eliminar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
