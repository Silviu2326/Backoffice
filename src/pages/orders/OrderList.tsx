import React, { useMemo, useState, useEffect } from 'react';
import { Eye, Plus, Loader2 } from 'lucide-react';
import { Order, OrderStatus, Customer } from '../../types/core';
import { createOrder } from '../../features/orders/api/orderService';
import { getStripeOrders } from '../../features/orders/api/stripeOrderService';
import { getCustomers } from '../../features/crm/api/customerService';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import OrderItemsTable from '../../components/orders/OrderItemsTable';
import { useLanguage } from '../../context/LanguageContext';

const OrderList = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(OrderStatus.PENDING_PAYMENT);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const pageSize = 10;

  const [estimatedTotal, setEstimatedTotal] = useState('');

  // Load orders and customers from Supabase
  useEffect(() => {
    loadOrders();
    loadCustomers();
  }, []);

  const loadOrders = async () => {
    try {
      console.log('🚀 [OrderList] Iniciando carga de órdenes desde Stripe...');
      setIsLoading(true);
      const stripeOrders = await getStripeOrders();
      // Filtrar solo órdenes pagadas
      const paidOrders = stripeOrders.filter(order => order.stripePaymentStatus === 'paid');
      console.log('✅ [OrderList] Órdenes de Stripe recibidas:', stripeOrders.length, '- Pagadas:', paidOrders.length);
      setOrders(paidOrders);
      console.log('📊 [OrderList] Estado actualizado con órdenes pagadas:', paidOrders);
    } catch (error) {
      console.error('❌ [OrderList] Error loading orders:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ [OrderList] Carga finalizada, isLoading = false');
    }
  };

  const loadCustomers = async () => {
    try {
      const allCustomers = await getCustomers();
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomerId) {
      alert(t('orders.selectCustomerError'));
      return;
    }

    try {
      setIsLoading(true);
      const customer = customers.find(c => c.id === selectedCustomerId);
      const newOrder = await createOrder({
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        customerId: selectedCustomerId,
        customerEmail: customer?.email,
        totalAmount: parseFloat(estimatedTotal) || 0,
        status: selectedStatus,
        items: [],
        shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
        billingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
      });
      setOrders([newOrder, ...orders]);
      setIsCreateModalOpen(false);
      setSelectedCustomerId('');
      setEstimatedTotal('');
      alert(t('orders.createSuccess'));
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(t('orders.createError') + ': ' + (error.message || JSON.stringify(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
      case OrderStatus.PENDING:
        return <Badge variant="warning" dot>{t('orderStatus.pendingPayment')}</Badge>;
      case OrderStatus.PAID:
        return <Badge variant="success" dot>{t('orderStatus.paid')}</Badge>;
      case OrderStatus.PREPARING:
      case OrderStatus.PROCESSING:
        return <Badge variant="brand" dot>{t('orderStatus.preparing')}</Badge>;
      case OrderStatus.READY_TO_SHIP:
        return <Badge variant="brand" dot>{t('orderStatus.readyToShip')}</Badge>;
      case OrderStatus.SHIPPED:
        return <Badge variant="brand" dot>{t('orderStatus.shipped')}</Badge>;
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED:
        return <Badge variant="success" dot>{t('orderStatus.delivered')}</Badge>;
      case OrderStatus.RETURNED:
        return <Badge variant="danger" dot>{t('orderStatus.returned')}</Badge>;
      case OrderStatus.CANCELLED:
      case OrderStatus.CANCELLED_LOWERCASE:
      case OrderStatus.FAILED:
        return <Badge variant="danger" dot>{t('orderStatus.cancelled')}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.fullName : `Cliente ${customerId.substring(0, 8)}...`;
  };

  // Ordenar por fecha descendente (ya están filtradas solo las pagadas)
  const sortedOrders = useMemo(() => {
    console.log('📦 [OrderList] Ordenando órdenes pagadas:', orders.length);
    const sorted = [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log('✅ [OrderList] Órdenes ordenadas:', sorted.length);
    return sorted;
  }, [orders]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    const paginated = sortedOrders.slice(start, start + pageSize);
    console.log('📄 [OrderList] Órdenes paginadas:', { page, pageSize, start, total: sortedOrders.length, showing: paginated.length });
    return paginated;
  }, [sortedOrders, page]);

  const columns: Column<Order>[] = [
    {
      header: t('orders.orderId'),
      render: (order) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{order.orderNumber}</span>
          {order.orderNumber?.startsWith('STRIPE-') && (
            <Badge variant="brand" className="text-xs">Stripe</Badge>
          )}
        </div>
      ),
    },
    {
      header: t('orders.customer'),
      render: (order) => (
        <div className="flex flex-col">
          <span className="text-text-secondary">
            {order.customerId ? getCustomerName(order.customerId) : 'Cliente de Stripe'}
          </span>
          {order.customerEmail && (
            <span className="text-xs text-text-muted">{order.customerEmail}</span>
          )}
        </div>
      ),
    },
    {
      header: t('orders.date'),
      render: (order) => (
        <span className="text-text-secondary">
          {formatDate(order.createdAt, 'short')}
        </span>
      ),
    },
    {
      header: t('orders.total'),
      render: (order) => (
        <span className="font-medium text-white">
          {formatCurrency(order.totalAmount)}
        </span>
      ),
    },

    {
      header: t('orders.shippingMethod'),
      render: (order) => (
        <span className="text-text-secondary">
          {order.shippingMethod === 'home' ? t('shipping.home') :
           order.shippingMethod === 'pickup' ? t('shipping.pickup') : t('shipping.standard')}
        </span>
      ),
    },
    {
      header: t('orders.action'),
      render: (order) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            setSelectedOrder(order);
            setIsViewModalOpen(true);
          }}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">{t('orders.viewDetail')}</span>
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('orders.title')}</h1>
          <p className="text-text-secondary">
            {t('orders.subtitle')}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('orders.createOrder')}
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          <DataTable
            data={paginatedOrders}
            columns={columns}
            pagination={{
              page,
              pageSize,
              total: orders.length,
              onPageChange: setPage,
            }}
          />
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalHeader>{t('orders.createTitle')}</ModalHeader>
        <ModalBody className="space-y-4">
          <Select
            label={t('orders.customer')}
            options={customers.map(c => ({ value: c.id, label: c.fullName }))}
            value={selectedCustomerId}
            onChange={(val) => setSelectedCustomerId(val)}
            placeholder={t('orders.selectCustomer')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('orders.estimatedTotal')}
              placeholder="0.00"
              type="number"
              value={estimatedTotal}
              onChange={(e) => setEstimatedTotal(e.target.value)}
            />
            <Select
              label={t('orders.initialStatus')}
              options={[
                { value: OrderStatus.PENDING_PAYMENT, label: t('orders.pending') },
                { value: OrderStatus.PREPARING, label: t('orders.inProgress') },
                { value: OrderStatus.DELIVERED, label: t('orders.completed') },
                { value: OrderStatus.CANCELLED, label: t('orders.incidents') },
              ]}
              onChange={(val) => setSelectedStatus(val as OrderStatus)}
              value={selectedStatus}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateOrder}>
            {t('orders.createButton')}
          </Button>
        </ModalFooter>
      </Modal>

      {selectedOrder && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="xl">
          <ModalHeader className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold">Pedido {selectedOrder.orderNumber}</span>
              {getStatusBadge(selectedOrder.status)}
            </div>
            <div className="text-sm font-normal text-text-secondary">
              {formatDate(selectedOrder.createdAt, 'full')}
            </div>
          </ModalHeader>
          <ModalBody className="space-y-6 flex-1 overflow-y-auto pr-2">
              {/* Información del Cliente - Solo Email visible */}
              {selectedOrder.customerEmail && (
                <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                  <h4 className="mb-2 text-sm font-medium text-text-secondary">{t('orders.customer')}</h4>
                  <p className="text-sm text-white">{selectedOrder.customerEmail}</p>
                </div>
              )}

              {/* Tabla de Items Pagados */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-white">{t('orders.orderItems')}</h4>
                  <Badge variant="success">
                    {selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'producto' : 'productos'} pagados
                  </Badge>
                </div>
                
                {selectedOrder.items.length > 0 ? (
                  <OrderItemsTable
                    items={selectedOrder.items}
                    totals={{
                      subtotal: selectedOrder.subtotal,
                      shipping: selectedOrder.shippingCost,
                      tax: 0,
                      discount: selectedOrder.discount,
                      total: selectedOrder.totalAmount
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <p>No hay items detallados para este pedido</p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-white/10 pt-4">
              <Button onClick={() => setIsViewModalOpen(false)}>
                {t('common.close')}
              </Button>
            </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default OrderList;
