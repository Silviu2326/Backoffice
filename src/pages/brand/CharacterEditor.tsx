import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import { useNavigate } from 'react-router-dom'; // Assuming react-router is used
import { Save, ArrowLeft } from 'lucide-react';

interface CharacterForm {
  name: string;
  subtitle: string;
  story: string;
  primaryColor: string;
  secondaryColor: string;
  avatar: File | null;
  fullBody: File | null;
  wallpaper: File | null;
}

const CharacterEditor: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CharacterForm>({
    name: '',
    subtitle: '',
    story: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    avatar: null,
    fullBody: null,
    wallpaper: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: keyof CharacterForm, files: File[]) => {
    setForm(prev => ({ ...prev, [name]: files[0] || null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving character:', form);
    // Logic to save data would go here
    // navigate('/brand/characters'); 
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editor de Personaje</h1>
            <p className="text-gray-500">Crea o edita la información del personaje</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info & Colors */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
            <div className="space-y-4">
              <Input
                label="Nombre del Personaje"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Mr. CoolCat"
              />
              <Input
                label="Subtítulo"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                placeholder="Ej. El guardián del estilo"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  Historia (Bio)
                </label>
                <textarea
                  name="story"
                  rows={6}
                  className="w-full rounded-lg bg-[#3A3A3A] px-4 py-2.5 text-text-primary placeholder:text-text-muted border border-transparent outline-none focus:ring-2 focus:ring-brand-orange transition-all duration-200"
                  placeholder="Escribe la historia del personaje..."
                  value={form.story}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Paleta de Colores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Color Primario</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      value={form.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      placeholder="#000000"
                      className="pl-10"
                    />
                    <div 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: form.primaryColor }}
                    />
                  </div>
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Color Secundario</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      value={form.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      placeholder="#ffffff"
                      className="pl-10"
                    />
                    <div 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: form.secondaryColor }}
                    />
                  </div>
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Assets */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Assets Visuales</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Avatar (Cara)</label>
                <p className="text-xs text-gray-500 mb-2">Recomendado: 500x500px, PNG transparente</p>
                <FileUpload
                  accept="image/png,image/jpeg,image/webp"
                  onFilesChange={(files) => handleFileChange('avatar', files)}
                  maxSize={2 * 1024 * 1024} // 2MB
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Full Body (Cuerpo Entero)</label>
                <p className="text-xs text-gray-500 mb-2">Recomendado: 1000x2000px, PNG transparente</p>
                <FileUpload
                  accept="image/png,image/webp"
                  onFilesChange={(files) => handleFileChange('fullBody', files)}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Wallpaper (Fondo App)</label>
                <p className="text-xs text-gray-500 mb-2">Recomendado: 1920x1080px, JPG/PNG</p>
                <FileUpload
                  accept="image/png,image/jpeg,image/webp"
                  onFilesChange={(files) => handleFileChange('wallpaper', files)}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CharacterEditor;
