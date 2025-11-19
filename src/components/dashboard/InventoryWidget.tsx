import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Package } from 'lucide-react';

const lowStockItems = [
  { id: 1, name: 'Mr. CoolCat Classic Tee (L)', stock: 2, min: 10 },
  { id: 2, name: 'Neon Vibes Hoodie (M)', stock: 4, min: 15 },
  { id: 3, name: 'Retro Cap - Black', stock: 5, min: 20 },
  { id: 4, name: 'Sticker Pack V2', stock: 8, min: 50 },
  { id: 5, name: 'Limited Ed. Mug', stock: 1, min: 5 },
];

export function InventoryWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Package className="h-5 w-5 text-brand-orange" />
          Inventario Crítico
        </CardTitle>
        <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500 font-medium border border-red-500/20">
          5 alertas
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-12 text-xs text-text-secondary uppercase font-medium tracking-wider pb-2 border-b border-white/5">
            <div className="col-span-7">Producto</div>
            <div className="col-span-3 text-right">Stock</div>
            <div className="col-span-2 text-right">Min</div>
          </div>
          {lowStockItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 items-center text-sm py-1">
              <div className="col-span-7 truncate font-medium text-white">{item.name}</div>
              <div className="col-span-3 text-right font-bold text-red-400">{item.stock}</div>
              <div className="col-span-2 text-right text-text-muted">{item.min}</div>
            </div>
          ))}
          <button className="w-full mt-4 py-2 text-xs font-medium text-brand-orange bg-brand-orange/10 rounded-lg hover:bg-brand-orange/20 transition-colors">
            Ver Inventario Completo
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
