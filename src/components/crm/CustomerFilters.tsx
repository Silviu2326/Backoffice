import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import Button from '../ui/Button';

export const CustomerFilters: React.FC = () => {
  const [status, setStatus] = useState('Todos');
  const [segment, setSegment] = useState('Todos');

  const statusOptions = [
    { value: 'Todos', label: 'Todos' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Ban', label: 'Ban' },
  ];

  const segmentOptions = [
    { value: 'Todos', label: 'Todos' },
    { value: 'VIP', label: 'VIP' },
    { value: 'Riesgo', label: 'Riesgo' },
  ];

  return (
    <div className="flex flex-row items-center gap-4">
      <Input
        type="text"
        placeholder="Buscar por nombre, email..."
        className="flex-grow"
      />

      <Select
        label="Estado"
        className="w-48"
        options={statusOptions}
        value={status}
        onChange={setStatus}
      />

      <Select
        label="Segmento"
        className="w-48"
        options={segmentOptions}
        value={segment}
        onChange={setSegment}
      />

      <Button variant="outline">Reset</Button>
    </div>
  );
};
