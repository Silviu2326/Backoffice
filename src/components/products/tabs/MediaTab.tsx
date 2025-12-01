import React, { useState, useRef, useEffect } from 'react';
import FileUpload from '../../ui/FileUpload';
import { Card, CardContent } from '../../ui/Card';
import { X, Image as ImageIcon, Star, GripVertical } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { uploadFile } from '../../../utils/storage';

interface MediaTabProps {
  initialImages?: string[];
  onImagesChange?: (images: string[]) => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({ initialImages = [], onImagesChange }) => {
  // We use a local state to manage the images (URLs)
  const [images, setImages] = useState<string[]>(initialImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Use ref to track latest images state for event handlers to avoid stale closures
  const imagesRef = useRef(images);

  // Sync ref with state
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Sync state with props (if parent updates images externally)
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  // Handle file upload (upload to Supabase Storage)
  const handleFilesChange = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadPromises = files.map(async (file) => {
        // Use a unique name for the file
        const timestamp = new Date().getTime();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const path = `products/${timestamp}_${cleanName}`;
        
        // Upload using the shared utility (uses 'media' bucket)
        return await uploadFile('media', path, file);
      });

      const newImageUrls = await Promise.all(uploadPromises);
      const updatedImages = [...images, ...newImageUrls];
      
      imagesRef.current = updatedImages; // Update ref immediately
      setImages(updatedImages);
      onImagesChange?.(updatedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error al subir las imágenes. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    imagesRef.current = updatedImages; // Update ref immediately
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const setAsCover = (index: number) => {
    if (index === 0) return; // Already cover
    const imageToMove = images[index];
    const otherImages = images.filter((_, i) => i !== index);
    const updatedImages = [imageToMove, ...otherImages];
    imagesRef.current = updatedImages; // Update ref immediately
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

    imagesRef.current = newImages; // Update ref immediately
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Use ref to get the latest order
    onImagesChange?.(imagesRef.current);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-[#2C2C2C] p-4 rounded-lg border border-white/10 shadow-sm">
        <h3 className="text-lg font-medium text-white mb-4">Subir Imágenes</h3>
        <FileUpload
          accept="image/*"
          multiple={true}
          onFilesChange={handleFilesChange}
          isUploading={isUploading}
          className="w-full"
        />
        <p className="text-sm text-text-secondary mt-2">
          Soporta JPG, PNG, WEBP. Máximo 5MB por archivo.
        </p>
      </div>

      <div className="bg-[#2C2C2C] p-4 rounded-lg border border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Galería</h3>
          <span className="text-sm text-text-secondary">{images.length} imágenes</span>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-lg border-2 border-dashed border-white/10">
            <ImageIcon className="mx-auto h-12 w-12 text-text-secondary opacity-50" />
            <p className="mt-2 text-sm text-text-secondary">No hay imágenes subidas</p>
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
                  "group relative aspect-square bg-white/5 rounded-lg overflow-hidden border-2 transition-all cursor-move",
                  draggedIndex === index ? "opacity-50 border-brand-orange" : "border-transparent hover:border-white/20",
                  index === 0 && "border-brand-orange ring-2 ring-brand-orange/20"
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
