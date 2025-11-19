import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Plus, Trash2, Save, ArrowLeft, DollarSign, Users, Ticket } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import Button from '../../components/ui/Button';

// Types
interface TicketType {
  id: string;
  name: string;
  price: number;
  quota: number;
}

interface EventData {
  title: string;
  startDate: string;
  endDate: string;
  locationType: 'store' | 'custom';
  locationValue: string;
  tickets: TicketType[];
}

// Mock Data for Stores
const MOCK_STORES = [
  { value: 'store-1', label: 'Main Street Flagship' },
  { value: 'store-2', label: 'Downtown Mall' },
  { value: 'store-3', label: 'Westside Plaza' },
  { value: 'store-4', label: 'North Hills Center' },
];

const LOCATION_TYPES = [
  { value: 'store', label: 'Retail Store' },
  { value: 'custom', label: 'Custom Location' },
];

const EventEditor = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventData>({
    title: '',
    startDate: '',
    endDate: '',
    locationType: 'store',
    locationValue: '',
    tickets: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof EventData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Ticket Management
  const handleAddTicket = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [
        ...prev.tickets,
        { id: crypto.randomUUID(), name: '', price: 0, quota: 0 }
      ]
    }));
  };

  const handleRemoveTicket = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.filter(t => t.id !== id)
    }));
  };

  const updateTicket = (id: string, field: keyof TicketType, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => {
        if (t.id === id) {
          return { ...t, [field]: value };
        }
        return t;
      })
    }));
  };

  // Calculations
  const totalCapacity = useMemo(() => {
    return formData.tickets.reduce((sum, t) => sum + (Number(t.quota) || 0), 0);
  }, [formData.tickets]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form Data:', formData);
    setIsSubmitting(false);
    navigate('/events');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Event Editor</h1>
            <p className="text-gray-400 text-sm">Create or modify an event</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/events')}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-[#1E1E1E] border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-brand-orange" />
                <h2 className="text-lg font-semibold text-white">Basic Information</h2>
              </div>
              
              <Input
                label="Event Title"
                name="title"
                placeholder="e.g., Summer Music Festival"
                value={formData.title}
                onChange={handleInputChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="calendar-picker-indicator:invert"
                />
                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="calendar-picker-indicator:invert"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-[#1E1E1E] border-white/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-brand-orange" />
                <h2 className="text-lg font-semibold text-white">Location</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Location Type"
                  options={LOCATION_TYPES}
                  value={formData.locationType}
                  onChange={(val) => handleSelectChange('locationType', val)}
                />

                {formData.locationType === 'store' ? (
                  <Select
                    label="Select Store"
                    options={MOCK_STORES}
                    value={formData.locationValue}
                    onChange={(val) => handleSelectChange('locationValue', val)}
                    placeholder="Choose a store..."
                  />
                ) : (
                  <Input
                    label="Custom Address"
                    name="locationValue"
                    placeholder="Enter full address"
                    value={formData.locationValue}
                    onChange={handleInputChange}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Ticket Configuration */}
          <Card className="bg-[#1E1E1E] border-white/10 h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-brand-orange" />
                  <h2 className="text-lg font-semibold text-white">Ticket Types</h2>
                </div>
                <Button size="sm" variant="secondary" onClick={handleAddTicket}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 flex-grow">
                {formData.tickets.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                    <p className="text-gray-500 text-sm">No ticket types defined.</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-brand-orange" onClick={handleAddTicket}>
                      Add First Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.tickets.map((ticket) => (
                      <div key={ticket.id} className="bg-[#252525] p-4 rounded-lg border border-white/5 space-y-3 relative group">
                        <button 
                          onClick={() => handleRemoveTicket(ticket.id)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <Input
                          placeholder="Ticket Name (e.g. VIP)"
                          value={ticket.name}
                          onChange={(e) => updateTicket(ticket.id, 'name', e.target.value)}
                          className="bg-[#1E1E1E]"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Price</label>
                            <Input
                              type="number"
                              min="0"
                              leftIcon={<DollarSign className="w-3 h-3" />}
                              value={ticket.price}
                              onChange={(e) => updateTicket(ticket.id, 'price', parseFloat(e.target.value))}
                              className="bg-[#1E1E1E]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Quota</label>
                            <Input
                              type="number"
                              min="0"
                              leftIcon={<Users className="w-3 h-3" />}
                              value={ticket.quota}
                              onChange={(e) => updateTicket(ticket.id, 'quota', parseInt(e.target.value))}
                              className="bg-[#1E1E1E]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Footer */}
              <div className="mt-6 pt-6 border-t border-white/10">
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Capacity</span>
                    <span className="text-xl font-bold text-white">{totalCapacity}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">Ticket Types</span>
                    <span className="text-white font-medium">{formData.tickets.length}</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventEditor;
