import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getEmployees } from './actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Employee } from '@/types';
import { DeactivateEmployeeButton } from '@/components/employees/deactivate-employee-button';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
  const result = await getEmployees(true); // Solo empleados activos
  const employees = result.data || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Empleados</h1>
          <p className="text-muted-foreground mt-2">Gestione los trabajadores de la empresa</p>
        </div>
        <Link href="/employees/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo empleado
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="space-y-1.5">
          <CardTitle>Lista de empleados</CardTitle>
          <CardDescription>
            {employees.length === 0
              ? 'No hay empleados registrados. Agregue el primero usando el botón "Nuevo empleado"'
              : `${employees.length} empleado${employees.length !== 1 ? 's' : ''} registrado${employees.length !== 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {employees.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-sm text-muted-foreground mb-6">No hay empleados registrados</p>
              <Link href="/employees/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer empleado
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee: Employee) => (
                <div
                  key={employee.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <h3 className="font-semibold text-base text-foreground">{employee.full_name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                      {employee.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        Ingreso: {format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
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
        </CardContent>
      </Card>
    </div>
  );
}
