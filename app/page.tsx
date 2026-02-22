import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Users, Calendar, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    description: "Ajustes y días de vacaciones por año",
    icon: Settings,
    href: "/settings",
  },
];

export default function DashboardPage() {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-background flex flex-col">
          <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 lg:px-8 flex flex-col">
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text-foreground tracking-tight">
                Panel principal
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Sistema integral de gestión de vacaciones
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Link key={card.href} href={card.href} className="group">
                  <div className="h-full p-6 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-colors duration-150 cursor-pointer">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                        <card.icon className="h-5 w-5 text-primary" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150" />
                    </div>
                    <h3 className="font-medium text-foreground mb-1">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
