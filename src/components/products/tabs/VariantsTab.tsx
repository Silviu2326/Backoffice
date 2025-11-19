import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import Button from '../../ui/Button';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table/Table';

interface Variant {
  id: string;
  name: string;
  skuSuffix: string;
  price: number;
  stock: number;
  weight: number;
}

export const VariantsTab: React.FC = () => {
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple');
  
  // Simple product state
  const [basePrice, setBasePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);

  // Variable product state
  const [variants, setVariants] = useState<Variant[]>([]);

  const handleGenerateCombinations = () => {
    // Mock generation
    const newVariants: Variant[] = [
      { id: '1', name: 'Pack x1', skuSuffix: '-x1', price: 10, stock: 100, weight: 0.5 },
      { id: '2', name: 'Pack x6', skuSuffix: '-x6', price: 55, stock: 50, weight: 3.0 },
      { id: '3', name: 'Pack x12', skuSuffix: '-x12', price: 100, stock: 20, weight: 6.0 },
    ];
    setVariants(newVariants);
  };

  const addVariant = () => {
    const newVariant: Variant = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      skuSuffix: '',
      price: 0,
      stock: 0,
      weight: 0,
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof Variant, value: string | number) => {
    setVariants(
      variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4 text-white">Configuración de Producto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="productType" className="block text-sm font-medium text-gray-400 mb-1">
              Tipo de Producto
            </label>
            <Select
              label="Tipo de Producto"
              id="productType"
              value={productType}
              onChange={(val) => setProductType(val as 'simple' | 'variable')}
              options={[
                { value: 'simple', label: 'Producto Simple' },
                { value: 'variable', label: 'Producto Variable (con variantes)' },
              ]}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {productType === 'simple' ? (
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4 text-white">Inventario y Precio</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-400 mb-1">
                Precio Base ($)
              </label>
              <Input
                id="basePrice"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                placeholder="0.00"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-400 mb-1">
                Stock
              </label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                placeholder="0"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-400 mb-1">
                Peso (kg)
              </label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                placeholder="0.00"
                className="w-full"
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-medium text-white">Tabla de Variantes</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateCombinations}>
                <Wand2 className="h-4 w-4 mr-2" />
                Generar Combinaciones
              </Button>
              <Button onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Variante
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#1E1E1E] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre (ej. Pack x6)</TableHead>
                  <TableHead>Sufijo SKU</TableHead>
                  <TableHead>Precio ($)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                      No hay variantes definidas. Genera combinaciones o añade una manualmente.
                    </TableCell>
                  </TableRow>
                ) : (
                  variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                          placeholder="Nombre variante"
                          className="h-8 bg-black/20 border-white/10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={variant.skuSuffix}
                          onChange={(e) => updateVariant(variant.id, 'skuSuffix', e.target.value)}
                          placeholder="-suff"
                          className="h-8 bg-black/20 border-white/10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                          className="h-8 w-24 bg-black/20 border-white/10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                          className="h-8 w-20 bg-black/20 border-white/10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={variant.weight}
                          onChange={(e) => updateVariant(variant.id, 'weight', Number(e.target.value))}
                          className="h-8 w-20 bg-black/20 border-white/10"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(variant.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};
