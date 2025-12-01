import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { getTopCustomers, TopCustomer } from '../../features/dashboard/api/dashboardService';
import { useNavigate } from 'react-router-dom';

export function TopCustomersWidget() {
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTopCustomers = async () => {
      try {
        setIsLoading(true);
        const customers = await getTopCustomers(5);
        setTopCustomers(customers);
      } catch (error) {
        console.error('Error loading top customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopCustomers();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Clientes (Mes)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
          </div>
        ) : topCustomers.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <p>No hay datos de clientes disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div 
                key={customer.id} 
                className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                onClick={() => navigate(`/admin/crm/customers/${customer.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                     <Avatar 
                       src={customer.avatarUrl} 
                       alt={customer.name} 
                       fallback={customer.name.substring(0, 2).toUpperCase()}
                       size="sm" 
                     />
                     {index < 3 && (
                       <div className="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full p-[2px]">
                         <Medal className="h-2 w-2" />
                       </div>
                     )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{customer.name}</p>
                    <p className="text-xs text-text-muted">{customer.orders} pedido{customer.orders !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-orange">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(customer.spent)}
                  </p>
                  <p className="text-xs text-text-secondary">{customer.tier}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
