import { Button } from '@/components/ui/button';
import { Plus, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getEmployees } from './actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Employee } from '@/types';
import { DeactivateEmployeeButton } from '@/components/employees/deactivate-employee-button';

export const dynamic = 'force-dynamic';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default async function EmployeesPage() {
  const result = await getEmployees(true);
  const employees = result.data || [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Empleados</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {employees.length === 0
              ? 'Sin empleados registrados'
              : `${employees.length} empleado${employees.length !== 1 ? 's' : ''} activo${employees.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/employees/new">
          <Button size="sm" className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nuevo empleado
          </Button>
        </Link>
      </div>

      {/* List */}
      {employees.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed py-20 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            No hay empleados registrados
          </p>
          <Link href="/employees/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar primer empleado
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          {employees.map((employee: Employee, idx: number) => (
            <div
              key={employee.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-card transition-colors ${
                idx !== employees.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {getInitials(employee.full_name)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{employee.full_name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5 text-xs text-muted-foreground">
                  {employee.email && (
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      {employee.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 shrink-0">
                    <Calendar className="h-3 w-3" />
                    Ingreso: {format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Link href={`/employees/${employee.id}`}>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
                <DeactivateEmployeeButton
                  employeeId={employee.id}
                  employeeName={employee.full_name}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
