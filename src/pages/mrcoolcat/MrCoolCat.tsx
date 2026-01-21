import React, { useState, useEffect } from 'react';
import { Cat, Upload, Loader2, CheckCircle } from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';
import { uploadFile } from '../../utils/storage';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const BUCKET_NAME = 'media';
const FILE_PATH = 'mrcoolcat/avatar';

export default function MrCoolCat() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentImage();
  }, []);

  const loadCurrentImage = async () => {
    try {
      const { data } = await supabase.storage
        .from(BUCKET_NAME)
        .list('mrcoolcat', { limit: 1, search: 'avatar' });

      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`mrcoolcat/${data[0].name}`);

        setCurrentImage(`${urlData.publicUrl}?t=${Date.now()}`);
      }
    } catch (error) {
      console.error('Error loading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const extension = selectedFile.name.split('.').pop();
      const path = `${FILE_PATH}.${extension}`;

      const publicUrl = await uploadFile(BUCKET_NAME, path, selectedFile);

      setCurrentImage(`${publicUrl}?t=${Date.now()}`);
      setSelectedFile(null);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-brand-orange/20 rounded-xl">
          <Cat className="w-8 h-8 text-brand-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mr. Cool Cat</h1>
          <p className="text-text-secondary">Gestiona la imagen del personaje</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Imagen actual */}
        <div className="bg-[#2C2C2C] rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Imagen Actual</h2>
          <div className="aspect-square rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-12 h-12 text-text-secondary animate-spin" />
            ) : currentImage ? (
              <img
                src={currentImage}
                alt="Mr. Cool Cat"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-text-secondary">
                <Cat className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>Sin imagen</p>
              </div>
            )}
          </div>
        </div>

        {/* Subir nueva imagen */}
        <div className="bg-[#2C2C2C] rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Subir Nueva Imagen</h2>

          <FileUpload
            accept="image/*"
            multiple={false}
            maxSize={5 * 1024 * 1024}
            onFilesChange={handleFilesChange}
            isUploading={isUploading}
          />

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-orange hover:bg-brand-orange/90 disabled:bg-brand-orange/50 text-white font-medium rounded-lg transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Guardar Imagen
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
