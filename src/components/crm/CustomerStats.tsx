import { Card } from '../ui/Card';

interface CustomerStatsProps {
  ltv: number;
  aov: number;
  totalOrders: number;
  antiquity: number; // Days since registration
}

export function CustomerStats({ ltv, aov, totalOrders, antiquity }: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 border-none bg-[#1E1E1E]">
        <p className="text-sm text-text-secondary">LTV (Total gastado)</p>
        <p className="text-2xl font-bold text-white">${ltv.toFixed(2)}</p>
      </Card>
      <Card className="p-4 border-none bg-[#1E1E1E]">
        <p className="text-sm text-text-secondary">AOV (Ticket medio)</p>
        <p className="text-2xl font-bold text-white">${aov.toFixed(2)}</p>
      </Card>
      <Card className="p-4 border-none bg-[#1E1E1E]">
        <p className="text-sm text-text-secondary">Pedidos Totales</p>
        <p className="text-2xl font-bold text-white">{totalOrders}</p>
      </Card>
      <Card className="p-4 border-none bg-[#1E1E1E]">
        <p className="text-sm text-text-secondary">Antigüedad (Días desde registro)</p>
        <p className="text-2xl font-bold text-white">{antiquity} días</p>
      </Card>
    </div>
  );
}
