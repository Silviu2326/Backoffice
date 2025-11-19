import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export const RulesConfig: React.FC = () => {
  const [conversionRatio, setConversionRatio] = useState<string>('10');
  const [registrationBonus, setRegistrationBonus] = useState<string>('100');
  const [birthdayBonus, setBirthdayBonus] = useState<string>('50');
  const [pointsExpiration, setPointsExpiration] = useState<string>('Nunca');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send this data to a backend service
    console.log({
      conversionRatio,
      registrationBonus,
      birthdayBonus,
      pointsExpiration,
    });
    alert('Configuration saved!');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuración de Reglas de Fidelización</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="conversionRatio" className="block text-sm font-medium text-gray-700">
              Ratio Conversión: 1 Euro = X Puntos
            </label>
            <Input
              id="conversionRatio"
              type="number"
              value={conversionRatio}
              onChange={(e) => setConversionRatio(e.target.value)}
              placeholder="Ej: 10"
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label htmlFor="registrationBonus" className="block text-sm font-medium text-gray-700">
              Bonus Registro: X Puntos
            </label>
            <Input
              id="registrationBonus"
              type="number"
              value={registrationBonus}
              onChange={(e) => setRegistrationBonus(e.target.value)}
              placeholder="Ej: 100"
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label htmlFor="birthdayBonus" className="block text-sm font-medium text-gray-700">
              Bonus Cumpleaños: X Puntos
            </label>
            <Input
              id="birthdayBonus"
              type="number"
              value={birthdayBonus}
              onChange={(e) => setBirthdayBonus(e.target.value)}
              placeholder="Ej: 50"
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <Select
              label="Caducidad Puntos"
              id="pointsExpiration"
              value={pointsExpiration}
              onChange={setPointsExpiration}
              className="mt-1 block w-full"
              options={[
                { value: 'Nunca', label: 'Nunca' },
                { value: '1 año', label: '1 año' },
                { value: '6 meses', label: '6 meses' },
              ]}
            />
          </div>
          <Button type="submit" className="w-full">
            Guardar Configuración
          </Button>
        </form>
      </Card>
    </div>
  );
};
