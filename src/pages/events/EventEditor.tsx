import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Save, ArrowLeft, DollarSign, Users, Loader2, Tag, X, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import FileUpload from '../../components/ui/FileUpload';
import Button from '../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Event } from '../../types/core';
import {
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByRecurrenceGroup,
  updateEventGroup,
  deleteEventGroup,
  detachFromRecurrenceGroup,
  extendRecurringSeries,
  deleteEventsFromDate,
  regenerateRecurringSeries,
  updateEventDate
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<Array<{ value: string; label: string }>>([]);
  const [newTag, setNewTag] = useState('');
  const [recurrenceGroupEvents, setRecurrenceGroupEvents] = useState<Event[]>([]);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [editScope, setEditScope] = useState<'single' | 'all'>('single');
  const [pendingChanges, setPendingChanges] = useState<Partial<Event> | null>(null);

  // Series management states
  const [isSeriesLoading, setIsSeriesLoading] = useState(false);
  const [seriesExtendCount, setSeriesExtendCount] = useState('1');
  const [seriesDeleteFromDate, setSeriesDeleteFromDate] = useState('');
  const [seriesNewFrequency, setSeriesNewFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [seriesNewCount, setSeriesNewCount] = useState('');
  const [seriesNewStartDate, setSeriesNewStartDate] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventDate, setEditingEventDate] = useState('');

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

  // Load recurrence group events when we have a group ID
  useEffect(() => {
    const loadRecurrenceGroup = async () => {
      if (event?.recurrenceGroupId) {
        try {
          const groupEvents = await getEventsByRecurrenceGroup(event.recurrenceGroupId);
          setRecurrenceGroupEvents(groupEvents);
        } catch (error) {
          console.error('Error loading recurrence group:', error);
        }
      }
    };
    loadRecurrenceGroup();
  }, [event?.recurrenceGroupId]);

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

  const buildEventData = (): Partial<Event> => ({
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
  });

  const handleSubmit = async (scope: 'single' | 'all' = 'single') => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    // If editing an existing event that's part of a group, show scope selection
    if (!isNew && event?.recurrenceGroupId && !showRecurrenceModal && scope === 'single') {
      setPendingChanges(buildEventData());
      setShowRecurrenceModal(true);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const eventData = pendingChanges || buildEventData();

      if (isNew) {
        await createEvent(eventData as Omit<Event, 'id' | 'createdAt'>);
      } else if (scope === 'all' && event?.recurrenceGroupId) {
        // Update all events in the group (preserving dates)
        await updateEventGroup(event.recurrenceGroupId, eventData, true);
      } else {
        // Single event update
        await updateEvent(id!, eventData);
      }

      setShowRecurrenceModal(false);
      setPendingChanges(null);
      navigate('/admin/events');
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Error al guardar el evento');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (deleteAll: boolean = false) => {
    if (!id || isNew) return;

    const message = deleteAll && event?.recurrenceGroupId
      ? `¿Estás seguro de que deseas eliminar TODOS los ${recurrenceGroupEvents.length} eventos de esta serie? Esta acción no se puede deshacer.`
      : `¿Estás seguro de que deseas eliminar el evento "${formData.title}"? Esta acción no se puede deshacer.`;

    const confirmDelete = window.confirm(message);

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      setError(null);

      if (deleteAll && event?.recurrenceGroupId) {
        await deleteEventGroup(event.recurrenceGroupId);
      } else {
        await deleteEvent(id);
      }

      navigate('/admin/events');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Error al eliminar el evento');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDetachFromGroup = async () => {
    if (!id || !event?.recurrenceGroupId) return;

    const confirmDetach = window.confirm(
      'Este evento dejará de estar vinculado a la serie recurrente. ¿Continuar?'
    );

    if (!confirmDetach) return;

    try {
      setIsSaving(true);
      await detachFromRecurrenceGroup(id);
      // Reload the event to reflect changes
      const updatedEvent = await getEventById(id);
      if (updatedEvent) {
        setEvent(updatedEvent);
        setRecurrenceGroupEvents([]);
      }
    } catch (err) {
      console.error('Error detaching from group:', err);
      setError('Error al desvincular el evento');
    } finally {
      setIsSaving(false);
    }
  };

  // Reload series events
  const reloadSeriesEvents = async () => {
    if (event?.recurrenceGroupId) {
      const groupEvents = await getEventsByRecurrenceGroup(event.recurrenceGroupId);
      setRecurrenceGroupEvents(groupEvents);
    }
  };

  // Extend series with more events
  const handleExtendSeries = async () => {
    if (!event?.recurrenceGroupId) return;
    const count = parseInt(seriesExtendCount);
    if (!count || count < 1) {
      alert('Por favor ingresa un número válido de eventos a agregar');
      return;
    }

    try {
      setIsSeriesLoading(true);
      await extendRecurringSeries(event.recurrenceGroupId, count);
      await reloadSeriesEvents();
      setSeriesExtendCount('1');
      alert(`Se agregaron ${count} eventos a la serie`);
    } catch (err) {
      console.error('Error extending series:', err);
      setError('Error al extender la serie');
    } finally {
      setIsSeriesLoading(false);
    }
  };

  // Delete events from a specific date
  const handleDeleteFromDate = async () => {
    if (!event?.recurrenceGroupId || !seriesDeleteFromDate) {
      alert('Por favor selecciona una fecha');
      return;
    }

    const confirm = window.confirm(
      `¿Estás seguro de eliminar todos los eventos desde ${seriesDeleteFromDate}?`
    );
    if (!confirm) return;

    try {
      setIsSeriesLoading(true);
      const deletedCount = await deleteEventsFromDate(
        event.recurrenceGroupId,
        new Date(seriesDeleteFromDate).toISOString()
      );
      await reloadSeriesEvents();
      setSeriesDeleteFromDate('');
      alert(`Se eliminaron ${deletedCount} eventos`);
    } catch (err) {
      console.error('Error deleting events:', err);
      setError('Error al eliminar eventos');
    } finally {
      setIsSeriesLoading(false);
    }
  };

  // Regenerate series with new frequency
  const handleRegenerateSeries = async () => {
    if (!event?.recurrenceGroupId) return;
    const count = parseInt(seriesNewCount);
    if (!count || count < 1) {
      alert('Por favor ingresa un número válido de eventos');
      return;
    }

    const confirm = window.confirm(
      `¿Estás seguro de regenerar la serie? Esto eliminará todos los eventos actuales y creará ${count} nuevos eventos con frecuencia ${seriesNewFrequency === 'weekly' ? 'semanal' : 'diaria'}.`
    );
    if (!confirm) return;

    try {
      setIsSeriesLoading(true);
      const newEvents = await regenerateRecurringSeries(
        event.recurrenceGroupId,
        seriesNewFrequency,
        count,
        seriesNewStartDate || undefined
      );
      // Update current event reference
      if (newEvents.length > 0) {
        setEvent(newEvents[0]);
        setRecurrenceGroupEvents(newEvents);
      }
      setSeriesNewCount('');
      setSeriesNewStartDate('');
      alert(`Serie regenerada con ${newEvents.length} eventos`);
      navigate(`/admin/events/${newEvents[0].id}`);
    } catch (err) {
      console.error('Error regenerating series:', err);
      setError('Error al regenerar la serie');
    } finally {
      setIsSeriesLoading(false);
    }
  };

  // Update individual event date
  const handleUpdateEventDate = async (eventId: string) => {
    if (!editingEventDate) return;

    try {
      setIsSeriesLoading(true);
      const eventToUpdate = recurrenceGroupEvents.find(e => e.id === eventId);
      if (!eventToUpdate) return;

      const duration = new Date(eventToUpdate.endDate).getTime() - new Date(eventToUpdate.startDate).getTime();
      const newStart = new Date(editingEventDate);
      const newEnd = new Date(newStart.getTime() + duration);

      await updateEventDate(eventId, newStart.toISOString(), newEnd.toISOString());
      await reloadSeriesEvents();
      setEditingEventId(null);
      setEditingEventDate('');
    } catch (err) {
      console.error('Error updating event date:', err);
      setError('Error al actualizar la fecha');
    } finally {
      setIsSeriesLoading(false);
    }
  };

  // Delete single event from series
  const handleDeleteSingleFromSeries = async (eventId: string) => {
    const confirm = window.confirm('¿Eliminar este evento de la serie?');
    if (!confirm) return;

    try {
      setIsSeriesLoading(true);
      await deleteEvent(eventId);
      await reloadSeriesEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Error al eliminar el evento');
    } finally {
      setIsSeriesLoading(false);
    }
  };

  const formatDateForDisplay = (isoDate: string): string => {
    return new Date(isoDate).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {!isNew && (
            <>
              {event?.recurrenceGroupId && (
                <Button
                  variant="outline"
                  onClick={() => handleDelete(true)}
                  isLoading={isDeleting}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Eliminar Serie
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleDelete(false)}
                isLoading={isDeleting}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Eliminar
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => navigate('/admin/events')}>
            Cancelar
          </Button>
          <Button
            onClick={() => handleSubmit()}
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

      {event?.recurrenceGroupId && (
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-blue-300 font-medium">
                    Evento Recurrente ({(event.recurrenceIndex || 0) + 1} de {event.recurrenceCount})
                  </p>
                  <p className="text-blue-400/70 text-sm">
                    Frecuencia: {event.recurrenceFrequency === 'weekly' ? 'Semanal' : event.recurrenceFrequency === 'daily' ? 'Diaria' : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDetachFromGroup}
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                >
                  Desvincular de la serie
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          {event?.recurrenceGroupId && (
            <TabsTrigger value="series">Serie ({recurrenceGroupEvents.length})</TabsTrigger>
          )}
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
                  { value: 'El Gato Cool Cata', label: 'El Gato Cool Cata' },
                  { value: 'Festival', label: 'Festival' },
                  { value: 'El Gato Cool Festival', label: 'El Gato Cool Festival' },
                  { value: 'Taller', label: 'Taller' },
                  { value: 'El Gato Cool Taller', label: 'El Gato Cool Taller' },
                  { value: 'Conferencia', label: 'Conferencia' },
                  { value: 'El Gato Cool Conferencia', label: 'El Gato Cool Conferencia' },
                  { value: 'Concierto', label: 'Concierto' },
                  { value: 'El Gato Cool Concierto', label: 'El Gato Cool Concierto' },
                  { value: 'Reunión', label: 'Reunión' },
                  { value: 'El Gato Cool Reunión', label: 'El Gato Cool Reunión' },
                  { value: 'Karaoke', label: 'Karaoke' },
                  { value: 'El Gato Cool Karaoke', label: 'El Gato Cool Karaoke' },
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

        {/* Series Management - Only shown for recurring events */}
        {event?.recurrenceGroupId && (
          <TabsContent value="series">
            <div className="space-y-6">
              {/* Events List */}
              <Card className="bg-[#1E1E1E] border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-brand-orange" />
                      <h2 className="text-lg font-semibold text-white">Eventos de la Serie</h2>
                    </div>
                    {isSeriesLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {recurrenceGroupEvents
                      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .map((evt, idx) => (
                        <div
                          key={evt.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            evt.id === id
                              ? 'bg-blue-500/10 border-blue-500/30'
                              : 'bg-[#252525] border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 w-8">#{idx + 1}</span>
                            {editingEventId === evt.id ? (
                              <input
                                type="datetime-local"
                                value={editingEventDate}
                                onChange={(e) => setEditingEventDate(e.target.value)}
                                className="bg-[#1E1E1E] border border-white/20 rounded px-2 py-1 text-white text-sm"
                              />
                            ) : (
                              <span className="text-white">{formatDateForDisplay(evt.startDate)}</span>
                            )}
                            {evt.id === id && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                Actual
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {editingEventId === evt.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateEventDate(evt.id)}
                                  disabled={isSeriesLoading}
                                >
                                  Guardar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingEventId(null);
                                    setEditingEventDate('');
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingEventId(evt.id);
                                    setEditingEventDate(evt.startDate.slice(0, 16));
                                  }}
                                >
                                  Editar
                                </Button>
                                {evt.id !== id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/admin/events/${evt.id}`)}
                                  >
                                    Ver
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSingleFromSeries(evt.id)}
                                  className="text-red-400 hover:text-red-300"
                                  disabled={isSeriesLoading || recurrenceGroupEvents.length <= 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Extend Series */}
              <Card className="bg-[#1E1E1E] border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-white font-medium mb-4">Agregar más eventos</h3>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Input
                        label="Cantidad de eventos a agregar"
                        type="number"
                        min="1"
                        max="52"
                        value={seriesExtendCount}
                        onChange={(e) => setSeriesExtendCount(e.target.value)}
                        placeholder="Ej. 4"
                      />
                    </div>
                    <Button
                      onClick={handleExtendSeries}
                      disabled={isSeriesLoading}
                      isLoading={isSeriesLoading}
                    >
                      Agregar
                    </Button>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Los nuevos eventos se crearán después del último evento de la serie.
                  </p>
                </CardContent>
              </Card>

              {/* Delete from date */}
              <Card className="bg-[#1E1E1E] border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-white font-medium mb-4">Eliminar eventos desde fecha</h3>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Input
                        label="Eliminar eventos desde"
                        type="date"
                        value={seriesDeleteFromDate}
                        onChange={(e) => setSeriesDeleteFromDate(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleDeleteFromDate}
                      disabled={isSeriesLoading || !seriesDeleteFromDate}
                      isLoading={isSeriesLoading}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      Eliminar
                    </Button>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Se eliminarán todos los eventos desde la fecha seleccionada en adelante.
                  </p>
                </CardContent>
              </Card>

              {/* Regenerate Series */}
              <Card className="bg-[#1E1E1E] border-white/10 border-orange-500/30">
                <CardContent className="p-6">
                  <h3 className="text-white font-medium mb-4">Regenerar serie completa</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Esta acción eliminará todos los eventos actuales y creará una nueva serie con la configuración especificada.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Select
                      label="Nueva frecuencia"
                      options={[
                        { value: 'weekly', label: 'Semanal' },
                        { value: 'daily', label: 'Diaria' },
                      ]}
                      value={seriesNewFrequency}
                      onChange={(val) => setSeriesNewFrequency(val as 'daily' | 'weekly')}
                    />
                    <Input
                      label="Cantidad de eventos"
                      type="number"
                      min="1"
                      max="52"
                      value={seriesNewCount}
                      onChange={(e) => setSeriesNewCount(e.target.value)}
                      placeholder="Ej. 8"
                    />
                    <Input
                      label="Fecha de inicio (opcional)"
                      type="date"
                      value={seriesNewStartDate}
                      onChange={(e) => setSeriesNewStartDate(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleRegenerateSeries}
                    disabled={isSeriesLoading || !seriesNewCount}
                    isLoading={isSeriesLoading}
                    className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                  >
                    Regenerar Serie
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

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

      {/* Recurrence Edit Scope Modal */}
      <Modal isOpen={showRecurrenceModal} onClose={() => {
        setShowRecurrenceModal(false);
        setPendingChanges(null);
      }}>
        <ModalHeader>Editar Evento Recurrente</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-300">
              Este evento es parte de una serie de {recurrenceGroupEvents.length} eventos recurrentes.
              ¿Cómo deseas aplicar los cambios?
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 bg-[#252525] rounded-lg border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="radio"
                  name="editScope"
                  value="single"
                  checked={editScope === 'single'}
                  onChange={() => setEditScope('single')}
                  className="mt-1"
                />
                <div>
                  <p className="text-white font-medium">Solo este evento</p>
                  <p className="text-gray-400 text-sm">Los cambios solo afectarán a este evento individual.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-[#252525] rounded-lg border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="radio"
                  name="editScope"
                  value="all"
                  checked={editScope === 'all'}
                  onChange={() => setEditScope('all')}
                  className="mt-1"
                />
                <div>
                  <p className="text-white font-medium">Todos los eventos de la serie</p>
                  <p className="text-gray-400 text-sm">
                    Los cambios se aplicarán a los {recurrenceGroupEvents.length} eventos
                    (las fechas individuales se mantendrán).
                  </p>
                </div>
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowRecurrenceModal(false);
            setPendingChanges(null);
          }}>
            Cancelar
          </Button>
          <Button
            onClick={() => handleSubmit(editScope)}
            isLoading={isSaving}
          >
            Guardar Cambios
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EventEditor;
