import React, { useState } from 'react';
import { CustomerFilters } from '../../components/crm/CustomerFilters';
import { DataTable, Column } from '../../components/ui/DataTable';
import Avatar from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Plus, Eye } from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Link } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  lastOrder: string;
  status: 'active' | 'inactive' | 'lead';
  avatar: string;
}

const customerColumns: Column<Customer>[] = [
  {
    header: 'Cliente',
    accessorKey: 'name',
    render: (row: Customer) => (
      <div className="flex items-center space-x-3">
        <Avatar src={row.avatar} alt={row.name} fallback={row.name.substring(0, 2).toUpperCase()} />
        <Link to={`/admin/crm/customers/${row.id}`} className="text-blue-600 hover:underline">
          {row.name}
        </Link>
      </div>
    ),
  },
  {
    header: 'Email',
    accessorKey: 'email',
  },
  {
    header: 'Teléfono',
    accessorKey: 'phone',
  },
  {
    header: 'Total Gastado',
    accessorKey: 'totalSpent',
    render: (row: Customer) => `$${row.totalSpent.toFixed(2)}`,
  },
  {
    header: 'Último Pedido',
    accessorKey: 'lastOrder',
    render: (row: Customer) => new Date(row.lastOrder).toLocaleDateString(),
  },
  {
    header: 'Estado',
    accessorKey: 'status',
    render: (row: Customer) => {
      const variants: Record<string, "success" | "danger" | "warning"> = {
        active: 'success',
        inactive: 'danger',
        lead: 'warning',
      };
      return <Badge variant={variants[row.status] || 'default'}>{row.status}</Badge>;
    },
  },
  {
    header: 'Acciones',
    render: (row: Customer) => (
      <Link to={`/admin/crm/customers/${row.id}`}>
        <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
          Ver Ficha
        </Button>
      </Link>
    ),
  },
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Juan Perez',
    email: 'juan.perez@example.com',
    phone: '555-1234',
    totalSpent: 1250.75,
    lastOrder: '2025-10-20',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '555-5678',
    totalSpent: 890.50,
    lastOrder: '2025-11-15',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Carlos Sanchez',
    email: 'carlos.sanchez@example.com',
    phone: '555-9012',
    totalSpent: 300.00,
    lastOrder: '2025-09-01',
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: 'Ana Lopez',
    email: 'ana.lopez@example.com',
    phone: '555-3456',
    totalSpent: 50.25,
    lastOrder: '2025-11-18',
    status: 'lead',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
];

export const CustomerList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'lead',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
      setNewCustomer({ ...newCustomer, status: value as any });
  };

  const handleCreateCustomer = () => {
    const customer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      ...newCustomer,
      totalSpent: 0,
      lastOrder: new Date().toISOString(),
      avatar: '',
    };
    setCustomers([...customers, customer]);
    setIsModalOpen(false);
    setNewCustomer({ name: '', email: '', phone: '', status: 'active' });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">Clientes</h1>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Nuevo Cliente
        </Button>
      </div>
      
      <CustomerFilters />
      
      <div className="mt-6">
        <DataTable
          columns={customerColumns}
          data={customers}
          pagination={{
            page: 1,
            pageSize: 10,
            total: customers.length,
            onPageChange: () => {},
          }}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>Crear Nuevo Cliente</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nombre Completo"
              name="name"
              value={newCustomer.name}
              onChange={handleInputChange}
              placeholder="Ej. Juan Perez"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={newCustomer.email}
              onChange={handleInputChange}
              placeholder="juan@example.com"
            />
            <Input
              label="Teléfono"
              name="phone"
              value={newCustomer.phone}
              onChange={handleInputChange}
              placeholder="+34 600 000 000"
            />
            <Select
              label="Estado"
              options={[
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
                { value: 'lead', label: 'Lead' },
              ]}
              value={newCustomer.status}
              onChange={handleSelectChange}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateCustomer}>
            Crear Cliente
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
