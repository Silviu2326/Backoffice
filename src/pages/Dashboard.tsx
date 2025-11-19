import { DollarSign, ShoppingBag, Users, Activity, Calendar } from 'lucide-react';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import KPIWidget from '../components/dashboard/KPIWidget';
import { InventoryWidget } from '../components/dashboard/InventoryWidget';
import { OrderAlertsWidget } from '../components/dashboard/OrderAlertsWidget';
import { TopCustomersWidget } from '../components/dashboard/TopCustomersWidget';
import { FunnelChart } from '../components/dashboard/FunnelChart';

const stats = [
  { name: 'Ingresos Totales', value: '24,500€', trend: 12.5, trendLabel: 'vs mes anterior', icon: DollarSign },
  { name: 'Ticket Medio (AOV)', value: '85€', trend: 2.1, trendLabel: 'vs semana pasada', icon: ShoppingBag },
  { name: 'Tasa de Conversión', value: '3.2%', trend: -0.5, trendLabel: 'vs ayer', icon: Activity },
  { name: 'Pedidos Totales', value: '1,240', trend: 8, trendLabel: 'vs mes anterior', icon: Users },
];

export default function Dashboard() {
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Row 2: Main Charts & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px]">
          <RevenueChart />
        </div>
        <div className="h-[400px]">
          <OrderAlertsWidget />
        </div>
      </div>
      
      {/* Row 3: Operational & Analysis Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="h-[350px]">
            <InventoryWidget />
         </div>
         <div className="h-[350px]">
            <FunnelChart />
         </div>
         <div className="h-[350px]">
            <TopCustomersWidget />
         </div>
      </div>
    </div>
  );
}
