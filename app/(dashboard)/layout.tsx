import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-background flex flex-col">
          <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 lg:px-8 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
