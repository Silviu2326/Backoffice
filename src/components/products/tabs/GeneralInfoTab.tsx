import React, { useState, useEffect } from 'react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
// import { Textarea } from '../../ui/Textarea'; // Assuming a Textarea component might exist or using a regular one

interface GeneralInfoTabProps {
  // Define props if needed
}

export const GeneralInfoTab: React.FC<GeneralInfoTabProps> = () => {
  const [productName, setProductName] = useState('');
  const [parentSKU, setParentSKU] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');

  // Auto-generate slug from product name
  useEffect(() => {
    if (productName) {
      setSlug(productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''));
    } else {
      setSlug('');
    }
  }, [productName]);

  // Mock data for categories and tags
  const categories = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Apparel', value: 'apparel' },
    { label: 'Home Goods', value: 'home-goods' },
  ];

  const availableTags = [
    { label: 'New Arrival', value: 'new-arrival' },
    { label: 'Bestseller', value: 'bestseller' },
    { label: 'Clearance', value: 'clearance' },
  ];

  // For multi-select tags, this would be more complex, e.g., using a dedicated multi-select component
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setTags(selectedOptions);
  };


  return (
    <div className="space-y-6 p-4">
      <div>
        <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Nombre</label>
        <Input
          id="productName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Nombre del Producto"
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label htmlFor="parentSKU" className="block text-sm font-medium text-gray-700">SKU Padre</label>
        <Input
          id="parentSKU"
          value={parentSKU}
          onChange={(e) => setParentSKU(e.target.value)}
          placeholder="SKU del Producto Padre (opcional)"
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
        <Input
          id="slug"
          value={slug}
          readOnly
          disabled
          placeholder="Slug (se generará automáticamente)"
          className="mt-1 block w-full bg-gray-50 cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
        <Select
          label="Categoría"
          id="category"
          value={category}
          onChange={setCategory}
          options={categories}
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Etiquetas</label>
        {/* Using native select for multi-select support as the custom Select component doesn't support it yet */}
        <select
          id="tags"
          value={tags}
          onChange={handleTagChange}
          multiple
          className="mt-1 block w-full h-24 rounded-lg bg-[#3A3A3A] border-transparent text-text-primary focus:ring-2 focus:ring-brand-orange p-2"
        >
            {availableTags.map(tag => (
                <option key={tag.value} value={tag.value}>{tag.label}</option>
            ))}
        </select>
      </div>

      <div>
        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">Descripción Corta</label>
        <textarea
          id="shortDescription"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={3}
          placeholder="Una descripción breve del producto"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
        ></textarea>
      </div>

      <div>
        <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700">Descripción Larga</label>
        <textarea
          id="longDescription"
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          rows={6}
          placeholder="Una descripción detallada del producto (Placeholder para RichText Editor)"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
        ></textarea>
      </div>
    </div>
  );
};
