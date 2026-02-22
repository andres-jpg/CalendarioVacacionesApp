import { notFound } from "next/navigation"
import { getEmployee } from "../actions"
import { EditEmployeeForm } from "./edit-employee-form"

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getEmployee(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <EditEmployeeForm employee={result.data} />
}
