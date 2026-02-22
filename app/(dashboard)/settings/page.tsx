import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getVacationSettings } from './actions';
import { VacationSettingsList } from '@/components/settings/vacation-settings-list';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const result = await getVacationSettings();
  const settings = result.data || [];

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1 text-sm">Días de vacaciones por defecto para cada año</p>
      </div>

      <Card>
        <CardHeader className="space-y-1.5">
          <CardTitle>Días de vacaciones por año</CardTitle>
          <CardDescription>
            Configure los días de vacaciones por defecto para cada año
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VacationSettingsList settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
