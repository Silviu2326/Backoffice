import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Plus, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Drawer from '../../components/ui/Drawer';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Event } from '../../types/core';
import { getAllEvents, createEvent, deleteEvent } from '../../features/events/api/eventService';

// Map category to colors
const EVENT_COLORS: Record<string, string> = {
  'Cata': 'bg-purple-500',
  'El Gato Cool Cata': 'bg-purple-500',
  'Festival': 'bg-blue-500',
  'El Gato Cool Festival': 'bg-blue-500',
  'Taller': 'bg-green-500',
  'El Gato Cool Taller': 'bg-green-500',
  'Conferencia': 'bg-orange-500',
  'El Gato Cool Conferencia': 'bg-orange-500',
  'Concierto': 'bg-pink-500',
  'El Gato Cool Concierto': 'bg-pink-500',
  'Reunión': 'bg-yellow-500',
  'El Gato Cool Reunión': 'bg-yellow-500',
  'Karaoke': 'bg-indigo-500',
  'El Gato Cool Karaoke': 'bg-indigo-500',
  'default': 'bg-gray-500',
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const EventCalendar = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    category: 'Cata',
    location: '',
    maxAttendees: '', // New state for max attendees
    frequency: 'none',
    repeatCount: '1',
    status: 'published'
  });

  // Load events from Supabase
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const allEvents = await getAllEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert ISO date to YYYY-MM-DD
  const formatDateToDay = (isoDate: string): string => {
    return isoDate.split('T')[0];
  };

  // Convert YYYY-MM-DD and time to ISO datetime
  const combineDateAndTime = (date: string, time: string): string => {
    if (!date || !time) return '';
    return `${date}T${time}:00`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${currentDate.getFullYear()}-${month}-${day.toString().padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setIsDrawerOpen(true);
  };

  const getEventsForDay = (day: number) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${currentDate.getFullYear()}-${month}-${day.toString().padStart(2, '0')}`;
    return events.filter(e => {
      const eventDate = formatDateToDay(e.startDate);
      return eventDate === dateStr;
    });
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    return events.filter(e => {
      const eventDate = formatDateToDay(e.startDate);
      return eventDate === selectedDate;
    });
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setIsCreating(true);
      const repeatCount = parseInt(newEvent.repeatCount) || 1;
      const eventsToCreate = [];

      // Calculate dates for all occurrences
      for (let i = 0; i < (newEvent.frequency === 'none' ? 1 : repeatCount); i++) {
        const dateObj = new Date(newEvent.date);

        if (newEvent.frequency === 'weekly') {
          dateObj.setDate(dateObj.getDate() + (i * 7));
        } else if (newEvent.frequency === 'daily') {
          dateObj.setDate(dateObj.getDate() + i);
        }

        const dateStr = dateObj.toISOString().split('T')[0];
        const startDateTime = combineDateAndTime(dateStr, newEvent.time);
        const endDateTime = combineDateAndTime(dateStr, newEvent.time);

        eventsToCreate.push({
          title: newEvent.title,
          description: '',
          category: newEvent.category,
          status: newEvent.status as 'published' | 'draft' | 'cancelled',
          startDate: startDateTime,
          endDate: endDateTime,
          location: newEvent.location,
          locationName: newEvent.location,
          isFree: true,
          maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined,
        });
      }

      // Create all events sequentially
      const createdEvents: Event[] = [];
      for (const eventData of eventsToCreate) {
        const created = await createEvent(eventData);
        createdEvents.push(created);
      }

      // Update local state adding all new events
      setEvents(prevEvents => [...prevEvents, ...createdEvents]);

      setIsCreateModalOpen(false);
      setNewEvent({
        title: '',
        date: '',
        time: '',
        category: 'Cata',
        location: '',
        maxAttendees: '',
        frequency: 'none',
        repeatCount: '1',
        status: 'published'
      });
      alert(`Se han creado ${createdEvents.length} eventos correctamente`);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error al crear el evento. Por favor, intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el evento "${eventTitle}"? Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    try {
      await deleteEvent(eventId);
      // Update local state by removing the deleted event
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      alert('Evento eliminado correctamente');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error al eliminar el evento. Por favor, intenta de nuevo.');
    }
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const [year, month, day] = selectedDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', { dateStyle: 'full' });
  };

  const formatTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getEventColor = (category?: string): string => {
    if (!category) return EVENT_COLORS.default;
    return EVENT_COLORS[category] || EVENT_COLORS.default;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-[#1A1A1A] border border-white/5" />);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayEvents = getEventsForDay(i);
      const today = new Date();
      const isToday =
        i === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      days.push(
        <div
          key={i}
          className={cn(
            "h-32 border border-white/5 p-2 cursor-pointer hover:bg-white/5 transition-colors relative flex flex-col gap-1 group",
            isToday ? "bg-white/5" : "bg-[#2C2C2C]"
          )}
          onClick={() => handleDayClick(i)}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
              isToday ? "bg-blue-600 text-white" : "text-gray-400 group-hover:text-white"
            )}>
              {i}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-md">
                {dayEvents.length}
              </span>
            )}
          </div>

          {/* Event Dots/Bars */}
          <div className="flex flex-col gap-1.5 mt-1 overflow-hidden">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-white/10">
                <div className={cn("w-2 h-2 rounded-full shrink-0", getEventColor(event.category))} />
                <span className="text-xs text-gray-300 truncate font-medium">{event.title}</span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <span className="text-xs text-gray-500 pl-2">+{dayEvents.length - 3} más</span>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            Calendario de Eventos
          </h1>
          <p className="text-gray-400 mt-1">Gestiona y visualiza próximos eventos</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 bg-[#2C2C2C] p-1.5 rounded-xl border border-white/10">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-lg font-semibold min-w-[180px] text-center text-white capitalize">
              {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Crear Evento
          </Button>
        </div>
      </div>

      <Card className="bg-[#1E1E1E] border-white/10 shadow-2xl overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-[#252525]">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-4 text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 bg-[#1A1A1A]">
          {renderCalendar()}
        </div>
      </Card>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={formatSelectedDate() || 'Eventos'}
      >
        <div className="space-y-4 mt-4">
          {getEventsForSelectedDate().length > 0 ? (
            getEventsForSelectedDate().map(event => (
              <Card key={event.id} className="bg-[#252525] border-white/5 hover:border-white/10 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", getEventColor(event.category))} />
                      <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                        {event.category || 'Evento'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>

                  <div className="space-y-2 text-sm text-gray-400 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {formatTime(event.startDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {event.location || event.locationName || event.address || 'Sin ubicación'}
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/admin/events/${event.id}`)}
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id, event.title)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <CalendarIcon className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 font-medium">No hay eventos programados</p>
              <p className="text-gray-500 text-sm mt-1">Selecciona otro día o añade un evento.</p>
              <Button variant="primary" className="mt-6" onClick={() => setIsCreateModalOpen(true)}>Añadir Evento</Button>
            </div>
          )}
        </div>
      </Drawer>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalHeader>Crear Nuevo Evento</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Título del Evento"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Ej. Cata de Cervezas Artesanales"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
              <Input
                label="Hora"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
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
              ]} value={newEvent.category}
              onChange={(val) => setNewEvent({ ...newEvent, category: val })}
            />
            <Select
              label="Estado"
              options={[
                { value: 'published', label: 'Publicado' },
                { value: 'draft', label: 'Borrador' },
              ]}
              value={newEvent.status}
              onChange={(val) => setNewEvent({ ...newEvent, status: val })}
            />
            <Input
              label="Ubicación"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Ej. El Gato Cool Pub"
            />
            <Input
              label="Número Máximo de Participantes (Opcional)"
              type="number"
              value={newEvent.maxAttendees}
              onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
              placeholder="Ej. 50"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Frecuencia"
                options={[
                  { value: 'none', label: 'No repetir' },
                  { value: 'weekly', label: 'Semanalmente' },
                  { value: 'daily', label: 'Diariamente' },
                ]}
                value={newEvent.frequency}
                onChange={(val) => setNewEvent({ ...newEvent, frequency: val })}
              />
              {newEvent.frequency !== 'none' && (
                <Input
                  label="Cantidad de veces"
                  type="number"
                  min="1"
                  max="52"
                  value={newEvent.repeatCount}
                  onChange={(e) => setNewEvent({ ...newEvent, repeatCount: e.target.value })}
                  placeholder="Ej. 3"
                />
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateEvent} isLoading={isCreating}>
            Guardar Evento
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EventCalendar;
