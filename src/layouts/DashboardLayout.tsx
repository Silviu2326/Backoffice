import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Drawer from '../components/ui/Drawer';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-dark text-text-primary font-body">
      {/* Desktop Sidebar: Fixed Left */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 z-50">
        <Sidebar className="w-full h-full" />
      </aside>

      {/* Mobile Sidebar: Drawer */}
      <Drawer 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        side="left"
        title="Menú"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} className="h-full border-none" />
      </Drawer>

      {/* Header: Fixed Top */}
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-40 transition-all duration-300"
      />

      {/* Main Content: Adjusted margins */}
      <main className="pt-16 lg:ml-64 min-h-screen transition-all duration-300">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}