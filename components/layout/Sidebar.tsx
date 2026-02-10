"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Users, Settings, Home } from "lucide-react";

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Empleados",
    href: "/employees",
    icon: Users,
  },
  {
    name: "Calendario",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Configuración",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 border-r border-border bg-card">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                )}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
