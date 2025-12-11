import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  XCircle, 
  MapPin, 
  Truck, 
  CreditCard, 
  Calendar,
  Phone,
  ExternalLink,
  CheckCircle,
  Package,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/core';
import { getOrderById, updateOrderStatus } from '../../features/orders/api/orderService';
import Button from '../../components/ui/Button';
import { OrderPipeline } from '../../components/orders/OrderPipeline';
import OrderItemsTable from '../../components/orders/OrderItemsTable';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { formatDate, formatCurrency } from '../../utils/formatters';

// --- Mock Components for this Page ---

// 1. Customer Mini Card
interface CustomerMiniCardProps {
  customerId: string;
}

const CustomerMiniCard = ({ customerId }: CustomerMiniCardProps) => {
  // In a real app, you would fetch customer data from Supabase Auth or a customers table
  // For now, we'll just show the customer ID

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-white">Cliente</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ExternalLink size={16} />
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <Avatar 
            src={undefined} 
            alt="Cliente" 
            size="lg" 
            fallback="C" 
        />
        <div>
          <p className="font-medium text-white">Cliente</p>
          <p className="text-sm text-text-secondary">ID: {customerId.substring(0, 8)}...</p>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
            <Badge variant="default">
                Cliente
            </Badge>
        </div>
      </div>
      
      <Button variant="outline" className="w-full">Ver Perfil Completo</Button>
    </Card>
  );
};

// 2. Shipping Info Card
interface ShippingInfoProps {
  address: Order['shippingAddress'];
  orderStatus: OrderStatus;
}

const ShippingInfo = ({ address, orderStatus }: ShippingInfoProps) => {
  const [trackingNumber, setTrackingNumber] = useState('TRK-889231002'); // Mock initial value
  const isShipped = [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(orderStatus);

  return (
    <Card className="p-6 space-y-6">
       <h3 className="text-lg font-semibold text-white">Envío</h3>
       
       <div className="space-y-4">
          <div className="flex gap-3">
              <MapPin className="text-text-muted mt-1 flex-shrink-0" size={18} />
              <div className="text-sm text-text-secondary">
                  <p className="text-white font-medium">Dirección de Entrega</p>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country}</p>
              </div>
          </div>

          <div className="pt-4 border-t border-white/10">
             <label className="block text-sm font-medium text-text-secondary mb-2">
                Tracking Number
             </label>
             <div className="flex gap-2">
                 <Input 
                    value={trackingNumber} 
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ej. 1Z999AA101..."
                    className="flex-1"
                    readOnly={!isShipped} // Only editable if not shipped? Or maybe always editable. Let's leave it editable for demo.
                 />
                 <Button variant="secondary" size="icon">
                    <Truck size={18} />
                 </Button>
             </div>
             {!isShipped && (
                <p className="text-xs text-text-muted mt-2">
                    El número de seguimiento se generará automáticamente al enviar.
                </p>
             )}
          </div>
       </div>
    </Card>
  );
};

