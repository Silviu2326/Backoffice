import React, { useState } from 'react';
import { FileUpload } from '../../ui/FileUpload';
import { X, Image as ImageIcon, Star, GripVertical } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface MediaTabProps {
  initialImages?: string[];
  onImagesChange?: (images: string[]) => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({ initialImages = [], onImagesChange }) => {
  // We use a local state to manage the images (URLs)
  const [images, setImages] = useState<string[]>(initialImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Handle file upload (simulate upload by creating object URLs)
  const handleFilesChange = (files: File[]) => {
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    const updatedImages = [...images, ...newImageUrls];
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const setAsCover = (index: number) => {
    if (index === 0) return; // Already cover
    const imageToMove = images[index];
    const otherImages = images.filter((_, i) => i !== index);
    const updatedImages = [imageToMove, ...otherImages];
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    // Required for Firefox to allow drag
    e.dataTransfer.effectAllowed = 'move';
    // Create a "ghost" image if needed, or just let browser handle it
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedIndex === null || draggedIndex === index) return;

    // Move the item in the array visually
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onImagesChange?.(images);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Imágenes</h3>
        <FileUpload
          accept="image/*"
          multiple={true}
          onFilesChange={handleFilesChange}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-2">
          Soporta JPG, PNG, WEBP. Máximo 5MB por archivo.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Galería</h3>
          <span className="text-sm text-gray-500">{images.length} imágenes</span>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No hay imágenes subidas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all cursor-move",
                  draggedIndex === index ? "opacity-50 border-blue-500" : "border-transparent hover:border-gray-300",
                  index === 0 && "border-indigo-500 ring-2 ring-indigo-100"
                )}
              >
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeImage(index)}
                      className="p-1.5 bg-white/90 rounded-full hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
                      title="Eliminar imagen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded text-white">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {index === 0 ? (
                      <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Portada
                      </span>
                    ) : (
                      <button
                        onClick={() => setAsCover(index)}
                        className="px-2 py-1 bg-white/90 hover:bg-white text-xs font-medium rounded text-gray-900 transition-colors"
                      >
                        Hacer Portada
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile/Always visible badges if not hovering (optional, keeping clean for now) */}
                {index === 0 && (
                   <div className="absolute top-2 left-2 px-2 py-1 bg-indigo-600/90 text-white text-xs font-medium rounded shadow-sm group-hover:opacity-0 transition-opacity">
                     Portada
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
