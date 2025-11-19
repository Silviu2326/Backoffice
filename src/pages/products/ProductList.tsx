import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  List as ListIcon, 
  Plus, 
  Search, 
  Eye,
  Star
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CHARACTERS } from '../../data/mockFactory';
import { Product, Character } from '../../types/core';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table/Table';

// Simulated stock status since it's not on the main Product type (it's on Variants)
type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

interface ProductWithStock extends Product {
  stockLevel: number;
  stockStatus: StockStatus;
  characterId?: string; // ID del personaje relacionado
}

// Enriched mock data
const INITIAL_PRODUCTS: ProductWithStock[] = MOCK_PRODUCTS.map((p, index) => {
  const stockLevel = Math.floor(Math.random() * 100);
  let stockStatus: StockStatus = 'IN_STOCK';
  if (stockLevel === 0) stockStatus = 'OUT_OF_STOCK';
  else if (stockLevel < 10) stockStatus = 'LOW_STOCK';
  
  // El primer producto será la cerveza del mes de ejemplo
  const featuredConfig = index === 0 ? {
    isFeatured: true,
    featuredStartDate: new Date().toISOString().split('T')[0],
    featuredEndDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    featuredType: 'beer_of_month',
  } : undefined;
  
  return {
    ...p,
    stockLevel,
    stockStatus,
    featuredConfig,
  };
});

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithStock[]>(INITIAL_PRODUCTS);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    price: '',
    category: '',
    status: 'DRAFT',
    description: '',
    abv: '',
    ibu: '',
    srm: '',
    beerType: '',
    tags: [] as string[],
    characterId: '',
  });

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return [
      { value: 'all', label: 'Todas las categorías' },
      ...cats.map(c => ({ value: c, label: c }))
    ];
  }, [products]);

  const stockOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'IN_STOCK', label: 'En Stock' },
    { value: 'LOW_STOCK', label: 'Stock Bajo' },
    { value: 'OUT_OF_STOCK', label: 'Sin Stock' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStock = stockFilter === 'all' || product.stockStatus === stockFilter;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.category) {
      alert('Por favor completa los campos obligatorios: Nombre, SKU y Categoría');
      return;
    }

    const product: ProductWithStock = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name,
      sku: newProduct.sku,
      slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
      description: newProduct.description,
      basePrice: parseFloat(newProduct.price) || 0,
      category: newProduct.category,
      status: newProduct.status as any,
      images: ['https://via.placeholder.com/150'],
      tags: newProduct.tags,
      inventoryType: 'SINGLE' as any,
      stockLevel: 0,
      stockStatus: 'OUT_OF_STOCK',
      characterId: newProduct.characterId || undefined,
    };

    setProducts([product, ...products]);
    setIsModalOpen(false);
    setNewProduct({ 
      name: '', 
      sku: '', 
      price: '', 
      category: '', 
      status: 'DRAFT',
      description: '',
      abv: '',
      ibu: '',
      srm: '',
      beerType: '',
      tags: [],
      characterId: '',
    });
  };

  const getStockBadgeColor = (status: StockStatus) => {
    switch (status) {
      case 'IN_STOCK': return 'text-green-400 bg-green-400/10';
      case 'LOW_STOCK': return 'text-yellow-400 bg-yellow-400/10';
      case 'OUT_OF_STOCK': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
      switch (status) {
          case 'PUBLISHED': return 'Publicado';
          case 'DRAFT': return 'Borrador';
          case 'ARCHIVED': return 'Archivado';
          default: return status;
      }
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/admin/products/edit?id=${productId}`);
  };

  const handleSetBeerOfMonth = (product: ProductWithStock) => {
    const isCurrentlyBeerOfMonth = product.featuredConfig?.isFeatured && 
                                   product.featuredConfig?.featuredType === 'beer_of_month';
    
    if (isCurrentlyBeerOfMonth) {
      // Si ya es cerveza del mes, preguntar si quiere quitarla
      if (window.confirm(`¿Quitar "${product.name}" como Cerveza del Mes?`)) {
        setProducts(prev => prev.map(p => {
          if (p.id === product.id) {
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
      }
    } else {
      // Si no es cerveza del mes, marcarla como tal
      // Primero quitar cualquier otra cerveza del mes existente
      setProducts(prev => prev.map(p => {
        // Quitar otras cervezas del mes
        if (p.featuredConfig?.featuredType === 'beer_of_month' && p.id !== product.id) {
          return {
            ...p,
            featuredConfig: {
              ...p.featuredConfig,
              isFeatured: false,
            },
          };
        }
        // Marcar esta como cerveza del mes
        if (p.id === product.id) {
          const today = new Date();
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          
          return {
            ...p,
            featuredConfig: {
              isFeatured: true,
              featuredStartDate: today.toISOString().split('T')[0],
              featuredEndDate: endOfMonth.toISOString().split('T')[0],
              featuredType: 'beer_of_month',
            },
          };
        }
        return p;
      }));
      
      alert(`"${product.name}" ha sido marcada como Cerveza del Mes`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="text-text-secondary mt-1">Gestiona tu catálogo de productos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Nuevo Producto
        </Button>
      </div>

      {/* Filters & Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-[#2C2C2C] p-4 rounded-xl border border-white/5">
        <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Buscar productos..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={categories}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Categoría"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={stockOptions}
              value={stockFilter}
              onChange={setStockFilter}
              placeholder="Estado de Stock"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-brand-orange text-white' 
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
            title="Vista Lista"
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-brand-orange text-white' 
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
            title="Vista Cuadrícula"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="rounded-xl border border-white/5 bg-[#2C2C2C] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px]">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/5">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{product.name}</span>
                        {product.characterId && (() => {
                          const character = MOCK_CHARACTERS.find((c: Character) => c.id === product.characterId);
                          return character ? (
                            <span
                              className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                              style={{ backgroundColor: character.color }}
                              title={character.name}
                            />
                          ) : null;
                        })()}
                      </div>
                      <span className="text-xs text-text-secondary">{product.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-text-secondary">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-white">
                      {formatCurrency(product.basePrice)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        product.stockStatus === 'IN_STOCK' ? 'bg-green-500' :
                        product.stockStatus === 'LOW_STOCK' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-text-secondary">
                        {product.stockLevel} uds
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' :
                      product.status === 'DRAFT' ? 'bg-gray-500/10 text-gray-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewProduct(product.id)}
                        className="text-text-secondary hover:text-white"
                        title="Ver ficha del producto"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Ficha
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSetBeerOfMonth(product)}
                        className={`${
                          product.featuredConfig?.isFeatured && 
                          product.featuredConfig?.featuredType === 'beer_of_month'
                            ? 'text-[#ff6b35] hover:text-[#ff6b35]/80'
                            : 'text-text-secondary hover:text-[#ff6b35]'
                        }`}
                        title={
                          product.featuredConfig?.isFeatured && 
                          product.featuredConfig?.featuredType === 'beer_of_month'
                            ? 'Quitar como Cerveza del Mes'
                            : 'Marcar como Cerveza del Mes'
                        }
                      >
                        <Star 
                          className={`w-4 h-4 mr-1 ${
                            product.featuredConfig?.isFeatured && 
                            product.featuredConfig?.featuredType === 'beer_of_month'
                              ? 'fill-[#ff6b35]'
                              : ''
                          }`} 
                        />
                        {product.featuredConfig?.isFeatured && 
                         product.featuredConfig?.featuredType === 'beer_of_month'
                          ? 'Cerveza del Mes'
                          : 'Marcar del Mes'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:border-brand-orange/50 transition-colors group">
              <div className="aspect-square w-full relative bg-white/5">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md ${getStockBadgeColor(product.stockStatus)}`}>
                    {product.stockStatus === 'IN_STOCK' ? 'EN STOCK' : product.stockStatus === 'LOW_STOCK' ? 'STOCK BAJO' : 'SIN STOCK'}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-semibold text-white text-lg leading-tight line-clamp-1" title={product.name}>
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-sm text-text-secondary">{product.sku}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xl font-bold text-brand-orange">
                    {formatCurrency(product.basePrice)}
                  </span>
                  <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white">
                    Editar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff6b35]/10 rounded-lg">
              <Plus className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Nueva Cerveza</h2>
              <p className="text-sm text-text-secondary">Crea un nuevo producto de cerveza artesanal</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
          <div className="space-y-6 pr-2">
            {/* Información Básica */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Nombre de la Cerveza <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Ej: Morena Artesanal Premium"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    SKU <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                    placeholder="Ej: BEER-MORENA-001"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Categoría y Tipo */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Clasificación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Categoría <span className="text-red-400">*</span>
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Seleccionar categoría...' },
                      { value: 'IPA', label: 'IPA' },
                      { value: 'Lager', label: 'Lager' },
                      { value: 'Stout', label: 'Stout' },
                      { value: 'Ale', label: 'Ale' },
                      { value: 'Porter', label: 'Porter' },
                      { value: 'Pilsner', label: 'Pilsner' },
                      { value: 'Wheat', label: 'Wheat Beer' },
                      { value: 'Saison', label: 'Saison' },
                      { value: 'Bock', label: 'Bock' },
                      { value: 'Specialty', label: 'Especialidad' },
                    ]}
                    value={newProduct.category}
                    onChange={(value) => setNewProduct({ ...newProduct, category: value })}
                    placeholder="Seleccionar categoría"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Tipo de Cerveza
                  </label>
                  <Input
                    value={newProduct.beerType}
                    onChange={(e) => setNewProduct({ ...newProduct, beerType: e.target.value })}
                    placeholder="Ej: Cerveza Artesanal Premium"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Personaje Relacionado */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Personaje de la Marca
              </h3>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Personaje Relacionado
                </label>
                <Select
                  options={[
                    { value: '', label: 'Sin personaje (opcional)' },
                    ...MOCK_CHARACTERS.map((character: Character) => ({
                      value: character.id,
                      label: character.name,
                    })),
                  ]}
                  value={newProduct.characterId}
                  onChange={(value) => setNewProduct({ ...newProduct, characterId: value })}
                  placeholder="Seleccionar personaje"
                />
                <p className="text-xs text-text-secondary mt-2">
                  Opcional: Asocia esta cerveza con un personaje de la marca para mostrar en la app móvil
                </p>
                {newProduct.characterId && (
                  <div className="mt-3 p-3 bg-[#2C2C2C] rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const selectedCharacter = MOCK_CHARACTERS.find(
                          (c: Character) => c.id === newProduct.characterId
                        );
                        return selectedCharacter ? (
                          <>
                            <div
                              className="w-8 h-8 rounded-full border-2 border-white/20 flex-shrink-0"
                              style={{ backgroundColor: selectedCharacter.color }}
                            />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {selectedCharacter.name}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {selectedCharacter.role}
                              </p>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Características Técnicas */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Características Técnicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    ABV (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={newProduct.abv}
                    onChange={(e) => setNewProduct({ ...newProduct, abv: e.target.value })}
                    placeholder="Ej: 8.5"
                    className="w-full"
                  />
                  <p className="text-xs text-text-secondary mt-1">Alcohol By Volume</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    IBU
                  </label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="120"
                    value={newProduct.ibu}
                    onChange={(e) => setNewProduct({ ...newProduct, ibu: e.target.value })}
                    placeholder="Ej: 50"
                    className="w-full"
                  />
                  <p className="text-xs text-text-secondary mt-1">International Bitterness Units</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    SRM
                  </label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="40"
                    value={newProduct.srm}
                    onChange={(e) => setNewProduct({ ...newProduct, srm: e.target.value })}
                    placeholder="Ej: 25"
                    className="w-full"
                  />
                  <p className="text-xs text-text-secondary mt-1">Standard Reference Method (Color)</p>
                </div>
              </div>
            </div>

            {/* Precio y Estado */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Precio y Estado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Precio Base (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="Ej: 9.95"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Estado
                  </label>
                  <Select
                    options={[
                      { value: 'DRAFT', label: 'Borrador' },
                      { value: 'PUBLISHED', label: 'Publicado' },
                      { value: 'ARCHIVED', label: 'Archivado' },
                    ]}
                    value={newProduct.status}
                    onChange={(value) => setNewProduct({ ...newProduct, status: value })}
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Descripción
              </h3>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descripción de la Cerveza
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe las características, sabor, aroma y experiencia de esta cerveza..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Etiquetas
              </h3>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Tags (selecciona múltiples)
                </label>
                <select
                  multiple
                  value={newProduct.tags}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setNewProduct({ ...newProduct, tags: selected });
                  }}
                  className="w-full h-32 px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                >
                  <option value="artesanal">Artesanal</option>
                  <option value="premium">Premium</option>
                  <option value="sin-gluten">Sin Gluten</option>
                  <option value="edicion-limitada">Edición Limitada</option>
                  <option value="nuevo-lanzamiento">Nuevo Lanzamiento</option>
                  <option value="bestseller">Bestseller</option>
                  <option value="premio">Premio</option>
                  <option value="local">Local</option>
                  <option value="organico">Orgánico</option>
                  <option value="vegano">Vegano</option>
                </select>
                <p className="text-xs text-text-secondary mt-2">
                  Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples opciones
                </p>
                {newProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newProduct.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ff6b35]/10 text-[#ff6b35]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex-shrink-0 border-t border-white/10 pt-4 mt-4">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateProduct} className="bg-[#ff6b35] hover:bg-[#ff6b35]/90">
            <Plus className="w-4 h-4 mr-2" />
            Crear Cerveza
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProductList;
