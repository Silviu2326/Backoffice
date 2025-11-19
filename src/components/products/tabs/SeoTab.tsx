import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';

interface SeoTabProps {
  initialData?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };
}

export const SeoTab: React.FC<SeoTabProps> = ({ initialData }) => {
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '');

  // Google SERP limits (approximate)
  const TITLE_LIMIT = 60;
  const DESC_LIMIT = 160;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-white mb-4">Configuración SEO</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-400 mb-1">
              Meta Title
            </label>
            <div className="relative">
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Título para buscadores"
                className="w-full pr-16"
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                metaTitle.length > TITLE_LIMIT ? 'text-red-400' : 'text-gray-500'
              }`}>
                {metaTitle.length}/{TITLE_LIMIT}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Título que aparecerá en la pestaña del navegador y en los resultados de búsqueda.
            </p>
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-400 mb-1">
              Meta Description
            </label>
            <div className="relative">
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Descripción breve para los resultados de búsqueda..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none"
              />
              <span className={`absolute right-3 bottom-3 text-xs ${
                metaDescription.length > DESC_LIMIT ? 'text-red-400' : 'text-gray-500'
              }`}>
                {metaDescription.length}/{DESC_LIMIT}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Resumen que invita a los usuarios a hacer clic desde los buscadores.
            </p>
          </div>

          <div>
            <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-400 mb-1">
              Canonical URL
            </label>
            <Input
              id="canonicalUrl"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://example.com/producto/..."
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL preferida para evitar contenido duplicado.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-white mb-4">Google Search Result Preview</h3>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-[600px]">
          {/* Breadcrumb / URL */}
          <div className="flex items-center gap-1 text-sm text-[#202124] mb-1 truncate">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 font-bold">
                G
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[#202124] text-sm">example.com</span>
                <span className="text-[#5f6368] text-xs truncate">
                  {canonicalUrl || 'https://example.com/producto/example-slug'}
                </span>
              </div>
            </div>
            <span className="text-[#5f6368] ml-auto text-xs cursor-pointer hover:bg-gray-100 p-1 rounded-full">
              ⋮
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-normal mb-1">
            {metaTitle || 'Título del Producto'}
          </h3>

          {/* Description */}
          <div className="text-sm text-[#4d5156] leading-snug break-words">
            {metaDescription || 'Aquí aparecerá la descripción meta de tu producto. Asegúrate de incluir palabras clave relevantes y un llamado a la acción claro.'}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 items-start">
          <div className="text-blue-400 mt-0.5">ℹ</div>
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Consejo SEO</p>
            <p className="opacity-80">
              Mantén el título entre 50-60 caracteres y la descripción bajo 160 caracteres para asegurar que se muestren completos en los resultados de búsqueda.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
