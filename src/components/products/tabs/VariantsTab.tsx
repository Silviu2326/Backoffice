import React from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { ProductVariant } from '../../../types/core';

interface VariantsTabProps {
  productId: string;
  productSku?: string;
  onVariantsChange?: (variants: ProductVariant[]) => void;
  stock: number;
  onStockChange: (stock: number) => void;
}

export const VariantsTab: React.FC<VariantsTabProps> = ({ 
  stock,
  onStockChange
}) => {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-[#2C2C2C] border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Configuración de Inventario</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-text-secondary mb-2">
              Stock Total
            </label>
            <Input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => {
                onStockChange(parseInt(e.target.value) || 0);
              }}
              className="w-full"
              placeholder="0"
            />
            <p className="text-xs text-text-secondary mt-1">
              Cantidad total disponible en inventario.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};