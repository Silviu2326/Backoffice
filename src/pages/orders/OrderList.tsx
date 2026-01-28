import React, { useMemo, useState, useEffect } from 'react';
import { Eye, Plus, Loader2 } from 'lucide-react';
import { Order, OrderStatus, Customer } from '../../types/core';
import { getAllOrders, createOrder } from '../../features/orders/api/orderService';
import { getCustomers } from '../../features/crm/api/customerService';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/Tabs';
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
  const [activeTab, setActiveTab] = useState('todos');
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
      console.log('🚀 [OrderList] Iniciando carga de órdenes...');
      setIsLoading(true);
      const allOrders = await getAllOrders();
      console.log('✅ [OrderList] Órdenes recibidas:', allOrders.length, allOrders);
      setOrders(allOrders);
      console.log('📊 [OrderList] Estado actualizado con órdenes:', allOrders);
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

  const filteredOrders = useMemo(() => {
    console.log('🔍 [OrderList] Filtrando órdenes...', { activeTab, totalOrders: orders.length });
    console.log('📦 [OrderList] Órdenes originales:', orders);

    let filtered = orders;

    switch (activeTab) {
      case 'pendientes':
        filtered = orders.filter((order) => {
          const matches = [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.PENDING].includes(order.status);
          console.log(`  - Orden ${order.orderNumber}: status=${order.status}, matches pendientes=${matches}`);
          return matches;
        });
        break;
      case 'proceso':
        filtered = orders.filter((order) => {
          const matches = [
            OrderStatus.PREPARING,
            OrderStatus.READY_TO_SHIP,
            OrderStatus.SHIPPED,
            OrderStatus.PROCESSING,
          ].includes(order.status);
          console.log(`  - Orden ${order.orderNumber}: status=${order.status}, matches proceso=${matches}`);
          return matches;
        });
        break;
      case 'completados':
        filtered = orders.filter((order) => {
          const matches = order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED;
          console.log(`  - Orden ${order.orderNumber}: status=${order.status}, matches completados=${matches}`);
          return matches;
        });
        break;
      case 'incidencias':
        filtered = orders.filter((order) => {
          const matches = [OrderStatus.RETURNED, OrderStatus.CANCELLED, OrderStatus.CANCELLED_LOWERCASE, OrderStatus.FAILED].includes(order.status);
          console.log(`  - Orden ${order.orderNumber}: status=${order.status}, matches incidencias=${matches}`);
          return matches;
        });
        break;
      default:
        console.log('  - Tab "todos": mostrando todas las órdenes');
        break;
    }

    console.log('✅ [OrderList] Órdenes filtradas:', filtered.length, filtered);

    // Sort by date descending
    const sorted = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log('✅ [OrderList] Órdenes ordenadas:', sorted.length);

    return sorted;
  }, [activeTab, orders]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    const paginated = filteredOrders.slice(start, start + pageSize);
    console.log('📄 [OrderList] Órdenes paginadas:', { page, pageSize, start, total: filteredOrders.length, showing: paginated.length }, paginated);
    return paginated;
  }, [filteredOrders, page]);

  const getPaymentStatusBadge = (stripePaymentStatus?: string) => {
    if (!stripePaymentStatus) {
      return <Badge variant="warning">{t('paymentStatus.noPayment')}</Badge>;
    }

    switch (stripePaymentStatus) {
      case 'succeeded':
        return <Badge variant="success" dot>{t('paymentStatus.succeeded')}</Badge>;
      case 'processing':
        return <Badge variant="brand" dot>{t('paymentStatus.processing')}</Badge>;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return <Badge variant="warning" dot>{t('paymentStatus.requiresAction')}</Badge>;
      case 'canceled':
        return <Badge variant="danger" dot>{t('paymentStatus.canceled')}</Badge>;
      default:
        return <Badge variant="default">{stripePaymentStatus}</Badge>;
    }
  };

  const columns: Column<Order>[] = [
    {
      header: t('orders.orderId'),
      accessorKey: 'orderNumber',
      className: 'font-medium text-white',
    },
    {
      header: t('orders.customer'),
      render: (order) => (
        <div className="flex flex-col">
          <span className="text-text-secondary">
            {getCustomerName(order.customerId)}
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
      header: t('orders.status'),
      render: (order) => getStatusBadge(order.status),
    },
    {
      header: t('orders.stripePayment'),
      render: (order) => getPaymentStatusBadge(order.stripePaymentStatus),
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

      <Tabs defaultValue="todos" onValueChange={(val) => { setActiveTab(val); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="todos">{t('orders.all')}</TabsTrigger>
          <TabsTrigger value="pendientes">{t('orders.pending')}</TabsTrigger>
          <TabsTrigger value="proceso">{t('orders.inProgress')}</TabsTrigger>
          <TabsTrigger value="completados">{t('orders.completed')}</TabsTrigger>
          <TabsTrigger value="incidencias">{t('orders.incidents')}</TabsTrigger>
        </TabsList>

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
                total: filteredOrders.length,
                onPageChange: setPage,
              }}
            />
          )}
        </div>
      </Tabs>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg bg-white/5 p-4 border border-white/10">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-text-secondary">{t('orders.customer')}</h4>
                  <p className="font-medium text-white">{getCustomerName(selectedOrder.customerId)}</p>
                  <p className="text-sm text-text-secondary">ID: {selectedOrder.customerId}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-text-secondary">{t('orders.shippingAddress')}</h4>
                  <p className="text-sm text-white">
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                    {selectedOrder.shippingAddress.country}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-text-secondary">{t('orders.billingAddress')}</h4>
                  <p className="text-sm text-white">
                    {selectedOrder.billingAddress.street}<br />
                    {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zipCode}<br />
                    {selectedOrder.billingAddress.country}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-medium text-white">{t('orders.orderItems')}</h4>
                <OrderItemsTable
                  items={selectedOrder.items}
                  totals={{
                    subtotal: selectedOrder.items.reduce((acc, item) => acc + item.totalPrice, 0),
                    shipping: 0,
                    tax: 0,
                    discount: 0,
                    total: selectedOrder.totalAmount
                  }}
                />
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
