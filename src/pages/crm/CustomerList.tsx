import React, { useState } from 'react';
import { CustomerFilters } from '../../components/crm/CustomerFilters';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Plus, Eye, Image as ImageIcon } from 'lucide-react';
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
    render: (row: Customer) => {
      const avatarName = row.avatar 
        ? AVAILABLE_AVATARS.find(a => a.path === row.avatar)?.name || 'Sin avatar'
        : 'Sin avatar';
      return (
        <div className="flex flex-col">
          <Link to={`/admin/crm/customers/${row.id}`} className="text-blue-600 hover:underline">
            {row.name}
          </Link>
          <span className="text-xs text-text-secondary">{avatarName}</span>
        </div>
      );
    },
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

// Lista de avatares disponibles desde la carpeta de assets
const AVAILABLE_AVATARS = [
  { name: 'BUCK', filename: 'BUCK.png', path: '/assets/avatares/BUCK.png' },
  { name: 'CANDELA', filename: 'CANDELA.png', path: '/assets/avatares/CANDELA.png' },
  { name: 'CATIRA', filename: 'CATIRA.png', path: '/assets/avatares/CATIRA.png' },
  { name: 'COOL CAT', filename: 'COOL CAT.png', path: '/assets/avatares/COOL CAT.png' },
  { name: 'GUAJIRA', filename: 'GUAJIRA.png', path: '/assets/avatares/GUAJIRA.png' },
  { name: 'MEDUSA', filename: 'MEDUSA.png', path: '/assets/avatares/MEDUSA.png' },
  { name: 'MORENA', filename: 'morena.png', path: '/assets/avatares/morena.png' },
  { name: 'SIFRINA', filename: 'SIFRINA.png', path: '/assets/avatares/SIFRINA.png' },
];

// Asignar avatares a los clientes mock de forma variada
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Juan Perez',
    email: 'juan.perez@example.com',
    phone: '555-1234',
    totalSpent: 1250.75,
    lastOrder: '2025-10-20',
    status: 'active',
    avatar: AVAILABLE_AVATARS.find(a => a.name === 'COOL CAT')?.path || AVAILABLE_AVATARS[0].path,
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '555-5678',
    totalSpent: 890.50,
    lastOrder: '2025-11-15',
    status: 'active',
    avatar: AVAILABLE_AVATARS.find(a => a.name === 'MORENA')?.path || AVAILABLE_AVATARS[1].path,
  },
  {
    id: '3',
    name: 'Carlos Sanchez',
    email: 'carlos.sanchez@example.com',
    phone: '555-9012',
    totalSpent: 300.00,
    lastOrder: '2025-09-01',
    status: 'inactive',
    avatar: AVAILABLE_AVATARS.find(a => a.name === 'BUCK')?.path || AVAILABLE_AVATARS[2].path,
  },
  {
    id: '4',
    name: 'Ana Lopez',
    email: 'ana.lopez@example.com',
    phone: '555-3456',
    totalSpent: 50.25,
    lastOrder: '2025-11-18',
    status: 'lead',
    avatar: AVAILABLE_AVATARS.find(a => a.name === 'SIFRINA')?.path || AVAILABLE_AVATARS[3].path,
  },
  {
    id: '5',
    name: 'Pedro Martinez',
    email: 'pedro.martinez@example.com',
    phone: '555-7890',
    totalSpent: 2100.00,
    lastOrder: '2025-11-20',
    status: 'active',
    avatar: AVAILABLE_AVATARS.find(a => a.name === 'CANDELA')?.path || AVAILABLE_AVATARS[4].path,
  },
  {
    id: '6',
    name: 'Laura Rodriguez',
    email: 'laura.rodriguez@example.com',
    phone: '555-2468',
    totalSpent: 450.30,
    lastOrder: '2025-11-10',
    status: 'active',
    avatar: AVAILABLE_AVATARS.find(a => a.name === 'CATIRA')?.path || AVAILABLE_AVATARS[5].path,
  },
  {
    id: '7',
    name: 'Roberto Fernandez',
    email: 'roberto.fernandez@example.com',
    phone: '555-1357',
    totalSpent: 120.00,
    lastOrder: '2025-10-05',
    status: 'inactive',
    avatar: AVAILABLE_AVATARS.find(a => a.name === 'GUAJIRA')?.path || AVAILABLE_AVATARS[6].path,
  },
  {
    id: '8',
    name: 'Carmen Torres',
    email: 'carmen.torres@example.com',
    phone: '555-9876',
    totalSpent: 675.80,
    lastOrder: '2025-11-19',
    status: 'lead',
    avatar: AVAILABLE_AVATARS.find(a => a.name === 'MEDUSA')?.path || AVAILABLE_AVATARS[7].path,
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
    avatar: '',
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
      avatar: newCustomer.avatar || '',
    };
    setCustomers([...customers, customer]);
    setIsModalOpen(false);
    setNewCustomer({ name: '', email: '', phone: '', status: 'active', avatar: '' });
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
            
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Avatar
              </label>
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 bg-[#2C2C2C] rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setNewCustomer({ ...newCustomer, avatar: '' })}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    newCustomer.avatar === ''
                      ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                      : 'border-transparent hover:border-white/20 bg-white/5'
                  }`}
                  title="Sin avatar"
                >
                  <div className="w-full aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-text-secondary" />
                  </div>
                  <p className="text-xs text-text-secondary mt-1 text-center">Ninguno</p>
                </button>
                {AVAILABLE_AVATARS.map((avatar) => (
                  <button
                    key={avatar.name}
                    type="button"
                    onClick={() => setNewCustomer({ ...newCustomer, avatar: avatar.path })}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      newCustomer.avatar === avatar.path
                        ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                        : 'border-transparent hover:border-white/20 bg-white/5'
                    }`}
                    title={avatar.name}
                  >
                    <div className="w-full aspect-square bg-white/10 rounded-lg overflow-hidden">
                      <img
                        src={avatar.path}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-1 text-center truncate">
                      {avatar.name}
                    </p>
                  </button>
                ))}
              </div>
              {newCustomer.avatar && (
                <p className="text-xs text-text-secondary mt-2">
                  Avatar seleccionado: {AVAILABLE_AVATARS.find(a => a.path === newCustomer.avatar)?.name || 'Personalizado'}
                </p>
              )}
            </div>
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
