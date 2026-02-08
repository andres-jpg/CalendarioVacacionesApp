import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const cards = [
    {
      title: 'Empleados',
      description: 'Gestionar trabajadores y sus datos',
      icon: Users,
      href: '/employees',
      color: 'bg-blue-500',
    },
    {
      title: 'Calendario',
      description: 'Ver y registrar días de vacaciones',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-green-500',
    },
    {
      title: 'Configuración',
      description: 'Ajustes y días por año',
      icon: Settings,
      href: '/settings',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Sistema de gestión de vacaciones de empleados
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido</CardTitle>
            <CardDescription>
              Utilice el menú lateral para navegar por las diferentes secciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Empleados:</strong> Gestione el alta, baja y edición de trabajadores</p>
              <p>• <strong>Calendario:</strong> Registre y visualice los días de vacaciones</p>
              <p>• <strong>Configuración:</strong> Configure los días de vacaciones por año</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
