"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, parseISO } from "date-fns"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { getEmployee, updateEmployee } from "../actions"
import { toast } from "sonner"

const employeeFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }).optional().or(z.literal("")),
  hire_date: z.date({
    message: "La fecha de ingreso es requerida.",
  }),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      hire_date: new Date(),
    },
  })

  useEffect(() => {
    async function loadEmployee() {
      const result = await getEmployee(employeeId)

      if (result.success && result.data) {
        form.reset({
          full_name: result.data.full_name,
          email: result.data.email || "",
          hire_date: parseISO(result.data.hire_date),
        })
      } else {
        toast.error(result.error || "Error al cargar el empleado")
        router.push("/employees")
      }

      setIsLoading(false)
    }

    loadEmployee()
  }, [employeeId, form, router])

  async function onSubmit(values: EmployeeFormValues) {
    setIsSubmitting(true)

    try {
      const result = await updateEmployee(employeeId, {
        full_name: values.full_name,
        email: values.email || undefined,
        hire_date: format(values.hire_date, "yyyy-MM-dd"),
        is_active: true,
      })

      if (result.success) {
        toast.success("Empleado actualizado exitosamente")
        router.push("/employees")
        router.refresh()
      } else {
        toast.error(result.error || "Error al actualizar el empleado")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al actualizar el empleado")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <Link href="/employees">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver a empleados
          </Button>
        </Link>
      </div>

      <Card className="border-border">
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="text-xl">Editar Empleado</CardTitle>
          <CardDescription>
            Modifique los datos del empleado
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Nombre completo
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Email <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Fecha de ingreso
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/employees")}
                  disabled={isSubmitting}
                  className="sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
