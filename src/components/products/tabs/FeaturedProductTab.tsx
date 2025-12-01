import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Calendar, Star, AlertCircle } from 'lucide-react';

interface FeaturedProductTabProps {
  productId?: string;
  isFeatured?: boolean;
  featuredStartDate?: string;
  featuredEndDate?: string;
  featuredType?: string;
  onFeaturedChange?: (config: {
    isFeatured: boolean;
    featuredStartDate?: string;
    featuredEndDate?: string;
    featuredType?: string;
  }) => void;
}

export const FeaturedProductTab: React.FC<FeaturedProductTabProps> = ({
  productId,
  isFeatured = false,
  featuredStartDate = '',
  featuredEndDate = '',
  featuredType = 'beer_of_month',
  onFeaturedChange,
}) => {
  const [isFeaturedState, setIsFeaturedState] = useState(isFeatured);
  const [startDate, setStartDate] = useState(featuredStartDate);
  const [endDate, setEndDate] = useState(featuredEndDate);
  const [type, setType] = useState(featuredType);

  const handleToggle = (value: boolean) => {
    setIsFeaturedState(value);
    if (onFeaturedChange) {
      onFeaturedChange({
        isFeatured: value,
        featuredStartDate: value ? startDate : undefined,
        featuredEndDate: value ? endDate : undefined,
        featuredType: value ? type : undefined,
      });
    }
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setStartDate(value);
      if (onFeaturedChange) {
        onFeaturedChange({
          isFeatured: isFeaturedState,
          featuredStartDate: value,
          featuredEndDate: endDate,
          featuredType: type,
        });
      }
    } else {
      setEndDate(value);
      if (onFeaturedChange) {
        onFeaturedChange({
          isFeatured: isFeaturedState,
          featuredStartDate: startDate,
          featuredEndDate: value,
          featuredType: type,
        });
      }
    }
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    if (onFeaturedChange) {
      onFeaturedChange({
        isFeatured: isFeaturedState,
        featuredStartDate: startDate,
        featuredEndDate: endDate,
        featuredType: value,
      });
    }
  };

  const featuredTypes = [
    { value: 'beer_of_month', label: 'Cerveza del Mes' },
    { value: 'featured', label: 'Producto Destacado' },
    { value: 'highlighted', label: 'Producto Resaltado' },
    { value: 'new_arrival', label: 'Nuevo Lanzamiento' },
  ];

  const isCurrentlyFeatured = () => {
    if (!isFeaturedState) return false;
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && end) {
      return now >= start && now <= end;
    }
    if (start) {
      return now >= start;
    }
    if (end) {
      return now <= end;
    }
    return true; // If no dates, consider it always active
  };

  const getStatusBadge = () => {
    if (!isFeaturedState) {
      return <Badge variant="default">No destacado</Badge>;
    }
    
    if (isCurrentlyFeatured()) {
      return <Badge variant="success" className="bg-green-500">Activo</Badge>;
    }
    
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && now < start) {
      return <Badge variant="warning" className="bg-yellow-500">Programado</Badge>;
    }
    if (end && now > end) {
      return <Badge variant="danger" className="bg-red-500">Expirado</Badge>;
    }
    
    return <Badge variant="default">Activo</Badge>;
  };

  return (
    <div className="space-y-6 p-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff6b35]/10 rounded-lg">
              <Star className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Producto Destacado</h2>
              <p className="text-sm text-text-secondary">Configura este producto como destacado en la app</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Toggle Featured */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeaturedState}
              onChange={(e) => handleToggle(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35] focus:ring-2"
            />
            <span className="text-white font-medium">
              Marcar como producto destacado
            </span>
          </label>
          <p className="text-sm text-text-secondary mt-2 ml-8">
            Cuando está activo, este producto aparecerá en secciones destacadas de la app móvil
          </p>
        </div>

        {isFeaturedState && (
          <>
            {/* Featured Type */}
            <div className="mb-6">
              <label htmlFor="featuredType" className="block text-sm font-medium text-text-secondary mb-2">
                Tipo de Destacado
              </label>
              <select
                id="featuredType"
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              >
                {featuredTypes.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de Inicio
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Dejar vacío para activar inmediatamente
                </p>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de Fin
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Dejar vacío para que no expire
                </p>
              </div>
            </div>

            {/* Validation Warning */}
            {startDate && endDate && new Date(startDate) > new Date(endDate) && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">Fecha inválida</p>
                  <p className="text-xs text-red-300 mt-1">
                    La fecha de inicio no puede ser posterior a la fecha de fin
                  </p>
                </div>
              </div>
            )}

            {/* Current Status Info */}
            {isCurrentlyFeatured() && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">
                  ✓ Este producto está actualmente destacado y visible en la app móvil
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};








