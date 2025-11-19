import React, { useMemo, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { MOCK_ORDERS, MOCK_CUSTOMERS } from '../../data/mockFactory';
import { Order, OrderStatus } from '../../types/core';
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

const OrderList = () => {
  const [activeTab, setActiveTab] = useState('todos');
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const pageSize = 10;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return <Badge variant="warning" dot>Pendiente Pago</Badge>;
      case OrderStatus.PAID:
        return <Badge variant="success" dot>Pagado</Badge>;
      case OrderStatus.PREPARING:
        return <Badge variant="brand" dot>Preparando</Badge>;
      case OrderStatus.READY_TO_SHIP:
        return <Badge variant="brand" dot>Listo para Enviar</Badge>;
      case OrderStatus.SHIPPED:
        return <Badge variant="brand" dot>Enviado</Badge>;
      case OrderStatus.DELIVERED:
        return <Badge variant="success" dot>Entregado</Badge>;
      case OrderStatus.RETURNED:
        return <Badge variant="danger" dot>Devuelto</Badge>;
      case OrderStatus.CANCELLED:
        return <Badge variant="danger" dot>Cancelado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = MOCK_CUSTOMERS.find((c) => c.id === customerId);
    return customer ? customer.fullName : 'Cliente Desconocido';
  };

  const filteredOrders = useMemo(() => {
    let filtered = MOCK_ORDERS;

    switch (activeTab) {
      case 'pendientes':
        filtered = MOCK_ORDERS.filter((order) =>
          [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID].includes(order.status)
        );
        break;
      case 'proceso':
        filtered = MOCK_ORDERS.filter((order) =>
          [
            OrderStatus.PREPARING,
            OrderStatus.READY_TO_SHIP,
            OrderStatus.SHIPPED,
          ].includes(order.status)
        );
        break;
      case 'completados':
        filtered = MOCK_ORDERS.filter((order) =>
          order.status === OrderStatus.DELIVERED
        );
        break;
      case 'incidencias':
        filtered = MOCK_ORDERS.filter((order) =>
          [OrderStatus.RETURNED, OrderStatus.CANCELLED].includes(order.status)
        );
        break;
      default:
        break;
    }
    
    // Sort by date descending
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [activeTab]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page]);

  const columns: Column<Order>[] = [
    {
      header: 'ID Pedido',
      accessorKey: 'orderNumber',
      className: 'font-medium text-white',
    },
    {
      header: 'Cliente',
      render: (order) => (
        <span className="text-text-secondary">
          {getCustomerName(order.customerId)}
        </span>
      ),
    },
    {
      header: 'Fecha',
      render: (order) => (
        <span className="text-text-secondary">
          {formatDate(order.createdAt, 'short')}
        </span>
      ),
    },
    {
      header: 'Total',
      render: (order) => (
        <span className="font-medium text-white">
          {formatCurrency(order.totalAmount)}
        </span>
      ),
    },
    {
      header: 'Estado',
      render: (order) => getStatusBadge(order.status),
    },
    {
      header: 'Método Envío',
      render: () => <span className="text-text-secondary">Estándar</span>,
    },
    {
      header: 'Acción',
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
          <span className="sr-only">Ver Detalle</span>
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="text-text-secondary">
            Gestiona y realiza el seguimiento de todos los pedidos
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Pedido
        </Button>
      </div>

      <Tabs defaultValue="todos" onValueChange={(val) => { setActiveTab(val); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="proceso">En Proceso</TabsTrigger>
          <TabsTrigger value="completados">Completados</TabsTrigger>
          <TabsTrigger value="incidencias">Incidencias</TabsTrigger>
        </TabsList>

        <div className="mt-6">
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
        </div>
      </Tabs>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalHeader>Crear Nuevo Pedido</ModalHeader>
        <ModalBody className="space-y-4">
          <Select
            label="Cliente"
            options={MOCK_CUSTOMERS.map(c => ({ value: c.id, label: c.fullName }))}
            onChange={() => {}}
            placeholder="Seleccionar cliente"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total estimado"
              placeholder="0.00"
              type="number"
            />
            <Select
              label="Estado inicial"
              options={[
                { value: OrderStatus.PENDING_PAYMENT, label: 'Pendiente Pago' },
                { value: OrderStatus.PAID, label: 'Pagado' },
              ]}
              onChange={() => {}}
              value={OrderStatus.PENDING_PAYMENT}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setIsCreateModalOpen(false)}>
            Crear Pedido
          </Button>
        </ModalFooter>
      </Modal>

      {selectedOrder && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <div className="min-w-[800px] max-w-[90vw]">
            <ModalHeader className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>Pedido {selectedOrder.orderNumber}</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="text-sm font-normal text-text-secondary">
                {formatDate(selectedOrder.createdAt, 'full')}
              </div>
            </ModalHeader>
            <ModalBody className="space-y-6">
              <div className="grid grid-cols-3 gap-6 rounded-lg bg-white/5 p-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-text-secondary">Cliente</h4>
                  <p className="font-medium text-white">{getCustomerName(selectedOrder.customerId)}</p>
                  <p className="text-sm text-text-secondary">{MOCK_CUSTOMERS.find(c => c.id === selectedOrder.customerId)?.email}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-text-secondary">Dirección de Envío</h4>
                  <p className="text-sm text-white">
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                    {selectedOrder.shippingAddress.country}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-text-secondary">Dirección de Facturación</h4>
                  <p className="text-sm text-white">
                    {selectedOrder.billingAddress.street}<br />
                    {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zipCode}<br />
                    {selectedOrder.billingAddress.country}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-medium text-white">Artículos del Pedido</h4>
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
            <ModalFooter>
              <Button onClick={() => setIsViewModalOpen(false)}>
                Cerrar
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderList;
