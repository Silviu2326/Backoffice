import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { GripVertical, Trash2, Plus, ImageIcon, Video, CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Banner {
  id: string;
  url: string;
  media_type: 'image' | 'video';
  active: boolean;
  display_order: number;
  language: 'es' | 'en';
}

const BannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // New Banner State
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es');

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setBanners(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Por favor selecciona una imagen o video válido');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 50MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBanner = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('app-banners')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('app-banners')
        .getPublicUrl(filePath);

      // Determine media type
      const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      // Insert into database
      const { error: dbError } = await supabase
        .from('app_banners')
        .insert([{
          url: publicUrl,
          media_type: mediaType,
          active: true,
          display_order: banners.length + 1,
          language: selectedLanguage
        }]);

      if (dbError) throw dbError;

      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setIsAdding(false);
      fetchBanners();

      alert('¡Banner subido exitosamente!');
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      alert('Error al subir el banner: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from('app_banners')
      .update({ active: !banner.active })
      .eq('id', banner.id);

    if (!error) fetchBanners();
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;

    try {
      // Extract file path from URL
      const urlParts = banner.url.split('/');
      const filePath = `banners/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      await supabase.storage
        .from('app-banners')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('app_banners')
        .delete()
        .eq('id', banner.id);

      if (!error) fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Banners (App)</h1>
          <p className="text-gray-400 mt-2">Sube y gestiona los banners de la pantalla de inicio</p>
        </div>
        <Button
          className="bg-[#F97316] hover:bg-[#EA580C] text-white"
          onClick={() => setIsAdding(!isAdding)}
          disabled={uploading}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isAdding ? 'Cancelar' : 'Nuevo Banner'}
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-[#1E1E1E] border-white/5">
          <CardContent className="p-6 space-y-4">
            {/* Language Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Idioma del Banner
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedLanguage('es')}
                  className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${selectedLanguage === 'es'
                      ? 'bg-[#F97316]/10 border-[#F97316] text-[#F97316]'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                >
                  <span className="text-xl">🇪🇸</span>
                  <span className="font-medium">Español</span>
                </button>
                <button
                  onClick={() => setSelectedLanguage('en')}
                  className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${selectedLanguage === 'en'
                      ? 'bg-[#F97316]/10 border-[#F97316] text-[#F97316]'
                      : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                >
                  <span className="text-xl">🇺🇸</span>
                  <span className="font-medium">Inglés</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Seleccionar Archivo (Imagen o Video)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 hover:border-[#F97316] transition-colors text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400">
                      {selectedFile ? selectedFile.name : 'Click para seleccionar archivo'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo 50MB - JPG, PNG, GIF, MP4, WEBM
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="border border-white/10 rounded-lg p-4 bg-[#252525]">
                <p className="text-sm text-gray-400 mb-2">Vista Previa:</p>
                <div className="flex justify-center">
                  {selectedFile?.type.startsWith('image/') ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 rounded-lg object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      className="max-h-64 rounded-lg"
                      controls
                    />
                  )}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-[#252525] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="h-5 w-5 animate-spin text-[#F97316]" />
                  <span className="text-sm text-white">Subiendo archivo...</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={cancelUpload}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUploadBanner}
                disabled={!selectedFile || uploading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Guardar Banner
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#1E1E1E] border-white/5">
        <CardHeader>
          <CardTitle>Banners Activos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative flex items-center gap-4 p-4 rounded-lg border border-white/5 bg-[#252525]"
            >
              {/* Thumbnail */}
              <div className="h-20 w-32 rounded-md overflow-hidden bg-gray-800 flex-shrink-0 relative flex items-center justify-center">
                {banner.media_type === 'image' ? (
                  <img src={banner.url} alt="Banner" className="h-full w-full object-cover" />
                ) : (
                  <div className="relative w-full h-full">
                    <video src={banner.url} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-medium text-white truncate max-w-md text-sm">
                    {banner.url.split('/').pop()}
                  </h4>
                  <Badge variant={banner.active ? 'success' : 'default'}>
                    {banner.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge variant="outline">{banner.media_type}</Badge>
                  <Badge variant="outline" className={banner.language === 'en' ? 'border-blue-500 text-blue-500' : 'border-yellow-500 text-yellow-500'}>
                    {banner.language === 'en' ? 'EN' : 'ES'}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleActive(banner)}
                  title={banner.active ? "Desactivar" : "Activar"}
                >
                  {banner.active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDelete(banner)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {banners.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              No hay banners. Agrega uno arriba.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerManager;
