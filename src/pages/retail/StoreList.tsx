import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

interface Store {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  openingTime: number; // e.g., 9 for 9 AM
  closingTime: number; // e.g., 17 for 5 PM
}

const mockStores: Store[] = [
  {
    id: '1',
    name: 'Tienda Central',
    address: 'Calle Falsa 123, Ciudad',
    imageUrl: 'https://via.placeholder.com/150',
    openingTime: 9,
    closingTime: 18,
  },
  {
    id: '2',
    name: 'Sucursal Norte',
    address: 'Avenida Siempre Viva 456, Pueblo',
    imageUrl: 'https://via.placeholder.com/150',
    openingTime: 10,
    closingTime: 20,
  },
  {
    id: '3',
    name: 'Tienda Sur',
    address: 'Bulevar de los Sueños Rotos 789, Villa',
    imageUrl: 'https://via.placeholder.com/150',
    openingTime: 8,
    closingTime: 17,
  },
];

const StoreList: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getCurrentStatus = (openingTime: number, closingTime: number) => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= openingTime && currentHour < closingTime) {
      return <Badge variant="success">Abierto</Badge>;
    }
    return <Badge variant="danger">Cerrado</Badge>;
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStores.map((store) => (
          <Card key={store.id} className="flex flex-col overflow-hidden border-white/10 bg-[#1E1E1E]">
            <div className="relative h-48 w-full">
              <img 
                src={store.imageUrl} 
                alt={store.name} 
                className="h-full w-full object-cover" 
              />
              <div className="absolute top-4 right-4">
                {getCurrentStatus(store.openingTime, store.closingTime)}
              </div>
            </div>
            <div className="flex flex-grow flex-col p-5">
              <h2 className="mb-2 text-xl font-bold text-white">{store.name}</h2>
              
              <div className="mb-4 space-y-2 text-sm text-text-secondary">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{store.openingTime}:00 - {store.closingTime}:00</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/admin/retail/${store.id}`)}
                >
                  Gestionar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalHeader>Añadir Nueva Tienda</ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="Nombre de la tienda"
            placeholder="Ej: Tienda Central"
          />
          <Input
            label="Dirección"
            placeholder="Dirección completa"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora Apertura (0-23)"
              type="number"
              placeholder="9"
              min={0}
              max={23}
            />
            <Input
              label="Hora Cierre (0-23)"
              type="number"
              placeholder="20"
              min={0}
              max={23}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setIsCreateModalOpen(false)}>
            Crear Tienda
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StoreList;
