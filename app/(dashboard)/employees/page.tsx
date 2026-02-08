import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function EmployeesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Empleados</h1>
          <p className="text-gray-600 mt-1">Gestione los trabajadores de la empresa</p>
        </div>
        <Link href="/employees/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo empleado
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de empleados</CardTitle>
          <CardDescription>
            Aquí aparecerá la lista de todos los empleados registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Implementación en progreso...</p>
        </CardContent>
      </Card>
    </div>
  );
}
