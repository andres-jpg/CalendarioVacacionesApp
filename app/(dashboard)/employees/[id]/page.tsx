import { notFound } from "next/navigation"
import { getEmployee } from "../actions"
import { getVacationSettings } from "@/app/(dashboard)/settings/actions"
import { EditEmployeeForm } from "./edit-employee-form"
import { EmployeeExportPanel } from "@/components/employees/employee-export-panel"

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [employeeResult, settingsResult] = await Promise.all([
    getEmployee(id),
    getVacationSettings(),
  ])

  if (!employeeResult.success || !employeeResult.data) {
    notFound()
  }

  const years = ((settingsResult.data as any[]) || []).map((s: any) => s.year as number)

  return (
    <div className="space-y-6">
      <EditEmployeeForm employee={employeeResult.data} />
      <EmployeeExportPanel employeeId={id} availableYears={years} />
    </div>
  )
}
