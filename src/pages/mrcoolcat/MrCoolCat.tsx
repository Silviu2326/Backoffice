import React, { useState, useEffect } from 'react';
import { Cat, Upload, Loader2, MapPin, ExternalLink, User, Home, Save } from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';
import { uploadFile } from '../../utils/storage';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const BUCKET_NAME = 'media';
const FILE_PATH = 'mrcoolcat/avatar';
const CHARACTER_SLUG = 'mr-cool-cat';

export default function MrCoolCat() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Campos del personaje
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [address, setAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [savedGoogleMapsUrl, setSavedGoogleMapsUrl] = useState('');

  useEffect(() => {
    loadCurrentImage();
    loadCharacterData();
  }, []);

  const loadCharacterData = async () => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('id, name, address, google_maps_url')
        .eq('slug', CHARACTER_SLUG)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading character:', error);
        return;
      }

      if (data) {
        setCharacterId(data.id);
        setName(data.name || '');
        setSavedName(data.name || '');
        setAddress(data.address || '');
        setSavedAddress(data.address || '');
        setGoogleMapsUrl(data.google_maps_url || '');
        setSavedGoogleMapsUrl(data.google_maps_url || '');
      }
    } catch (error) {
      console.error('Error loading character data:', error);
    }
  };

  const handleSaveCharacterData = async () => {
    if (!characterId) {
      toast.error('No se encontró el personaje en la base de datos');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('characters')
        .update({
          name: name,
          address: address,
          google_maps_url: googleMapsUrl
        })
        .eq('id', characterId);

      if (error) throw error;

      setSavedName(name);
      setSavedAddress(address);
      setSavedGoogleMapsUrl(googleMapsUrl);
      toast.success('Datos guardados correctamente');
    } catch (error) {
      console.error('Error saving character data:', error);
      toast.error('Error al guardar los datos');
    } finally {
      setIsSaving(false);
    }
  };

  // Verificar si hay cambios sin guardar
  const hasChanges = name !== savedName || address !== savedAddress || googleMapsUrl !== savedGoogleMapsUrl;

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

      {/* Datos del Local */}
      <div className="mt-6 bg-[#2C2C2C] rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-orange/20 rounded-lg">
              <Cat className="w-5 h-5 text-brand-orange" />
            </div>
            <h2 className="text-lg font-semibold text-white">Datos del Local</h2>
          </div>
          {hasChanges && (
            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
              Cambios sin guardar
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <User className="w-4 h-4" />
              Nombre del Local
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: El Gato Cool Pub"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-brand-orange/50 transition-colors"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <Home className="w-4 h-4" />
              Dirección
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: C. Santos Médicos, 4, 03002 Alicante"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-brand-orange/50 transition-colors"
            />
          </div>

          {/* Google Maps URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <MapPin className="w-4 h-4" />
              URL de Google Maps
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-brand-orange/50 transition-colors"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveCharacterData}
              disabled={!hasChanges || isSaving || !characterId}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange/90 disabled:bg-brand-orange/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>

            {savedGoogleMapsUrl && (
              <a
                href={savedGoogleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
