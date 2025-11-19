import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { MediaTab } from '../../components/products/tabs/MediaTab';
import { FeaturedProductTab } from '../../components/products/tabs/FeaturedProductTab';

const ProductEditor: React.FC = () => {
  const [featuredConfig, setFeaturedConfig] = useState({
    isFeatured: false,
    featuredStartDate: '',
    featuredEndDate: '',
    featuredType: 'beer_of_month',
  });

  const handleFeaturedChange = (config: typeof featuredConfig) => {
    setFeaturedConfig(config);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold">Editar: Nombre Producto</h1>
        <Button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar Cambios</Button>
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
            <Card className="p-4">
              <h2 className="text-lg font-medium mb-4">Información General</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                  <Input id="productName" type="text" placeholder="Nombre del Producto" className="mt-1 block w-full" />
                </div>
                <div>
                  <label htmlFor="productSku" className="block text-sm font-medium text-gray-700">SKU</label>
                  <Input id="productSku" type="text" placeholder="SKU" className="mt-1 block w-full" />
                </div>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="media">
            <MediaTab />
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
            <Card className="p-4">
              <h2 className="text-lg font-medium mb-4">Inventario</h2>
              <p>Contenido para Inventario</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductEditor;
