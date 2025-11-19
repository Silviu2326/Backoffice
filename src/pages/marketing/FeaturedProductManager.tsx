import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { 
  Star, 
  Calendar, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockFactory';
import { Product } from '../../types/core';

interface FeaturedProduct extends Product {
  featuredConfig?: {
    isFeatured: boolean;
    featuredStartDate?: string;
    featuredEndDate?: string;
    featuredType?: string;
  };
}

// Mock data with featured products
const MOCK_FEATURED_PRODUCTS: FeaturedProduct[] = MOCK_PRODUCTS.slice(0, 5).map((product, index) => ({
  ...product,
  featuredConfig: index === 0 ? {
    isFeatured: true,
    featuredStartDate: '2024-12-01',
    featuredEndDate: '2024-12-31',
    featuredType: 'beer_of_month',
  } : index === 1 ? {
    isFeatured: true,
    featuredStartDate: '2024-12-15',
    featuredEndDate: '2025-01-15',
    featuredType: 'featured',
  } : undefined,
}));

const FeaturedProductManager: React.FC = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>(MOCK_FEATURED_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    featuredType: 'beer_of_month',
    startDate: '',
    endDate: '',
  });

  const featuredTypes = [
    { value: 'beer_of_month', label: 'Cerveza del Mes' },
    { value: 'featured', label: 'Producto Destacado' },
    { value: 'highlighted', label: 'Producto Resaltado' },
    { value: 'new_arrival', label: 'Nuevo Lanzamiento' },
  ];

  const getStatus = (product: FeaturedProduct) => {
    if (!product.featuredConfig?.isFeatured) return 'inactive';
    
    const now = new Date();
    const start = product.featuredConfig.featuredStartDate ? new Date(product.featuredConfig.featuredStartDate) : null;
    const end = product.featuredConfig.featuredEndDate ? new Date(product.featuredConfig.featuredEndDate) : null;
    
    if (start && end) {
      if (now >= start && now <= end) return 'active';
      if (now < start) return 'scheduled';
      if (now > end) return 'expired';
    }
    if (start && now < start) return 'scheduled';
    if (end && now > end) return 'expired';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Activo</Badge>;
      case 'scheduled':
        return <Badge variant="warning" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Programado</Badge>;
      case 'expired':
        return <Badge variant="danger" className="bg-red-500">Expirado</Badge>;
      default:
        return <Badge variant="default">Inactivo</Badge>;
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || 
                         (product.featuredConfig?.featuredType === typeFilter) ||
                         (typeFilter === 'none' && !product.featuredConfig?.isFeatured);
      return matchesSearch && matchesType;
    });
  }, [products, searchQuery, typeFilter]);

  const featuredProducts = useMemo(() => {
    return filteredProducts.filter(p => p.featuredConfig?.isFeatured);
  }, [filteredProducts]);

  const handleOpenModal = (product?: FeaturedProduct) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        productId: product.id,
        featuredType: product.featuredConfig?.featuredType || 'beer_of_month',
        startDate: product.featuredConfig?.featuredStartDate || '',
        endDate: product.featuredConfig?.featuredEndDate || '',
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        productId: '',
        featuredType: 'beer_of_month',
        startDate: '',
        endDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.productId) {
      // Find product by search or create new
      const product = products.find(p => p.id === formData.productId);
      if (!product) return;
    }

    setProducts(prev => prev.map(p => {
      if (p.id === formData.productId || (selectedProduct && p.id === selectedProduct.id)) {
        return {
          ...p,
          featuredConfig: {
            isFeatured: true,
            featuredStartDate: formData.startDate || undefined,
            featuredEndDate: formData.endDate || undefined,
            featuredType: formData.featuredType,
          },
        };
      }
      return p;
    }));

    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleRemoveFeatured = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          featuredConfig: {
            ...p.featuredConfig,
            isFeatured: false,
          },
        };
      }
      return p;
    }));
  };

  const columns: Column<FeaturedProduct>[] = [
    {
      header: 'Producto',
      accessorKey: 'name',
      render: (row: FeaturedProduct) => (
        <div>
          <div className="font-medium text-white">{row.name}</div>
          <div className="text-sm text-text-secondary">{row.sku}</div>
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessorKey: 'featuredConfig.featuredType',
      render: (row: FeaturedProduct) => {
        const type = row.featuredConfig?.featuredType || 'none';
        const typeLabel = featuredTypes.find(t => t.value === type)?.label || 'N/A';
        return <span className="text-text-secondary">{typeLabel}</span>;
      },
    },
    {
      header: 'Fechas',
      accessorKey: 'featuredConfig',
      render: (row: FeaturedProduct) => {
        const config = row.featuredConfig;
        if (!config) return <span className="text-text-secondary">-</span>;
        
        const start = config.featuredStartDate 
          ? new Date(config.featuredStartDate).toLocaleDateString('es-ES')
          : 'Inmediato';
        const end = config.featuredEndDate
          ? new Date(config.featuredEndDate).toLocaleDateString('es-ES')
          : 'Sin fin';
        
        return (
          <div className="text-sm">
            <div className="text-text-secondary">Inicio: {start}</div>
            <div className="text-text-secondary">Fin: {end}</div>
          </div>
        );
      },
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      render: (row: FeaturedProduct) => getStatusBadge(getStatus(row)),
    },
    {
      header: 'Acciones',
      accessorKey: 'id',
      render: (row: FeaturedProduct) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal(row)}
            className="gap-1"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </Button>
          {row.featuredConfig?.isFeatured && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveFeatured(row.id)}
              className="gap-1 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Quitar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Productos Destacados</h1>
          <p className="text-text-secondary mt-2">
            Configura qué productos aparecen como "Cerveza del Mes" y otros destacados en la app móvil
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Destacado
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Destacados</p>
              <p className="text-2xl font-bold text-white">{featuredProducts.length}</p>
            </div>
            <Star className="w-8 h-8 text-[#ff6b35]" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Activos</p>
              <p className="text-2xl font-bold text-green-400">
                {featuredProducts.filter(p => getStatus(p) === 'active').length}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Programados</p>
              <p className="text-2xl font-bold text-yellow-400">
                {featuredProducts.filter(p => getStatus(p) === 'scheduled').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Cerveza del Mes</p>
              <p className="text-2xl font-bold text-[#ff6b35]">
                {featuredProducts.filter(p => 
                  p.featuredConfig?.featuredType === 'beer_of_month' && getStatus(p) === 'active'
                ).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-[#ff6b35]" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            label="Tipo"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'beer_of_month', label: 'Cerveza del Mes' },
              { value: 'featured', label: 'Destacados' },
              { value: 'highlighted', label: 'Resaltados' },
              { value: 'new_arrival', label: 'Nuevos Lanzamientos' },
              { value: 'none', label: 'No destacados' },
            ]}
            className="w-full md:w-64"
          />
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredProducts}
            columns={columns}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-xl font-semibold text-white">
            {selectedProduct ? 'Editar Producto Destacado' : 'Nuevo Producto Destacado'}
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Producto
              </label>
              <Select
                label=""
                value={formData.productId}
                onChange={(value) => setFormData({ ...formData, productId: value })}
                options={[
                  { value: '', label: 'Seleccionar producto...' },
                  ...products.map(p => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Tipo de Destacado
              </label>
              <Select
                label=""
                value={formData.featuredType}
                onChange={(value) => setFormData({ ...formData, featuredType: value })}
                options={featuredTypes}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Fecha de Inicio
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Fecha de Fin
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && 
             new Date(formData.startDate) > new Date(formData.endDate) && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-sm text-red-400">
                  La fecha de inicio no puede ser posterior a la fecha de fin
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default FeaturedProductManager;

