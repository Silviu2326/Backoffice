import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { 
  getServices, 
  createService, 
  updateService, 
  deleteService,
  Service 
} from '../../features/retail/api/serviceService';

const ServiceManager: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });

  // Cargar servicios desde Supabase
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedServices = await getServices();
        setServices(fetchedServices);
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Error al cargar los servicios');
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        icon: service.icon || '',
      });
    } else {
      setSelectedService(null);
      setFormData({
        name: '',
        description: '',
        icon: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('El nombre del servicio es obligatorio');
      return;
    }

    try {
      setIsSaving(true);
      
      if (selectedService) {
        // Actualizar servicio existente
        const updated = await updateService(selectedService.id, formData);
        setServices(services.map(s => s.id === updated.id ? updated : s));
      } else {
        // Crear nuevo servicio
        const created = await createService(formData);
        setServices([...services, created]);
      }

      setIsModalOpen(false);
      setSelectedService(null);
      setFormData({ name: '', description: '', icon: '' });
    } catch (err) {
      console.error('Error saving service:', err);
      alert('Error al guardar el servicio. Por favor, intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio? Esto afectará a todas las tiendas que lo usen.')) {
      return;
    }

    try {
      await deleteService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('Error al eliminar el servicio. Por favor, intenta de nuevo.');
    }
  };

  const columns: Column<Service>[] = [
    {
      header: 'Nombre',
      accessorKey: 'name',
      render: (row: Service) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center">
            <span className="text-brand-orange text-lg">{row.icon || '📋'}</span>
          </div>
          <div>
            <div className="font-medium text-white">{row.name}</div>
            {row.description && (
              <div className="text-sm text-text-secondary">{row.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Icono',
      accessorKey: 'icon',
      render: (row: Service) => (
        <Badge variant="default">{row.icon || 'Sin icono'}</Badge>
      ),
    },
    {
      header: 'Acciones',
      render: (row: Service) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal(row)}
            className="gap-1"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        <span className="ml-3 text-text-secondary">Cargando servicios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Servicios</h1>
          <p className="text-text-secondary mt-1">
            Gestiona los servicios disponibles que pueden asignarse a las tiendas
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<Plus className="w-4 h-4" />}>
          Nuevo Servicio
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 bg-[#2C2C2C] border-white/5">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Buscar servicios..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredServices}
            columns={columns}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-xl font-semibold text-white">
            {selectedService ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nombre del Servicio <span className="text-red-400">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Terraza exterior"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del servicio..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nombre del Icono
            </label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Ej: wifi, umbrella, car, accessibility, dog"
            />
            <p className="text-xs text-text-secondary mt-2">
              Nombres de iconos disponibles: wifi, umbrella, car, accessibility, dog, sunny, parking, pmr, pets
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ServiceManager;
















