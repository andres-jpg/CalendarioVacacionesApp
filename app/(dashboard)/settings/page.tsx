import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-600 mt-1">Ajustes del sistema y días de vacaciones por año</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Días de vacaciones por año</CardTitle>
          <CardDescription>
            Configure los días de vacaciones por defecto para cada año
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Implementación en progreso...</p>
        </CardContent>
      </Card>
    </div>
  );
}
