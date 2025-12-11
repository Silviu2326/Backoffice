import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable, Column } from '../../components/ui/DataTable';
import { getStores, createStore } from '../../features/retail/api/storeService';
import { Store } from '../../features/retail/api/storeService';

const StoreList: React.FC = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    allowPickup: true,
    pickupInstructions: '',
    isActive: true,
  });

  // Cargar tiendas desde Supabase
  useEffect(() => {
    const loadStores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const filters: { isActive?: boolean; city?: string; search?: string } = {};
        
        if (statusFilter === 'active') {
          filters.isActive = true;
        } else if (statusFilter === 'inactive') {
          filters.isActive = false;
        }
        
        if (cityFilter !== 'all') {
          filters.city = cityFilter;
        }
        
        if (searchQuery) {
          filters.search = searchQuery;
        }
        
        const fetchedStores = await getStores(filters);
        setStores(fetchedStores);
      } catch (err) {
        console.error('Error loading stores:', err);
        setError('Error al cargar las tiendas. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, [cityFilter, statusFilter, searchQuery]);

  // Obtener ciudades únicas para el filtro
  const cities = Array.from(new Set(stores.map(s => s.city))).sort();

  const handleCreateStore = async () => {
    if (!newStore.name || !newStore.address || !newStore.city) {
      alert('Por favor completa los campos obligatorios: Nombre, Dirección y Ciudad');
      return;
    }

    try {
      setIsCreating(true);
      const createdStore = await createStore(newStore);
      
      setStores([createdStore, ...stores]);
      setIsCreateModalOpen(false);
      setNewStore({
        name: '',
        address: '',
        city: '',
        phone: '',
        allowPickup: true,
        pickupInstructions: '',
        isActive: true,
      });
      
      alert('Tienda creada correctamente');
    } catch (err: any) {
      console.error('Error creating store:', err);
      alert('Error al crear la tienda: ' + (err.message || JSON.stringify(err)));
    } finally {
      setIsCreating(false);
    }
  };

  const columns: Column<Store>[] = [
    {
      header: 'Nombre',
      accessorKey: 'name',
      className: 'font-medium text-white',
    },
    {
      header: 'Dirección',
      accessorKey: 'address',
    },
    {
      header: 'Ciudad',
      accessorKey: 'city',
    },
    {
      header: 'Teléfono',
      accessorKey: 'phone',
    },
    {
      header: 'Acciones',
      render: (store) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/admin/retail/${store.id}`)}
        >
          Gestionar
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tiendas</h1>
          <p className="text-text-secondary">
            Gestiona tus ubicaciones físicas y sus horarios
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Tienda
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-[#2C2C2C] p-4 rounded-xl border border-white/5">
        <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Buscar tiendas..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: 'all', label: 'Todas las ciudades' },
                ...cities.map(c => ({ value: c, label: c }))
              ]}
              value={cityFilter}
              onChange={setCityFilter}
              placeholder="Ciudad"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Activas' },
                { value: 'inactive', label: 'Inactivas' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Estado"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          <span className="ml-3 text-text-secondary">Cargando tiendas...</span>
        </div>
      ) : (
        <div className="bg-[#1E1E1E] rounded-lg border border-white/10 overflow-hidden">
          <DataTable 
            data={stores} 
            columns={columns} 
          />
        </div>
      )}

      {/* Create Store Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-xl font-semibold text-white">Añadir Nueva Tienda</h2>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="Nombre de la tienda *"
            placeholder="Ej: Tienda Central"
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
          />
          <Input
            label="Dirección *"
            placeholder="Dirección completa"
            value={newStore.address}
            onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ciudad *"
              placeholder="Ej: Madrid"
              value={newStore.city}
              onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
            />
            <Input
              label="Teléfono"
              placeholder="+34 600 123 456"
              value={newStore.phone}
              onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowPickup"
              checked={newStore.allowPickup}
              onChange={(e) => setNewStore({ ...newStore, allowPickup: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-[#3A3A3A] text-[#ff6b35] focus:ring-[#ff6b35]"
            />
            <label htmlFor="allowPickup" className="text-sm text-text-secondary">
              Permite recogida (Click & Collect)
            </label>
          </div>
          {newStore.allowPickup && (
            <Input
              label="Instrucciones de recogida"
              placeholder="Ej: Recogida en mostrador principal"
              value={newStore.pickupInstructions}
              onChange={(e) => setNewStore({ ...newStore, pickupInstructions: e.target.value })}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
            Cancelar
          </Button>
          <Button onClick={handleCreateStore} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Tienda'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StoreList;
