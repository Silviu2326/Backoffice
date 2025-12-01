import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Package, Loader2 } from 'lucide-react';
import { getLowStockItems, LowStockItem } from '../../features/dashboard/api/dashboardService';
import { useNavigate } from 'react-router-dom';

export function InventoryWidget() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLowStock = async () => {
      try {
        setIsLoading(true);
        const items = await getLowStockItems(10);
        setLowStockItems(items);
      } catch (error) {
        console.error('Error loading low stock items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLowStock();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Package className="h-5 w-5 text-brand-orange" />
          Inventario Crítico
        </CardTitle>
        {lowStockItems.length > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500 font-medium border border-red-500/20">
            {lowStockItems.length} alerta{lowStockItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
          </div>
        ) : lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <p>No hay productos con stock bajo</p>
          </div>
        ) : (
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
            <button 
              onClick={() => navigate('/admin/products')}
              className="w-full mt-4 py-2 text-xs font-medium text-brand-orange bg-brand-orange/10 rounded-lg hover:bg-brand-orange/20 transition-colors"
            >
              Ver Inventario Completo
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
