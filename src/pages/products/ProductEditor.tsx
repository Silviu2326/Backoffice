import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MediaTab } from '../../components/products/tabs/MediaTab';
import { FeaturedProductTab } from '../../components/products/tabs/FeaturedProductTab';
import { VariantsTab } from '../../components/products/tabs/VariantsTab';
import { getProductById, updateProduct, updateFeaturedConfig } from '../../features/products/api/productService';
import { getProductVariants, createVariants, updateVariant } from '../../features/products/api/productVariantService';
import { getCharacters } from '../../features/brand/api/characterService';
import { Product, ProductStatus, InventoryType, Character } from '../../types/core';

const ProductEditor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    description: '',
    richDescription: '',
    basePrice: '',
    category: '',
    status: 'DRAFT' as ProductStatus,
    inventoryType: 'SINGLE' as InventoryType,
    tags: [] as string[],
    images: [] as string[],
    characterId: '',
  });

  const [stock, setStock] = useState<number>(0);

  const [featuredConfig, setFeaturedConfig] = useState({
    isFeatured: false,
    featuredStartDate: '',
    featuredEndDate: '',
    featuredType: 'beer_of_month',
  });

  // Cargar personajes desde Supabase al inicio
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const fetchedCharacters = await getCharacters({ isActive: true });
        setCharacters(fetchedCharacters);
      } catch (err) {
        console.error('Error loading characters:', err);
      }
    };

    loadCharacters();
  }, []);

  // Cargar producto desde Supabase
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const fetchedProduct = await getProductById(productId);
        
        if (!fetchedProduct) {
          setError('Producto no encontrado');
          return;
        }

        setProduct(fetchedProduct);
        setFormData({
          name: fetchedProduct.name,
          sku: fetchedProduct.sku,
          slug: fetchedProduct.slug,
          description: fetchedProduct.description,
          richDescription: fetchedProduct.richDescription || '',
          basePrice: fetchedProduct.basePrice.toString(),
          category: fetchedProduct.category,
          status: fetchedProduct.status,
          inventoryType: fetchedProduct.inventoryType,
          tags: fetchedProduct.tags,
          images: fetchedProduct.images,
          characterId: fetchedProduct.characterId || '',
        });

        if (fetchedProduct.featuredConfig) {
          setFeaturedConfig({
            isFeatured: fetchedProduct.featuredConfig.isFeatured || false,
            featuredStartDate: fetchedProduct.featuredConfig.featuredStartDate || '',
            featuredEndDate: fetchedProduct.featuredConfig.featuredEndDate || '',
            featuredType: fetchedProduct.featuredConfig.featuredType || 'beer_of_month',
          });
        }

        // Cargar stock desde variantes
        const variants = await getProductVariants(productId);
        if (variants.length > 0) {
          const totalStock = variants.reduce((acc, curr) => acc + (curr.stockQuantity || 0), 0);
          setStock(totalStock);
        }

      } catch (err) {
        console.error('Error loading product:', err);
        setError('Error al cargar el producto');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleSave = async () => {
    if (!productId) {
      alert('No se puede guardar: ID de producto no encontrado');
      return;
    }

    try {
      setIsSaving(true);
      
      const updates: Partial<Product> = {
        name: formData.name,
        sku: formData.sku,
        slug: formData.slug || formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: formData.description,
        richDescription: formData.richDescription,
        basePrice: parseFloat(formData.basePrice) || 0,
        category: formData.category,
        status: formData.status,
        inventoryType: formData.inventoryType,
        tags: formData.tags,
        images: formData.images,
        characterId: formData.characterId || undefined,
      };

      await updateProduct(productId, updates);
      
      // Actualizar featured config si cambió
      if (featuredConfig.isFeatured) {
        await updateFeaturedConfig(productId, {
          isFeatured: featuredConfig.isFeatured,
          featuredStartDate: featuredConfig.featuredStartDate || undefined,
          featuredEndDate: featuredConfig.featuredEndDate || undefined,
          featuredType: featuredConfig.featuredType,
        });
      }

      // Guardar Stock (Variantes)
      // Refetch variants to ensure we have the latest state
      const currentVariants = await getProductVariants(productId);
      
      if (currentVariants.length === 0) {
         // Crear variante por defecto si no existe ninguna
         const defaultSku = formData.sku ? `${formData.sku}-DEFAULT` : `PROD-${productId.substring(0, 8)}-DEFAULT`;
         
         await createVariants([{
             productId,
             sku: defaultSku,
             name: 'Standard',
             price: parseFloat(formData.basePrice) || 0,
             weightKg: 0,
             isDefault: true,
             stockQuantity: Number(stock) // Ensure number
         }]);
      } else {
         // Actualizar variante existente (la principal)
         // Buscamos la variante por defecto, o la primera si no hay default
         const mainVariant = currentVariants.find(v => v.isDefault) || currentVariants[0];
         
         if (mainVariant) {
             await updateVariant(mainVariant.id, { 
                 stockQuantity: Number(stock)
             });
         }
      }
      
      alert('Producto y stock actualizados correctamente');
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error al guardar el producto. Por favor, intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeaturedChange = (config: typeof featuredConfig) => {
    setFeaturedConfig(config);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        <span className="ml-3 text-text-secondary">Cargando producto...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-400 mb-4">{error || 'Producto no encontrado'}</p>
        <Button onClick={() => navigate('/admin/products')}>Volver a Productos</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-white/10 bg-[#2C2C2C]">
        <h1 className="text-xl font-semibold text-white">Editar: {product.name}</h1>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white px-4 py-2 rounded"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </header>

      <div className="flex-grow p-4">
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="destacado">Destacado</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card className="p-4 bg-[#2C2C2C] border-white/10">
              <h2 className="text-lg font-medium mb-4 text-white">Información General</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-text-secondary mb-2">Nombre del Producto</label>
                  <Input 
                    id="productName" 
                    type="text" 
                    placeholder="Nombre del Producto" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full" 
                  />
                </div>
                <div>
                  <label htmlFor="productSku" className="block text-sm font-medium text-text-secondary mb-2">SKU</label>
                  <Input 
                    id="productSku" 
                    type="text" 
                    placeholder="SKU" 
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 block w-full" 
                  />
                </div>
                <div>
                  <label htmlFor="productSlug" className="block text-sm font-medium text-text-secondary mb-2">Slug</label>
                  <Input 
                    id="productSlug" 
                    type="text" 
                    placeholder="url-amigable" 
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="mt-1 block w-full" 
                  />
                </div>
                <div>
                  <label htmlFor="productPrice" className="block text-sm font-medium text-text-secondary mb-2">Precio Base (€)</label>
                  <Input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label htmlFor="productCategory" className="block text-sm font-medium text-text-secondary mb-2">Categoría</label>
                  <Input
                    id="productCategory"
                    type="text"
                    placeholder="Categoría"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label htmlFor="productStatus" className="block text-sm font-medium text-text-secondary mb-2">Estado</label>
                  <select
                    id="productStatus"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    className="mt-1 block w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  >
                    <option value="DRAFT">Borrador</option>
                    <option value="PUBLISHED">Publicado</option>
                    <option value="ARCHIVED">Archivado</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label htmlFor="productCharacter" className="block text-sm font-medium text-text-secondary mb-2">Personaje Relacionado</label>
                  <Select
                    options={[
                      { value: '', label: 'Sin personaje (opcional)' },
                      ...characters.map((character: Character) => ({
                        value: character.id,
                        label: character.name,
                      })),
                    ]}
                    value={formData.characterId}
                    onChange={(value) => setFormData({ ...formData, characterId: value })}
                    placeholder="Seleccionar personaje"
                  />
                  {formData.characterId && (
                    <div className="mt-3 p-3 bg-[#2C2C2C] rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const selectedCharacter = characters.find(
                            (c: Character) => c.id === formData.characterId
                          );
                          return selectedCharacter ? (
                            <>
                              <div
                                className="w-8 h-8 rounded-full border-2 border-white/20 flex-shrink-0"
                                style={{ backgroundColor: selectedCharacter.accentColor || selectedCharacter.color }}
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
                <div className="col-span-2">
                  <label htmlFor="productDescription" className="block text-sm font-medium text-text-secondary mb-2">Descripción</label>
                  <textarea
                    id="productDescription"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del producto..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="media">
            <MediaTab 
              initialImages={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
            />
          </TabsContent>
          <TabsContent value="destacado">
            <FeaturedProductTab
              isFeatured={featuredConfig.isFeatured}
              featuredStartDate={featuredConfig.featuredStartDate}
              featuredEndDate={featuredConfig.featuredEndDate}
              featuredType={featuredConfig.featuredType}
              onFeaturedChange={handleFeaturedChange}
            />
          </TabsContent>
          <TabsContent value="inventario">
            {productId ? (
              <VariantsTab 
                productId={productId} 
                productSku={formData.sku}
                stock={stock}
                onStockChange={setStock}
              />
            ) : (
              <Card className="p-4 bg-[#2C2C2C] border-white/10">
                <h2 className="text-lg font-medium mb-4 text-white">Inventario</h2>
                <p className="text-text-secondary">Guarda el producto primero para gestionar variantes.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductEditor;
