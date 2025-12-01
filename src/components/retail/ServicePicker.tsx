import React, { useEffect, useState } from 'react';
import { 
  Wifi, 
  Umbrella, 
  Car, 
  Accessibility, 
  Dog,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getServices, Service } from '../../features/retail/api/serviceService';

// Mapeo de nombres de iconos a componentes de Lucide React
const ICON_MAP: Record<string, React.ElementType> = {
  'wifi': Wifi,
  'wifi-off': Wifi,
  'umbrella': Umbrella,
  'sunny': Umbrella,
  'car': Car,
  'parking': Car,
  'accessibility': Accessibility,
  'wheelchair': Accessibility,
  'pmr': Accessibility,
  'dog': Dog,
  'pets': Dog,
  'paw-print': Dog,
};

// Icono por defecto si no se encuentra el mapeo
const DefaultIcon = Wifi;

interface ServicePickerProps {
  selected: string[];
  onChange: (services: string[]) => void;
  className?: string;
  storeId?: string; // Opcional: para cargar servicios específicos de una tienda
}

export function ServicePicker({ 
  selected, 
  onChange, 
  className,
  storeId 
}: ServicePickerProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Fallback a servicios por defecto si hay error
        setServices([
          { id: 'wifi', name: 'Wifi', icon: 'wifi' },
          { id: 'terrace', name: 'Terraza', icon: 'umbrella' },
          { id: 'parking', name: 'Parking', icon: 'car' },
          { id: 'pmr', name: 'Acceso PMR', icon: 'accessibility' },
          { id: 'pets', name: 'Pet Friendly', icon: 'dog' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  const toggleService = (serviceId: string) => {
    if (selected.includes(serviceId)) {
      onChange(selected.filter((s) => s !== serviceId));
    } else {
      onChange([...selected, serviceId]);
    }
  };

  const getIconComponent = (iconName?: string): React.ElementType => {
    if (!iconName) return DefaultIcon;
    const IconComponent = ICON_MAP[iconName.toLowerCase()];
    return IconComponent || DefaultIcon;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
        <span className="ml-3 text-text-secondary">Cargando servicios...</span>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 bg-red-500/10 border border-red-500/20 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <p>No hay servicios disponibles</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
      {services.map((service) => {
        const isSelected = selected.includes(service.id);
        const Icon = getIconComponent(service.icon);

        return (
          <button
            key={service.id}
            type="button"
            onClick={() => toggleService(service.id)}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 gap-2',
              isSelected
                ? 'border-brand-orange bg-brand-orange/10 text-brand-orange shadow-[0_0_10px_rgba(247,105,52,0.2)]'
                : 'border-border bg-brand-surface text-text-secondary hover:border-brand-orange/50 hover:text-text-primary'
            )}
            title={service.description || service.name}
          >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{service.name}</span>
            {service.description && (
              <span className="text-xs text-text-secondary line-clamp-2 text-center">
                {service.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Exportar el tipo ServiceId para compatibilidad hacia atrás
export type ServiceId = string;
