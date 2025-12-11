import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerProfileCard from '../../components/crm/CustomerProfileCard';
import { CustomerStats } from '../../components/crm/CustomerStats';
import LoyaltyManager from '../../components/crm/LoyaltyManager';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { getCustomerById } from '../../features/crm/api/customerService';
import { getAllOrders } from '../../features/orders/api/orderService';
import { getUserAchievements } from '../../features/gamification/api/userAchievementService';
import { Customer, Order, OrderStatus } from '../../types/core';
import { formatDate } from '../../utils/formatters';

interface OrderRow {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
}

const orderColumns: Column<OrderRow>[] = [
  {
    header: 'ID Pedido',
    accessorKey: 'orderNumber',
    className: 'font-medium text-white',
    render: (row) => (
      <button
        onClick={() => navigate(`/admin/orders/${row.id}`)}
        className="text-blue-600 hover:underline"
      >
        {row.orderNumber}
      </button>
    ),
  },
  {
    header: 'Fecha',
    accessorKey: 'date',
    render: (row) => formatDate(new Date(row.date), 'short'),
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
      const variants: Record<OrderStatus, "success" | "warning" | "danger" | "default"> = {
        [OrderStatus.DELIVERED]: 'success',
        [OrderStatus.SHIPPED]: 'success',
        [OrderStatus.READY_TO_SHIP]: 'warning',
        [OrderStatus.PREPARING]: 'warning',
        [OrderStatus.PAID]: 'warning',
        [OrderStatus.PENDING_PAYMENT]: 'warning',
        [OrderStatus.CANCELLED]: 'danger',
        [OrderStatus.RETURNED]: 'danger',
      };
      return <Badge variant={variants[row.status] || 'default'}>{row.status}</Badge>;
    },
  },
];

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomerData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Cargar datos del cliente
        const customerData = await getCustomerById(id);
        if (!customerData) {
          setError('Cliente no encontrado');
          setIsLoading(false);
          return;
        }
        setCustomer(customerData);

        // Cargar pedidos del cliente
        const customerOrders = await getAllOrders({ customerId: id });
        const mappedOrders: OrderRow[] = customerOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          date: order.createdAt.toISOString(),
          total: order.totalAmount,
          status: order.status,
        }));
        setOrders(mappedOrders);
      } catch (err) {
        console.error('Error loading customer data:', err);
        setError('Error al cargar los datos del cliente');
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        <span className="ml-3 text-text-secondary">Cargando datos del cliente...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/admin/crm/customers')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Clientes
        </Button>
        <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4 text-status-error">
          {error || 'Cliente no encontrado'}
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalOrders = orders.length;
  const ltv = customer.lifetimeValue;
  const aov = totalOrders > 0 ? ltv / totalOrders : 0;
  const antiquity = customer.lastLogin
    ? Math.floor((new Date().getTime() - customer.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const customerForCard = {
    id: customer.id,
    name: customer.fullName,
    email: customer.email,
    avatarUrl: customer.avatarUrl || '',
    segments: [customer.segment],
    phone: customer.phone,
    firstName: customer.firstName,
    lastName: customer.lastName,
    city: customer.city,
    avatar: customer.avatar,
    street: customer.street,
    number: customer.number,
    floor: customer.floor,
    postalCode: customer.postalCode,
    fullAddress: customer.fullAddress,
    language: customer.language,
  };

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/admin/crm/customers')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Clientes
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Loyalty */}
        <div className="space-y-6">
          <CustomerProfileCard customer={customerForCard} />
          <LoyaltyManager customerId={customer.id} />
        </div>

        {/* Right Column: Stats & Orders */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerStats 
            ltv={ltv}
            aov={aov}
            totalOrders={totalOrders}
            antiquity={antiquity}
          />

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
            {orders.length > 0 ? (
              <DataTable
                columns={orderColumns}
                data={orders}
              />
            ) : (
              <p className="text-text-secondary text-center py-8">No hay pedidos registrados</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
