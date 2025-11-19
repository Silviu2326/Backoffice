import React from 'react';
import { Wifi, Umbrella, Car, Accessibility, Dog } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ServiceId = 'wifi' | 'terrace' | 'parking' | 'pmr' | 'pets';

interface ServiceOption {
  id: ServiceId;
  label: string;
  icon: React.ElementType;
}

const SERVICES: ServiceOption[] = [
  { id: 'wifi', label: 'Wifi', icon: Wifi },
  { id: 'terrace', label: 'Terraza', icon: Umbrella },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'pmr', label: 'Acceso PMR', icon: Accessibility },
  { id: 'pets', label: 'Pet Friendly', icon: Dog },
];

interface ServicePickerProps {
  selected: ServiceId[];
  onChange: (services: ServiceId[]) => void;
  className?: string;
}

export function ServicePicker({ selected, onChange, className }: ServicePickerProps) {
  const toggleService = (id: ServiceId) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
      {SERVICES.map((service) => {
        const isSelected = selected.includes(service.id);
        const Icon = service.icon;

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
          >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{service.label}</span>
          </button>
        );
      })}
    </div>
  );
}
