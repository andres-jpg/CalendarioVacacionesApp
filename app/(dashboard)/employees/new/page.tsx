"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { createEmployee } from "../actions"
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

export default function NewEmployeePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      hire_date: new Date(),
    },
  })

  async function onSubmit(values: EmployeeFormValues) {
    setIsSubmitting(true)

    try {
      const result = await createEmployee({
        full_name: values.full_name,
        email: values.email || undefined,
        hire_date: format(values.hire_date, "yyyy-MM-dd"),
        is_active: true,
      })

      if (result.success) {
        toast.success("Empleado creado exitosamente")
        router.push("/employees")
        router.refresh()
      } else {
        toast.error(result.error || "Error al crear el empleado")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error inesperado al crear el empleado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/employees">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a empleados
          </Button>
        </Link>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-2 border-b border-border pb-6">
          <CardTitle className="text-2xl">Nuevo Empleado</CardTitle>
          <CardDescription className="text-base">
            Complete los datos del nuevo empleado
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/employees")}
                  disabled={isSubmitting}
                  className="flex-1 h-11"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Guardando..." : "Guardar empleado"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
