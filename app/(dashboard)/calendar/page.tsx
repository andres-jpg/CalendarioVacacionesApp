import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VacationSummaryTable } from '@/components/calendar/vacation-summary-table';
import { AddVacationForm } from '@/components/calendar/add-vacation-form';
import { getEmployeesVacationSummary, getActiveEmployees } from './actions';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const currentYear = new Date().getFullYear();

  const [summaryResult, employeesResult] = await Promise.all([
    getEmployeesVacationSummary(currentYear),
    getActiveEmployees(),
  ]);

  // Generar años desde 2020 hasta el año actual (sin futuros)
  const years: number[] = [];
  for (let y = currentYear; y >= 2020; y--) {
    years.push(y);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendario de Vacaciones</h1>
        <p className="text-muted-foreground mt-1">Gestione y visualice las vacaciones de los empleados</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>
              Balance de días de vacaciones de los empleados activos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summaryResult.success ? (
              <VacationSummaryTable
                initialData={summaryResult.data}
                years={years}
                initialYear={currentYear}
              />
            ) : (
              <p className="text-sm text-destructive">{summaryResult.error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregar Vacaciones</CardTitle>
            <CardDescription>
              Seleccione un empleado y marque los días de vacaciones en el calendario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employeesResult.success ? (
              <AddVacationForm employees={employeesResult.data} />
            ) : (
              <p className="text-sm text-destructive">{employeesResult.error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
