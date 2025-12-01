import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Calendar, Loader2 } from 'lucide-react';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import KPIWidget from '../components/dashboard/KPIWidget';
import { InventoryWidget } from '../components/dashboard/InventoryWidget';
import { TopCustomersWidget } from '../components/dashboard/TopCustomersWidget';
import { getDashboardStats } from '../features/dashboard/api/dashboardService';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { name: 'Ingresos Totales', value: '0€', trend: 0, trendLabel: 'vs mes anterior', icon: DollarSign },
    { name: 'Ticket Medio (AOV)', value: '0€', trend: 0, trendLabel: 'vs mes anterior', icon: ShoppingBag },
    { name: 'Pedidos Totales', value: '0', trend: 0, trendLabel: 'vs mes anterior', icon: Users },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const dashboardStats = await getDashboardStats('month');

        setStats([
          {
            name: 'Ingresos Totales',
            value: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(dashboardStats.totalRevenue),
            trend: dashboardStats.revenueTrend,
            trendLabel: 'vs mes anterior',
            icon: DollarSign,
          },
          {
            name: 'Ticket Medio (AOV)',
            value: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(dashboardStats.averageOrderValue),
            trend: dashboardStats.aovTrend,
            trendLabel: 'vs mes anterior',
            icon: ShoppingBag,
          },
          {
            name: 'Pedidos Totales',
            value: dashboardStats.totalOrders.toLocaleString('es-ES'),
            trend: dashboardStats.ordersTrend,
            trendLabel: 'vs mes anterior',
            icon: Users,
          },
        ]);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        <span className="ml-3 text-text-secondary">Cargando estadísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-display tracking-tight">Dashboard Ejecutivo</h1>
          <p className="text-text-secondary mt-1">Resumen operativo y financiero en tiempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
           {/* Mock Date Range Picker */}
           <button className="flex items-center gap-2 bg-[#2C2C2C] px-4 py-2 rounded-lg border border-white/5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
              <Calendar className="h-4 w-4" />
              <span>Este Mes: 1 Nov - 19 Nov</span>
           </button>

           <div className="flex items-center gap-2 bg-[#2C2C2C] px-4 py-2 rounded-lg border border-white/5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-300 font-medium">En Línea</span>
           </div>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <KPIWidget
            key={item.name}
            title={item.name}
            value={item.value}
            trend={item.trend}
            trendLabel={item.trendLabel}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Row 2: Main Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="h-[400px]">
          <RevenueChart />
        </div>
      </div>
      
      {/* Row 3: Operational & Analysis Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="h-[350px]">
            <InventoryWidget />
         </div>
         <div className="h-[350px]">
            <TopCustomersWidget />
         </div>
      </div>
    </div>
  );
}