// 3. Order History (Timeline)
const OrderHistory = ({ order }: { order: Order }) => {
    // Mock history based on order state
    const events = [
        { title: 'Pedido Creado', date: order.createdAt, icon: <CreditCard size={14} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { title: 'Pago Confirmado', date: new Date(order.createdAt.getTime() + 1000 * 60 * 5), icon: <CheckCircle size={14} />, color: 'text-green-400', bg: 'bg-green-400/10' },
        { title: 'Preparación Iniciada', date: new Date(order.createdAt.getTime() + 1000 * 60 * 60 * 2), icon: <Package size={14} />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ];

    // Add fake shipping/delivery events if applicable
    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status)) {
         events.push({ title: 'Pedido Enviado', date: new Date(order.createdAt.getTime() + 1000 * 60 * 60 * 24), icon: <Truck size={14} />, color: 'text-indigo-400', bg: 'bg-indigo-400/10' });
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Historial</h3>
            <div className="space-y-6">
                {events.map((event, i) => (
                    <div key={i} className="relative flex gap-4">
                        {/* Line connecting nodes */}
                        {i !== events.length - 1 && (
                            <div className="absolute left-[15px] top-8 w-0.5 h-full bg-white/10 -z-10" />
                        )}
                        
                        <div className={`w-8 h-8 rounded-full ${event.bg} flex items-center justify-center border border-white/5 flex-shrink-0`}>
                             <span className={event.color}>{event.icon}</span>
                        </div>
                        <div>
                            <p className="font-medium text-white text-sm">{event.title}</p>
                            <p className="text-xs text-text-muted">{formatDate(event.date, 'long')}</p>
                        </div>
                    </div>
                ))}
                
                {/* Add Note Input */}
                <div className="pt-4 mt-2 border-t border-white/10">
                    <Input placeholder="Añadir nota interna..." className="mb-2" />
                    <div className="flex justify-end">
                        <Button size="sm" variant="secondary">Añadir Nota</Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

// --- Main Page Component ---

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        setError('ID de pedido no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const fetchedOrder = await getOrderById(id);
        
        if (!fetchedOrder) {
          setError('Pedido no encontrado');
          return;
        }

        setOrder(fetchedOrder);
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Error al cargar el pedido');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-400 mb-4">{error || 'Pedido no encontrado'}</p>
        <Button onClick={() => navigate('/admin/orders')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Pedidos
        </Button>
      </div>
    );
  }

  // Calculate totals for the table
  const subtotal = order.totalAmount * 0.85; // Mock logic
  const tax = order.totalAmount * 0.15;
  const shipping = 15.00;
  const total = order.totalAmount + shipping;

  // Transform items for the table component (it expects image and variantName)
  const tableItems = order.items.map(item => ({
      ...item,
      image: undefined, // Mock doesn't have this directly on item, would need product lookup
      variantName: 'Standard'
  }));

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
               <span>Pedidos</span>
               <span>/</span>
               <span className="text-text-secondary">Detalle</span>
           </div>
           <h1 className="text-3xl font-bold text-white flex items-center gap-3">
               {order.orderNumber}
               <Badge variant={order.status === OrderStatus.CANCELLED ? 'danger' : 'success'}>
                   {order.status}
               </Badge>
           </h1>
           <p className="text-text-secondary mt-1 flex items-center gap-2">
               <Calendar size={14} />
               {formatDate(order.createdAt, 'long')}
           </p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button variant="secondary" className="gap-2">
                <Printer size={16} />
                Imprimir
            </Button>
            {order.status !== OrderStatus.CANCELLED && (
                <Button variant="danger" className="gap-2">
                    <XCircle size={16} />
                    Cancelar Pedido
                </Button>
            )}
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-[#1E1E1E] rounded-lg border border-white/10 p-6 shadow-sm">
          <OrderPipeline status={order.status} />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column (Left) */}
          <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <OrderItemsTable 
                 items={tableItems}
                 totals={{
                     subtotal,
                     tax,
                     shipping,
                     discount: 0,
                     total
                 }}
              />

              {/* History Timeline */}
              <OrderHistory order={order} />
          </div>

          {/* Side Column (Right) */}
          <div className="space-y-6">
              {/* Customer Summary */}
              <CustomerMiniCard customerId={order.customerId} />

              {/* Shipping Info */}
              <ShippingInfo address={order.shippingAddress} orderStatus={order.status} />
              
              {/* Payment Info - Stripe */}
              <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Información de Pago</h3>

                  {/* Stripe Payment Status */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/10">
                       <div className="flex items-center gap-3">
                           <CreditCard className="text-brand-orange" />
                           <div>
                               <p className="font-medium text-white">
                                 {order.stripePaymentIntentId ? 'Pago con Stripe' : 'Método de Pago'}
                               </p>
                               <p className="text-xs text-text-muted">
                                 {order.paidAt ? formatDate(order.paidAt, 'long') : 'Pendiente'}
                               </p>
                           </div>
                       </div>
                       {order.stripePaymentStatus === 'succeeded' ? (
                         <Badge variant="success">Pagado</Badge>
                       ) : order.stripePaymentStatus === 'processing' ? (
                         <Badge variant="brand">Procesando</Badge>
                       ) : order.stripePaymentStatus ? (
                         <Badge variant="warning">{order.stripePaymentStatus}</Badge>
                       ) : (
                         <Badge variant="warning">Sin Pago</Badge>
                       )}
                    </div>

                    {/* Stripe Details */}
                    {order.stripePaymentIntentId && (
                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <div>
                          <p className="text-xs text-text-muted mb-1">Payment Intent ID</p>
                          <p className="text-sm font-mono text-white bg-white/5 p-2 rounded border border-white/10 break-all">
                            {order.stripePaymentIntentId}
                          </p>
                        </div>

                        {order.stripePaymentStatus && (
                          <div>
                            <p className="text-xs text-text-muted mb-1">Estado en Stripe</p>
                            <p className="text-sm text-white capitalize">
                              {order.stripePaymentStatus.replace(/_/g, ' ')}
                            </p>
                          </div>
                        )}

                        {order.paidAt && (
                          <div>
                            <p className="text-xs text-text-muted mb-1">Fecha de Pago</p>
                            <p className="text-sm text-white">
                              {formatDate(order.paidAt, 'full')}
                            </p>
                          </div>
                        )}

                        {/* Link to Stripe Dashboard */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => window.open(`https://dashboard.stripe.com/payments/${order.stripePaymentIntentId}`, '_blank')}
                        >
                          <ExternalLink size={14} className="mr-2" />
                          Ver en Stripe Dashboard
                        </Button>
                      </div>
                    )}

                    {/* Order Financial Summary */}
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      {order.subtotal !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Subtotal:</span>
                          <span className="text-white font-medium">{formatCurrency(order.subtotal)}</span>
                        </div>
                      )}
                      {order.shippingCost !== undefined && order.shippingCost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Envío:</span>
                          <span className="text-white font-medium">{formatCurrency(order.shippingCost)}</span>
                        </div>
                      )}
                      {order.discount !== undefined && order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Descuento:</span>
                          <span className="text-green-400 font-medium">-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base pt-2 border-t border-white/10">
                        <span className="text-white font-semibold">Total:</span>
                        <span className="text-brand-orange font-bold">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Metadata */}
                    {order.metadata && Object.keys(order.metadata).length > 0 && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-text-muted mb-2">Información Adicional</p>
                        <div className="bg-white/5 p-3 rounded border border-white/10">
                          <pre className="text-xs text-text-secondary overflow-x-auto">
                            {JSON.stringify(order.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
              </Card>
          </div>

      </div>
    </div>
  );
};

export default OrderDetail;
