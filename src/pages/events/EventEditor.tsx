import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Save, ArrowLeft, DollarSign, Users, Loader2, Tag, X, Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import FileUpload from '../../components/ui/FileUpload';
import Button from '../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Event } from '../../types/core';
import { 
  getEventById, 
  createEvent, 
  updateEvent 
} from '../../features/events/api/eventService';
import { getStores } from '../../features/retail/api/storeService';
import { uploadFile } from '../../utils/storage';

const EventEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<Array<{ value: string; label: string }>>([]);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImageUrl: '',
    heroImage: '',
    category: 'Cata',
    tags: [] as string[],
    status: 'draft' as 'published' | 'draft' | 'cancelled',
    startDate: '',
    endDate: '',
    locationName: '',
    location: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
    maxAttendees: '',
    registeredAttendees: '',
    soldTickets: '',
    price: '',
    currency: '€',
    isFree: false,
    isPremium: false,
    isRecurring: false,
    pointsReward: '',
    ageRestriction: '',
    locationType: 'custom' as 'store' | 'custom',
    storeId: '',
  });

  // Load stores for location selection
  useEffect(() => {
    const loadStores = async () => {
      try {
        const allStores = await getStores();
        setStores(allStores.map(store => ({
          value: store.id,
          label: store.name
        })));
      } catch (error) {
        console.error('Error loading stores:', error);
      }
    };
    loadStores();
  }, []);

  // Load event from Supabase
  useEffect(() => {
    const loadEvent = async () => {
      if (isNew) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const fetchedEvent = await getEventById(id!);
        
        if (!fetchedEvent) {
          setError('Evento no encontrado');
          return;
        }

        setEvent(fetchedEvent);
        setFormData({
          title: fetchedEvent.title,
          description: fetchedEvent.description || '',
          coverImageUrl: fetchedEvent.coverImageUrl || '',
          heroImage: fetchedEvent.heroImage || '',
          category: fetchedEvent.category || 'Cata',
          tags: fetchedEvent.tags || [],
          status: fetchedEvent.status,
          startDate: formatDateTimeForInput(fetchedEvent.startDate),
          endDate: formatDateTimeForInput(fetchedEvent.endDate),
          locationName: fetchedEvent.locationName || '',
          location: fetchedEvent.location || '',
          city: fetchedEvent.city || '',
          address: fetchedEvent.address || '',
          latitude: fetchedEvent.latitude?.toString() || '',
          longitude: fetchedEvent.longitude?.toString() || '',
          capacity: fetchedEvent.capacity?.toString() || '',
          maxAttendees: fetchedEvent.maxAttendees?.toString() || '',
          registeredAttendees: fetchedEvent.registeredAttendees?.toString() || '',
          soldTickets: fetchedEvent.soldTickets?.toString() || '',
          price: fetchedEvent.price?.toString() || '',
          currency: fetchedEvent.currency || '€',
          isFree: fetchedEvent.isFree || false,
          isPremium: fetchedEvent.isPremium || false,
          isRecurring: fetchedEvent.isRecurring || false,
          pointsReward: fetchedEvent.pointsReward?.toString() || '',
          ageRestriction: fetchedEvent.ageRestriction || '',
          locationType: 'custom',
          storeId: '',
        });
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Error al cargar el evento');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id, isNew]);

  const formatDateTimeForInput = (isoDate: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatInputToISO = (dateTime: string): string => {
    if (!dateTime) return '';
    return new Date(dateTime).toISOString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  }; 

  const handleFileUpload = async (files: File[], field: 'coverImageUrl' | 'heroImage') => {
    if (files.length === 0) return;

    try {
      // In a real app, we would use a toast notification here
      console.log(`Uploading ${field}...`);
      
      const file = files[0];
      const path = `events/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const url = await uploadFile('media', path, file); // Assuming 'media' bucket exists
      
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch (err) {
      console.error(`Error uploading ${field}:`, err);
      // In a real app, we would show an error toast
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const eventData: Partial<Event> = {
        title: formData.title,
        description: formData.description || undefined,
        coverImageUrl: formData.coverImageUrl || undefined,
        heroImage: formData.heroImage || undefined,
        category: formData.category || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        status: formData.status,
        startDate: formatInputToISO(formData.startDate),
        endDate: formatInputToISO(formData.endDate),
        locationName: formData.locationName || undefined,
        location: formData.location || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        registeredAttendees: formData.registeredAttendees ? parseInt(formData.registeredAttendees) : undefined,
        soldTickets: formData.soldTickets ? parseInt(formData.soldTickets) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency || undefined,
        isFree: formData.isFree,
        isPremium: formData.isPremium,
        isRecurring: formData.isRecurring,
        pointsReward: formData.pointsReward ? parseInt(formData.pointsReward) : undefined,
        ageRestriction: formData.ageRestriction || undefined,
      };

      if (isNew) {
        await createEvent(eventData as Omit<Event, 'id' | 'createdAt'>);
      } else {
        await updateEvent(id!, eventData);
      }

      navigate('/admin/events');
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Error al guardar el evento');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/events')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isNew ? 'Nuevo Evento' : 'Editar Evento'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isNew ? 'Crea un nuevo evento' : 'Modifica la información del evento'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/events')}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Guardar Evento
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="location">Ubicación</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="media">Medios</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic">
          <Card className="bg-[#1E1E1E] border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-brand-orange" />
                <h2 className="text-lg font-semibold text-white">Información Básica</h2>
              </div>
              
              <Input
                label="Título del Evento *"
                name="title"
                placeholder="Ej. Cata de Cervezas Artesanales"
                value={formData.title}
                onChange={handleInputChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Fecha y Hora de Inicio *"
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
                <Input
                  label="Fecha y Hora de Fin *"
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>

              <Select
                label="Categoría"
                options={[
                  { value: 'Cata', label: 'Cata' },
                  { value: 'Festival', label: 'Festival' },
                  { value: 'Taller', label: 'Taller' },
                  { value: 'Conferencia', label: 'Conferencia' },
                  { value: 'Concierto', label: 'Concierto' },
                  { value: 'Reunión', label: 'Reunión' },
                ]}
                value={formData.category}
                onChange={(val) => handleSelectChange('category', val)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el evento..."
                  rows={4}
                  className="w-full px-4 py-2 bg-[#252525] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                />
              </div>

              <Select
                label="Estado"
                options={[
                  { value: 'draft', label: 'Borrador' },
                  { value: 'published', label: 'Publicado' },
                  { value: 'cancelled', label: 'Cancelado' },
                ]}
                value={formData.status}
                onChange={(val) => handleSelectChange('status', val as any)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Etiquetas
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Añadir etiqueta"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    leftIcon={<Tag className="w-4 h-4" />}
                  />
                  <Button onClick={handleAddTag} variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location */}
        <TabsContent value="location">
          <Card className="bg-[#1E1E1E] border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-brand-orange" />
                <h2 className="text-lg font-semibold text-white">Ubicación</h2>
              </div>

              <Select
                label="Tipo de Ubicación"
                options={[
                  { value: 'custom', label: 'Ubicación Personalizada' },
                  { value: 'store', label: 'Tienda' },
                ]}
                value={formData.locationType}
                onChange={(val) => handleSelectChange('locationType', val as any)}
              />

              {formData.locationType === 'store' ? (
                <Select
                  label="Seleccionar Tienda"
                  options={stores}
                  value={formData.storeId}
                  onChange={(val) => handleSelectChange('storeId', val)}
                  placeholder="Elige una tienda..."
                />
              ) : (
                <>
                  <Input
                    label="Nombre del Lugar"
                    name="locationName"
                    placeholder="Ej. El Gato Cool Pub"
                    value={formData.locationName}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Dirección"
                    name="address"
                    placeholder="Calle Principal 123"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Ciudad"
                    name="city"
                    placeholder="Madrid"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Latitud"
                      name="latitude"
                      type="number"
                      step="any"
                      placeholder="40.4168"
                      value={formData.latitude}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Longitud"
                      name="longitude"
                      type="number"
                      step="any"
                      placeholder="-3.7038"
                      value={formData.longitude}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details */}
        <TabsContent value="details">
          <Card className="bg-[#1E1E1E] border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-brand-orange" />
                <h2 className="text-lg font-semibold text-white">Detalles del Evento</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Capacidad Máxima"
                  name="capacity"
                  type="number"
                  placeholder="50"
                  value={formData.capacity}
                  onChange={handleInputChange}
                />
                <Input
                  label="Máximo de Asistentes"
                  name="maxAttendees"
                  type="number"
                  placeholder="50"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                />
                <Input
                  label="Asistentes Registrados"
                  name="registeredAttendees"
                  type="number"
                  placeholder="0"
                  value={formData.registeredAttendees}
                  onChange={handleInputChange}
                />
                <Input
                  label="Tickets Vendidos"
                  name="soldTickets"
                  type="number"
                  placeholder="0"
                  value={formData.soldTickets}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Precio"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  leftIcon={<DollarSign className="w-4 h-4" />}
                />
                <Input
                  label="Moneda"
                  name="currency"
                  placeholder="€"
                  value={formData.currency}
                  onChange={handleInputChange}
                />
                <Input
                  label="Restricción de Edad"
                  name="ageRestriction"
                  placeholder="18+"
                  value={formData.ageRestriction}
                  onChange={handleInputChange}
                />
              </div>

              <Input
                label="Puntos de Recompensa"
                name="pointsReward"
                type="number"
                placeholder="100"
                value={formData.pointsReward}
                onChange={handleInputChange}
              />

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/20 bg-[#252525] text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-gray-300">Evento Gratuito</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/20 bg-[#252525] text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-gray-300">Evento Premium</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/20 bg-[#252525] text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-gray-300">Evento Recurrente</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media */}
        <TabsContent value="media">
          <Card className="bg-[#1E1E1E] border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-brand-orange" />
                <h2 className="text-lg font-semibold text-white">Medios</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Imagen de Portada</label>
                {formData.coverImageUrl && (
                  <div className="relative w-full h-48 mb-2 rounded-lg overflow-hidden border border-white/10 group">
                    <img 
                      src={formData.coverImageUrl} 
                      alt="Portada" 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, coverImageUrl: '' }))}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <FileUpload
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                  maxSize={5 * 1024 * 1024} // 5MB
                  onFilesChange={(files) => handleFileUpload(files, 'coverImageUrl')}
                  multiple={false}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Imagen Hero</label>
                {formData.heroImage && (
                  <div className="relative w-full h-48 mb-2 rounded-lg overflow-hidden border border-white/10 group">
                    <img 
                      src={formData.heroImage} 
                      alt="Hero" 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, heroImage: '' }))}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <FileUpload
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                  maxSize={5 * 1024 * 1024} // 5MB
                  onFilesChange={(files) => handleFileUpload(files, 'heroImage')}
                  multiple={false}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventEditor;
