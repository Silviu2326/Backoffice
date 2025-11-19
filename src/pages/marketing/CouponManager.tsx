import React, { useState } from 'react';
import { Plus, Ticket, Calendar, Users, Hash, Percent, RefreshCw } from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { cn } from '../../utils/cn';

// --- Types ---

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  uses: number;
  limit: number | null; // null means unlimited
  expirationDate: string; // ISO Date
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
}

interface BatchConfig {
  prefix: string;
  quantity: number;
  length: number; // Length of the random part
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  limit: number | null; // For the input, we might use a specific value or 0 for unlimited
  expirationDate: string;
}

// --- Mock Data ---

const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'SUMMER2025',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    uses: 45,
    limit: 1000,
    expirationDate: '2025-08-31',
    status: 'ACTIVE',
  },
  {
    id: '2',
    code: 'WELCOME10',
    discountType: 'FIXED_AMOUNT',
    discountValue: 10,
    uses: 120,
    limit: null,
    expirationDate: '2025-12-31',
    status: 'ACTIVE',
  },
  {
    id: '3',
    code: 'VIP50OFF',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    uses: 50,
    limit: 50,
    expirationDate: '2025-06-01',
    status: 'DEPLETED',
  },
  {
    id: '4',
    code: 'EXPIRED_PROMO',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    uses: 10,
    limit: 100,
    expirationDate: '2024-01-01',
    status: 'EXPIRED',
  },
];

// --- Component ---

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Batch Generation State
  const [batchConfig, setBatchConfig] = useState<BatchConfig>({
    prefix: 'PROMO',
    quantity: 100,
    length: 8,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    limit: 1, // Default 1 use per coupon
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // Default 1 month from now
  });

  const generateCode = (prefix: string, length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + result;
  };

  const handleCreateBatch = () => {
    const newCoupons: Coupon[] = [];
    const existingCodes = new Set(coupons.map(c => c.code));

    let created = 0;
    let attempts = 0;
    const maxAttempts = batchConfig.quantity * 5; // Safety break

    while (created < batchConfig.quantity && attempts < maxAttempts) {
      const code = generateCode(batchConfig.prefix, batchConfig.length);
      if (!existingCodes.has(code)) {
        newCoupons.push({
          id: Math.random().toString(36).substr(2, 9),
          code: code,
          discountType: batchConfig.discountType,
          discountValue: Number(batchConfig.discountValue),
          uses: 0,
          limit: batchConfig.limit === 0 ? null : Number(batchConfig.limit),
          expirationDate: batchConfig.expirationDate,
          status: 'ACTIVE',
        });
        existingCodes.add(code);
        created++;
      }
      attempts++;
    }

    setCoupons(prev => [...newCoupons, ...prev]);
    setIsModalOpen(false);
  };

  const columns: Column<Coupon>[] = [
    {
      header: 'Código',
      accessorKey: 'code',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-brand-orange" />
          <span className="font-mono font-bold text-white">{item.code}</span>
        </div>
      ),
    },
    {
      header: 'Descuento',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.discountType === 'PERCENTAGE' ? (
            <Percent className="h-4 w-4 text-blue-400" />
          ) : (
            <span className="font-bold text-green-400">€</span>
          )}
          <span className="font-medium text-white">
            {item.discountValue}
            {item.discountType === 'PERCENTAGE' ? '%' : ' EUR'}
          </span>
        </div>
      ),
    },
    {
      header: 'Usos / Límite',
      render: (item) => {
        const isUnlimited = item.limit === null;
        const percentage = isUnlimited ? 0 : (item.uses / item.limit!) * 100;
        
        return (
          <div className="w-32">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white">{item.uses}</span>
              <span className="text-text-secondary">{isUnlimited ? '∞' : item.limit}</span>
            </div>
            {!isUnlimited && (
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    percentage >= 100 ? "bg-status-error" : "bg-brand-orange"
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Expiración',
      accessorKey: 'expirationDate',
      render: (item) => (
        <div className="flex items-center gap-2 text-text-secondary">
          <Calendar className="h-4 w-4" />
          <span>{new Date(item.expirationDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      render: (item) => {
        const variants: Record<string, "success" | "danger" | "warning" | "default"> = {
          ACTIVE: 'success',
          EXPIRED: 'danger',
          DEPLETED: 'warning',
        };
        const labels = {
          ACTIVE: 'Activo',
          EXPIRED: 'Expirado',
          DEPLETED: 'Agotado',
        };
        return (
          <Badge variant={variants[item.status]} dot>
            {labels[item.status]}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestor de Cupones</h1>
          <p className="text-text-secondary">Administra y genera códigos de descuento masivos</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Crear Lote
        </Button>
      </div>

      {/* Table */}
      <DataTable 
        data={coupons}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 10,
          total: coupons.length,
          onPageChange: () => {},
        }}
      />

      {/* Generator Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>Generar Lote de Cupones</ModalHeader>
        <ModalBody className="space-y-6">
          
          {/* Code Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/10 pb-2">
              Configuración del Código
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Prefijo"
                placeholder="E.g., SUMMER"
                value={batchConfig.prefix}
                onChange={(e) => setBatchConfig({...batchConfig, prefix: e.target.value.toUpperCase()})}
                leftIcon={<Hash className="h-4 w-4" />}
              />
              <Input
                label="Cantidad"
                type="number"
                min={1}
                max={1000}
                value={batchConfig.quantity}
                onChange={(e) => setBatchConfig({...batchConfig, quantity: parseInt(e.target.value) || 0})}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              />
              <Input
                label="Longitud (Aleatoria)"
                type="number"
                min={4}
                max={12}
                value={batchConfig.length}
                onChange={(e) => setBatchConfig({...batchConfig, length: parseInt(e.target.value) || 0})}
                helperText={`Total: ${batchConfig.prefix.length + batchConfig.length} caracteres`}
              />
            </div>
          </div>

          {/* Value Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/10 pb-2">
              Valor y Límites
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Descuento"
                options={[
                  { value: 'PERCENTAGE', label: 'Porcentaje (%)' },
                  { value: 'FIXED_AMOUNT', label: 'Monto Fijo (€)' },
                ]}
                value={batchConfig.discountType}
                onChange={(val) => setBatchConfig({...batchConfig, discountType: val as any})}
              />
              <Input
                label="Valor del Descuento"
                type="number"
                min={0}
                value={batchConfig.discountValue}
                onChange={(e) => setBatchConfig({...batchConfig, discountValue: parseFloat(e.target.value) || 0})}
                leftIcon={batchConfig.discountType === 'PERCENTAGE' ? <Percent className="h-4 w-4" /> : <span className="font-bold text-sm">€</span>}
              />
              <Input
                label="Límite de Usos (0 = Infinito)"
                type="number"
                min={0}
                value={batchConfig.limit || 0}
                onChange={(e) => setBatchConfig({...batchConfig, limit: parseInt(e.target.value) || null})}
                leftIcon={<Users className="h-4 w-4" />}
              />
              <Input
                label="Fecha de Expiración"
                type="date"
                value={batchConfig.expirationDate}
                onChange={(e) => setBatchConfig({...batchConfig, expirationDate: e.target.value})}
              />
            </div>
          </div>

        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateBatch}>
            Generar {batchConfig.quantity} Cupones
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
