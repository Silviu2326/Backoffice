import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Phone, 
  Store as StoreIcon, 
  Trash2,
  Euro,
  ShoppingBag,
  Users,
  Star
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { OpeningHoursEditor, DaySchedule } from '../../components/retail/OpeningHoursEditor';
import { ServicePicker, ServiceId } from '../../components/retail/ServicePicker';
import { Badge } from '../../components/ui/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { RevenueChart } from '../../components/dashboard/RevenueChart';
import KPIWidget from '../../components/dashboard/KPIWidget';
import Avatar from '../../components/ui/Avatar';
import { DataTable, Column } from '../../components/ui/DataTable';
import { MOCK_PRODUCTS } from '../../data/mockFactory';
import { ProductStatus } from '../../types/core';

// --- Mock Data for Store Context ---

interface StoreData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  imageUrl: string;
  isActive: boolean;
  services: ServiceId[];
  schedule: DaySchedule[];
  coordinates: { lat: number; lng: number };
}

const DEFAULT_SCHEDULE = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
].map(day => ({
  day,
  isOpen: true,
  openTime: '09:00',
  closeTime: '20:00'
}));

const MOCK_STAFF = [
  { id: '1', name: 'Ana García', role: 'Store Manager', status: 'active', lastActive: 'Hace 5 min', avatar: null },
  { id: '2', name: 'Carlos Ruiz', role: 'Sales Associate', status: 'active', lastActive: 'Hace 1 hora', avatar: null },
  { id: '3', name: 'Laura Martínez', role: 'Inventory Specialist', status: 'break', lastActive: 'Hace 15 min', avatar: null },
  { id: '4', name: 'David López', role: 'Sales Associate', status: 'offline', lastActive: 'Ayer', avatar: null },
];

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Initialize with mock data based on ID
  const [store, setStore] = useState<StoreData>({
    id: id || 'new',
    name: id === '1' ? 'Tienda Central' : `Sucursal ${id}`,
    address: 'Calle Falsa 123, Ciudad',
    phone: '+34 600 123 456',
    email: 'tienda@ejemplo.com',
    imageUrl: 'https://via.placeholder.com/600x300',
    isActive: true,
    services: ['wifi', 'parking'],
    schedule: DEFAULT_SCHEDULE,
    coordinates: { lat: 40.416775, lng: -3.703790 },
  });

  // Mock Inventory (derived from products with random stock)
  const storeInventory = MOCK_PRODUCTS.slice(0, 15).map(p => ({
    ...p,
    stock: Math.floor(Math.random() * 100),
    lastRestock: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
  }));

  const handleSave = () => {
    console.log('Saving store data:', store);
    // Show success feedback logic here
  };

  const handleDelete = () => {
    console.log('Deleting store:', store.id);
    setIsDeleteModalOpen(false);
    navigate('/admin/retail');
  };

  // --- Columns for Tables ---

  const staffColumns: Column<typeof MOCK_STAFF[0]>[] = [
    {
      header: 'Empleado',
      render: (staff) => (
        <div className="flex items-center gap-3">
          <Avatar fallback={staff.name} src={staff.avatar} status={staff.status === 'active' ? 'online' : 'offline'} size="sm" />
          <span className="font-medium text-white">{staff.name}</span>
        </div>
      ),
    },
    {
      header: 'Rol',
      accessorKey: 'role',
    },
    {
      header: 'Estado',
      render: (staff) => {
        switch(staff.status) {
          case 'active': return <Badge variant="success" dot>Activo</Badge>;
          case 'break': return <Badge variant="warning" dot>Descanso</Badge>;
          default: return <Badge variant="default">Offline</Badge>;
        }
      }
    },
    {
      header: 'Última Actividad',
      accessorKey: 'lastActive',
      className: 'text-text-secondary',
    },
  ];

  const inventoryColumns: Column<typeof storeInventory[0]>[] = [
    {
      header: 'Producto',
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-white/5 p-1">
             <img src={product.images[0]} alt="" className="h-full w-full object-cover rounded-sm" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">{product.name}</span>
            <span className="text-xs text-text-secondary">{product.sku}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Categoría',
      accessorKey: 'category',
    },
    {
      header: 'Stock',
      render: (product) => (
        <div className="flex items-center gap-2">
          <span className={`font-bold ${product.stock < 10 ? 'text-status-error' : 'text-white'}`}>
            {product.stock}
          </span>
          {product.stock < 10 && <Badge variant="danger" size="sm">Bajo</Badge>}
        </div>
      ),
    },
    {
      header: 'Estado',
      render: (product) => (
        <Badge variant={product.status === ProductStatus.PUBLISHED ? 'success' : 'default'}>
          {product.status}
        </Badge>
      ),
    },
    {
      header: 'Última Reposición',
      accessorKey: 'lastRestock',
      className: 'text-text-secondary text-right',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/retail')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {store.name}
              <Badge variant={store.isActive ? 'success' : 'danger'}>
                {store.isActive ? 'Activa' : 'Inactiva'}
              </Badge>
            </h1>
            <p className="text-text-secondary">ID: {store.id} • {store.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(true)} className="text-status-error border-status-error/20 hover:bg-status-error/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="general">Configuración</TabsTrigger>
          <TabsTrigger value="schedule">Horarios</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="staff">Personal</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <KPIWidget title="Ventas (Mes)" value="€24,500" trend={12} icon={Euro} />
              <KPIWidget title="Pedidos" value="345" trend={5} icon={ShoppingBag} />
              <KPIWidget title="Visitas" value="1,250" trend={-2} icon={Users} />
              <KPIWidget title="Valoración" value="4.8/5" trendLabel="vs 4.5 mes pasado" trend={3} icon={Star} />
            </div>
            <div className="h-[400px]">
              <RevenueChart />
            </div>
          </TabsContent>

          {/* General Info Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Datos Básicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Nombre de la Tienda"
                    value={store.name}
                    onChange={(e) => setStore({ ...store, name: e.target.value })}
                    leftIcon={<StoreIcon className="h-4 w-4" />}
                  />
                  <Input
                    label="Dirección"
                    value={store.address}
                    onChange={(e) => setStore({ ...store, address: e.target.value })}
                    leftIcon={<MapPin className="h-4 w-4" />}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Teléfono"
                      value={store.phone}
                      onChange={(e) => setStore({ ...store, phone: e.target.value })}
                      leftIcon={<Phone className="h-4 w-4" />}
                    />
                    <Input
                      label="Email de contacto"
                      value={store.email}
                      onChange={(e) => setStore({ ...store, email: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={store.isActive}
                      onChange={(e) => setStore({ ...store, isActive: e.target.checked })}
                      className="rounded border-gray-600 bg-[#2C2C2C] text-brand-orange focus:ring-brand-orange"
                    />
                    <label htmlFor="isActive" className="text-sm text-white cursor-pointer">
                      Tienda activa y visible para los clientes
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ubicación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-48 w-full rounded-lg bg-[#2C2C2C] border border-white/10 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/Esri/calcite-maps/master/lib/images/map-preview.png')] bg-cover bg-center opacity-50 group-hover:opacity-60 transition-opacity" />
                    <div className="z-10 text-center p-4 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
                      <MapPin className="h-8 w-8 text-brand-orange mx-auto mb-2" />
                      <span className="text-sm font-medium text-white">Vista Previa Mapa</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Latitud"
                      type="number"
                      value={store.coordinates.lat}
                      onChange={(e) => setStore({ ...store, coordinates: { ...store.coordinates, lat: parseFloat(e.target.value) } })}
                    />
                    <Input
                      label="Longitud"
                      type="number"
                      value={store.coordinates.lng}
                      onChange={(e) => setStore({ ...store, coordinates: { ...store.coordinates, lng: parseFloat(e.target.value) } })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Imagen de Portada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border-2 border-dashed border-white/10 bg-white/5 p-8 text-center transition-all hover:border-brand-orange/50 hover:bg-white/10 flex flex-col items-center justify-center gap-4">
                    {store.imageUrl ? (
                      <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden shadow-lg">
                        <img 
                          src={store.imageUrl} 
                          alt="Portada" 
                          className="h-full w-full object-cover"
                        />
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="absolute bottom-4 right-4 shadow-md"
                          onClick={() => setStore({...store, imageUrl: ''})}
                        >
                          Cambiar Imagen
                        </Button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="mx-auto h-12 w-12 text-text-muted mb-3">
                          <StoreIcon className="h-full w-full" />
                        </div>
                        <div className="text-lg font-medium text-white">Arrastra tu imagen aquí</div>
                        <div className="text-sm text-text-secondary mb-4">o haz clic para seleccionar un archivo</div>
                        <Button variant="outline">Subir Imagen</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <OpeningHoursEditor 
              value={store.schedule} 
              onChange={(newSchedule) => setStore({ ...store, schedule: newSchedule })} 
            />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Servicios Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <ServicePicker 
                  selected={store.services}
                  onChange={(services) => setStore({ ...store, services })}
                  className="grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Equipo ({MOCK_STAFF.length})</CardTitle>
                  <Button size="sm" variant="outline">
                    Añadir Empleado
                  </Button>
                </CardHeader>
                <div className="p-0">
                  <DataTable 
                    data={MOCK_STAFF}
                    columns={staffColumns}
                  />
                </div>
             </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Inventario Local</CardTitle>
                <Button size="sm" variant="outline">
                  Gestionar Stock
                </Button>
              </CardHeader>
              <div className="p-0">
                <DataTable 
                  data={storeInventory}
                  columns={inventoryColumns}
                  pagination={{ pageSize: 10, page: 1, total: storeInventory.length, onPageChange: () => {} }}
                />
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalHeader>Eliminar Tienda</ModalHeader>
        <ModalBody>
          <p>¿Estás seguro de que deseas eliminar la tienda <strong>{store.name}</strong>?</p>
          <p className="text-sm text-text-secondary mt-2">Esta acción no se puede deshacer y eliminará todos los datos asociados.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
          <Button variant="default" className="bg-status-error hover:bg-status-error/90" onClick={handleDelete}>Eliminar</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StoreDetail;