import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CalendarPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendario de Vacaciones</h1>
        <p className="text-gray-600 mt-1">Visualice y registre días de vacaciones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendario Anual</CardTitle>
          <CardDescription>
            Vista del calendario con días de vacaciones registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Implementación en progreso...</p>
        </CardContent>
      </Card>
    </div>
  );
}
