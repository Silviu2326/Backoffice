import React, { useState, useEffect, useMemo } from 'react';
import { CustomerFilters } from '../../components/crm/CustomerFilters';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Plus, Eye, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Link } from 'react-router-dom';
import { getCustomers, updateCustomer, createCustomer, deleteCustomer } from '../../features/crm/api/customerService';
import { Customer as CustomerType, CustomerSegment } from '../../types/core';
import { getAllOrders } from '../../features/orders/api/orderService';
import { useLanguage } from '../../context/LanguageContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'lead';
  avatar: string;
  city?: string;
  fullAddress?: string;
  language?: string;
  pointsBalance?: number;
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
    header: 'Creado en',
    accessorKey: 'createdAt',
    render: (row: Customer) => new Date(row.createdAt).toLocaleDateString(),
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

export const CustomerList: React.FC = () => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | 'all'>('all');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'lead',
    avatar: '',
  });

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm(t('customers.confirmDelete'))) {
      return;
    }

    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      alert(t('customers.deleteError') + ': ' + (err.message || 'Error'));
    }
  };

  const customerColumns: Column<Customer>[] = useMemo(() => [
    {
      header: t('customers.customer'),
      accessorKey: 'name',
      render: (row: Customer) => {
        const avatarName = row.avatar
          ? AVAILABLE_AVATARS.find(a => a.path === row.avatar)?.name || row.avatar
          : t('customers.noAvatar');
        return (
          <div className="flex flex-col">
            <Link to={`/admin/crm/customers/${row.id}`} className="text-blue-600 hover:underline">
              {row.name}
            </Link>
            <span className="text-xs text-text-secondary">{avatarName}</span>
            {row.city && (
              <span className="text-xs text-text-muted">{row.city}</span>
            )}
          </div>
        );
      },
    },
    {
      header: t('common.email'),
      accessorKey: 'email',
      render: (row: Customer) => (
        <div className="flex flex-col">
          <span className="text-white">{row.email}</span>
          {row.language && (
            <span className="text-xs text-text-muted">
              {row.language === 'es' ? '🇪🇸 Español' : '🇬🇧 English'}
            </span>
          )}
        </div>
      ),
    },
    {
      header: t('customers.phone'),
      accessorKey: 'phone',
    },
    {
      header: t('customers.points'),
      render: (row: Customer) => (
        <span className="text-brand-orange font-semibold">
          {row.pointsBalance || 0} pts
        </span>
      ),
    },
    {
      header: t('customers.createdAt'),
      accessorKey: 'createdAt',
      render: (row: Customer) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: t('customers.status'),
      accessorKey: 'status',
      render: (row: Customer) => {
        const variants: Record<string, "success" | "danger" | "warning"> = {
          active: 'success',
          inactive: 'danger',
          lead: 'warning',
        };
        const statusLabels: Record<string, string> = {
          active: t('status.active'),
          inactive: t('status.inactive'),
          lead: t('status.lead'),
        };
        return <Badge variant={variants[row.status] || 'default'}>{statusLabels[row.status] || row.status}</Badge>;
      },
    },
    {
      header: t('customers.actions'),
      render: (row: Customer) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/crm/customers/${row.id}`}>
            <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
              {t('common.view')}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteCustomer(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [t]);

  // Cargar clientes desde Supabase
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const filters: {
          search?: string;
          segment?: CustomerSegment;
          status?: 'active' | 'inactive';
        } = {};

        if (searchTerm) {
          filters.search = searchTerm;
        }

        if (segmentFilter !== 'all') {
          filters.segment = segmentFilter;
        }

        if (statusFilter !== 'all') {
          filters.status = statusFilter;
        }

        const customersData = await getCustomers(filters);
        
        // Mapear Customer a la interfaz de la tabla
        const mappedCustomers = await Promise.all(
          customersData.map(async (customer) => {
            // Obtener pedidos para calcular estadísticas (si se necesita en el futuro)
            // const orders = await getAllOrders({ customerId: customer.id });

            return {
              id: customer.id,
              name: customer.fullName,
              email: customer.email,
              phone: customer.phone || '',
              createdAt: customer.createdAt.toISOString(),
              status: customer.status === 'ACTIVE' ? 'active' : 'inactive' as 'active' | 'inactive' | 'lead',
              avatar: customer.avatar || customer.avatarUrl || '',
              city: customer.city,
              fullAddress: customer.fullAddress,
              language: customer.language,
              pointsBalance: customer.pointsBalance,
            } as Customer;
          })
        );

        setCustomers(mappedCustomers);
      } catch (err) {
        console.error('Error loading customers:', err);
        setError(t('customers.error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [searchTerm, statusFilter, segmentFilter, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
      setNewCustomer({ ...newCustomer, status: value as any });
  };

  const handleCreateCustomer = async () => {
    try {
      if (!newCustomer.name || !newCustomer.email) {
        alert(t('customers.requiredFields'));
        return;
      }

      setIsLoading(true);
      const created = await createCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        status: newCustomer.status,
        avatar: newCustomer.avatar,
      });

      // Mapear el cliente creado a la interfaz local Customer
      const mappedCreated: Customer = {
        id: created.id,
        name: created.fullName,
        email: created.email,
        phone: newCustomer.phone,
        createdAt: new Date().toISOString(),
        status: created.status === 'ACTIVE' ? 'active' : 'inactive' as 'active' | 'inactive' | 'lead',
        avatar: created.avatar || created.avatarUrl || '',
        city: created.city,
        fullAddress: created.fullAddress,
        language: created.language,
        pointsBalance: created.pointsBalance,
      };

      // Actualizar la lista localmente
      setCustomers([mappedCreated, ...customers]);

      setIsModalOpen(false);
      setNewCustomer({ name: '', email: '', phone: '', status: 'active', avatar: '' });
      alert(t('customers.createSuccess'));
    } catch (err: any) {
      console.error('Error creating customer:', err);
      alert(t('customers.deleteError') + ': ' + (err.message || 'Error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">{t('customers.title')}</h1>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          {t('customers.newCustomer')}
        </Button>
      </div>

      <CustomerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        segmentFilter={segmentFilter}
        onSegmentChange={setSegmentFilter}
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            <span className="ml-3 text-text-secondary">{t('customers.loading')}</span>
          </div>
        ) : error ? (
          <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4 text-status-error">
            {error}
          </div>
        ) : (
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
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>{t('customers.createTitle')}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label={t('customers.fullName')}
              name="name"
              value={newCustomer.name}
              onChange={handleInputChange}
              placeholder="Ej. Juan Perez"
            />
            <Input
              label={t('common.email')}
              name="email"
              type="email"
              value={newCustomer.email}
              onChange={handleInputChange}
              placeholder="juan@example.com"
            />
            <Input
              label={t('customers.phone')}
              name="phone"
              value={newCustomer.phone}
              onChange={handleInputChange}
              placeholder="+34 600 000 000"
            />
            <Select
              label={t('customers.status')}
              options={[
                { value: 'active', label: t('status.active') },
                { value: 'inactive', label: t('status.inactive') },
                { value: 'lead', label: t('status.lead') },
              ]}
              value={newCustomer.status}
              onChange={handleSelectChange}
            />
            
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('customers.avatar')}
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
                  <p className="text-xs text-text-secondary mt-1 text-center">{t('common.none')}</p>
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
                  {t('customers.selectedAvatar')}: {AVAILABLE_AVATARS.find(a => a.path === newCustomer.avatar)?.name || 'Custom'}
                </p>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateCustomer}>
            {t('customers.createButton')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
