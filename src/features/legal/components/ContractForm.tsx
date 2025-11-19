import React from 'react';

export const ContractForm = () => {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de Contrato</label>
        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          <option>Prestación de Servicios</option>
          <option>NDA</option>
        </select>
      </div>
      {/* Más campos dinámicos aquí */}
    </form>
  );
};
