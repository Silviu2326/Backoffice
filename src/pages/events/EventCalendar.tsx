import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Drawer from '../../components/ui/Drawer';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

// Types
interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'concierto' | 'conferencia' | 'taller' | 'reunion';
  time: string;
  location: string;
}

// Mock Data
const INITIAL_EVENTS: Event[] = [
  { id: '1', title: 'Conferencia Tech 2025', date: '2025-11-20', type: 'conferencia', time: '09:00 AM', location: 'Centro de Convenciones' },
  { id: '2', title: 'Festival de Música', date: '2025-11-20', type: 'concierto', time: '06:00 PM', location: 'Parque de la Ciudad' },
  { id: '3', title: 'Taller de React', date: '2025-11-15', type: 'taller', time: '10:00 AM', location: 'Tech Hub' },
  { id: '4', title: 'Reunión de Comunidad', date: '2025-11-25', type: 'reunion', time: '07:00 PM', location: 'Café Centro' },
  { id: '5', title: 'Noche de Jazz', date: '2025-11-05', type: 'concierto', time: '08:00 PM', location: 'Blue Note' },
  { id: '6', title: 'Simposio de IA', date: '2025-12-10', type: 'conferencia', time: '09:30 AM', location: 'Auditorio Universitario' },
];

const EVENT_COLORS: Record<string, string> = {
  concierto: 'bg-purple-500',
  conferencia: 'bg-blue-500',
  taller: 'bg-green-500',
  reunion: 'bg-orange-500',
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const EventCalendar = () => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    type: 'conferencia',
    time: '',
    location: ''
  });

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
    return events.filter(e => e.date === dateStr);
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    return events.filter(e => e.date === selectedDate);
  };

  const handleCreateEvent = () => {
      const event: Event = {
          id: Math.random().toString(36).substr(2, 9),
          title: newEvent.title,
          date: newEvent.date,
          type: newEvent.type as any,
          time: newEvent.time,
          location: newEvent.location
      };
      setEvents([...events, event]);
      setIsCreateModalOpen(false);
      setNewEvent({ title: '', date: '', type: 'conferencia', time: '', location: '' });
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const [year, month, day] = selectedDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', { dateStyle: 'full' });
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
                 <div className={cn("w-2 h-2 rounded-full shrink-0", EVENT_COLORS[event.type])} />
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
                                    <span className={cn("w-2 h-2 rounded-full", EVENT_COLORS[event.type])} />
                                    <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">{event.type}</span>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                            
                            <div className="space-y-2 text-sm text-gray-400 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    {event.time}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    {event.location}
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <Button variant="outline" size="sm" className="w-full">
                                    Ver Detalles
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
                    placeholder="Ej. Conferencia Anual"
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
                    label="Tipo de Evento"
                    options={[
                        { value: 'conferencia', label: 'Conferencia' },
                        { value: 'concierto', label: 'Concierto' },
                        { value: 'taller', label: 'Taller' },
                        { value: 'reunion', label: 'Reunión' },
                    ]}
                    value={newEvent.type}
                    onChange={(val) => setNewEvent({ ...newEvent, type: val })}
                />
                <Input
                    label="Ubicación"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Ej. Auditorio Principal"
                />
            </div>
        </ModalBody>
        <ModalFooter>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateEvent}>Guardar Evento</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EventCalendar;
