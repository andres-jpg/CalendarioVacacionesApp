import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Calendar, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const cards = [
    {
      title: "Empleados",
      description: "Gestionar trabajadores y sus datos",
      icon: Users,
      href: "/employees",
    },
    {
      title: "Calendario",
      description: "Ver y registrar días de vacaciones",
      icon: Calendar,
      href: "/calendar",
    },
    {
      title: "Configuración",
      description: "Ajustes y días por año",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Sistema de gestión de vacaciones de empleados
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <Card className="h-full border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <CardHeader className="space-y-4 pb-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <card.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardDescription className="text-base">
                    {card.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
