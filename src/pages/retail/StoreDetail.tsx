import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Phone, 
  Store as StoreIcon, 
  Trash2,
  Loader2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { 
  getStoreById, 
  updateStore, 
  deleteStore,
  Store 
} from '../../features/retail/api/storeService';
import { OpeningHoursEditor, DaySchedule } from '../../components/retail/OpeningHoursEditor';
import { getStoreHours, upsertStoreHours } from '../../features/retail/api/storeHoursService';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [store, setStore] = useState<Store | null>(null);
  const [openingHours, setOpeningHours] = useState<DaySchedule[]>([]);

  // Cargar datos desde Supabase
  useEffect(() => {
    const loadStoreData = async () => {
      if (!id || id === 'new') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Cargar tienda
        const fetchedStore = await getStoreById(id);
        if (!fetchedStore) {
          setError('Tienda no encontrada');
          return;
        }
        setStore(fetchedStore);

        // Cargar horarios
        const hours = await getStoreHours(id);
        const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const editorDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        const formattedHours: DaySchedule[] = editorDays.map(dayName => {
            const dayIdx = daysMap.indexOf(dayName);
            const existing = hours.find(h => h.dayOfWeek === dayIdx);
            return {
                day: dayName,
                isOpen: existing ? !existing.isClosed : true,
                openTime: existing ? existing.openTime : '09:00',
                closeTime: existing ? existing.closeTime : '18:00'
            };
        });
        setOpeningHours(formattedHours);

      } catch (err) {
        console.error('Error loading store data:', err);
        setError('Error al cargar los datos de la tienda');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreData();
  }, [id]);

  const handleSave = async () => {
    if (!id || !store) {
      alert('No se puede guardar: ID de tienda no encontrado');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Actualizar tienda
      await updateStore(id, store);

      // Guardar horarios
      const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const hoursToSave = openingHours.map(h => ({
          dayOfWeek: daysMap.indexOf(h.day),
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: !h.isOpen
      }));
      await upsertStoreHours(id, hoursToSave);

      alert('Tienda actualizada correctamente');
    } catch (err) {
      console.error('Error saving store:', err);
      setError('Error al guardar la tienda. Por favor, intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) {
      return;
    }

    try {
      await deleteStore(id);
      setIsDeleteModalOpen(false);
      navigate('/admin/retail');
    } catch (err) {
      console.error('Error deleting store:', err);
      alert('Error al eliminar la tienda. Por favor, intenta de nuevo.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        <span className="ml-3 text-text-secondary">Cargando tienda...</span>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-400 mb-4">{error || 'Tienda no encontrada'}</p>
        <Button onClick={() => navigate('/admin/retail')}>Volver a Tiendas</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

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
            </h1>
            <p className="text-text-secondary">{store.address}, {store.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(true)} className="text-status-error border-status-error/20 hover:bg-status-error/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Tienda</CardTitle>
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
            <Input
              label="Ciudad"
              value={store.city}
              onChange={(e) => setStore({ ...store, city: e.target.value })}
            />
            <Input
              label="Teléfono"
              value={store.phone}
              onChange={(e) => setStore({ ...store, phone: e.target.value })}
              leftIcon={<Phone className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <OpeningHoursEditor 
          value={openingHours} 
          onChange={setOpeningHours} 
        />
      </div>

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