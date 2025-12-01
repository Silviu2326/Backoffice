import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import Button from '../ui/Button';
import { CustomerSegment } from '../../types/core';

interface CustomerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'active' | 'inactive' | 'all';
  onStatusChange: (value: 'active' | 'inactive' | 'all') => void;
  segmentFilter: CustomerSegment | 'all';
  onSegmentChange: (value: CustomerSegment | 'all') => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  segmentFilter,
  onSegmentChange,
}) => {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearchChange]);

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
  ];

  const segmentOptions = [
    { value: 'all', label: 'Todos' },
    { value: CustomerSegment.VIP, label: 'VIP' },
    { value: CustomerSegment.LOYAL, label: 'Leal' },
    { value: CustomerSegment.NEW, label: 'Nuevo' },
    { value: CustomerSegment.RISK, label: 'Riesgo' },
  ];

  const handleReset = () => {
    setDebouncedSearch('');
    onStatusChange('all');
    onSegmentChange('all');
  };

  return (
    <div className="flex flex-row items-center gap-4">
      <Input
        type="text"
        placeholder="Buscar por nombre, email..."
        className="flex-grow"
        value={debouncedSearch}
        onChange={(e) => setDebouncedSearch(e.target.value)}
      />

      <Select
        label="Estado"
        className="w-48"
        options={statusOptions}
        value={statusFilter}
        onChange={(value) => onStatusChange(value as 'active' | 'inactive' | 'all')}
      />

      <Select
        label="Segmento"
        className="w-48"
        options={segmentOptions}
        value={segmentFilter}
        onChange={(value) => onSegmentChange(value as CustomerSegment | 'all')}
      />
    </div>
  );
};
