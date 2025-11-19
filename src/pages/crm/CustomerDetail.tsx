import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerProfileCard from '../../components/crm/CustomerProfileCard';
import { CustomerStats } from '../../components/crm/CustomerStats';
import LoyaltyManager from '../../components/crm/LoyaltyManager';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, Package } from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';

// Mock data for the specific customer
const mockCustomerData = {
  id: '1',
  name: 'Juan Perez',
  email: 'juan.perez@example.com',
  avatarUrl: 'https://i.pravatar.cc/150?img=1',
  segments: ['VIP', 'Early Adopter'],
  stats: {
    ltv: 1250.75,
    aov: 65.50,
    totalOrders: 19,
    antiquity: 450,
  },
};

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'delivered' | 'processing' | 'cancelled';
}

const mockOrders: Order[] = [
  { id: '#ORD-001', date: '2025-10-20', total: 150.00, status: 'delivered' },
  { id: '#ORD-002', date: '2025-10-05', total: 75.50, status: 'delivered' },
  { id: '#ORD-003', date: '2025-09-28', total: 200.00, status: 'processing' },
];

const orderColumns: Column<Order>[] = [
  {
    header: 'ID Pedido',
    accessorKey: 'id',
    className: 'font-medium text-white',
  },
  {
    header: 'Fecha',
    accessorKey: 'date',
    render: (row) => new Date(row.date).toLocaleDateString(),
  },
  {
    header: 'Total',
    accessorKey: 'total',
    render: (row) => `$${row.total.toFixed(2)}`,
  },
  {
    header: 'Estado',
    accessorKey: 'status',
    render: (row) => {
       const variants: Record<string, "success" | "warning" | "danger"> = {
        delivered: 'success',
        processing: 'warning',
        cancelled: 'danger',
      };
      return <Badge variant={variants[row.status]}>{row.status}</Badge>;
    },
  },
];

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // In a real app, fetch data based on 'id' here.
  const customer = { ...mockCustomerData, id: id || '1' };

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/admin/crm/customers')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Clientes
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Loyalty */}
        <div className="space-y-6">
          <CustomerProfileCard customer={customer} />
          <LoyaltyManager />
        </div>

        {/* Right Column: Stats & Orders */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerStats {...customer.stats} />

          <Card className="bg-[#1E1E1E] p-6 border-none">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Package className="h-5 w-5 text-brand-orange" />
                    Últimos Pedidos
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>
                    Ver Todos
                </Button>
            </div>
            <DataTable
              columns={orderColumns}
              data={mockOrders}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
