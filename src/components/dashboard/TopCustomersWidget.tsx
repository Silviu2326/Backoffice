import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Trophy, Medal } from 'lucide-react';
import Avatar from '../ui/Avatar';

const topCustomers = [
  { id: 1, name: 'Sofia Martinez', spent: '2,450€', orders: 12, tier: 'Diamond' },
  { id: 2, name: 'Carlos Ruiz', spent: '1,890€', orders: 8, tier: 'Gold' },
  { id: 3, name: 'Ana Gomez', spent: '1,200€', orders: 15, tier: 'Gold' },
  { id: 4, name: 'David Lee', spent: '980€', orders: 5, tier: 'Silver' },
  { id: 5, name: 'Maria Chen', spent: '850€', orders: 7, tier: 'Silver' },
];

export function TopCustomersWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Clientes (Mes)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCustomers.map((customer, index) => (
            <div key={customer.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                   <Avatar 
                     src={`https://i.pravatar.cc/150?u=${customer.id}`} 
                     alt={customer.name} 
                     fallback={customer.name}
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
                  <p className="text-xs text-text-muted">{customer.orders} pedidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-brand-orange">{customer.spent}</p>
                <p className="text-xs text-text-secondary">{customer.tier}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
