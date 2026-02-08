'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Gestión de Vacaciones</h1>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </nav>
  );
}
