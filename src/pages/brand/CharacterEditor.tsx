import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Save, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { Character } from '../../types/core';
import { 
  getCharacterById, 
  createCharacter, 
  updateCharacter 
} from '../../features/brand/api/characterService';

const CharacterEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    role: '',
    roleSubtitle: '',
    biography: '',
    description: '',
    signatureQuote: '',
    quote: '',
    avatarUrl: '',
    coverImageUrl: '',
    videoPresentationUrl: '',
    accentColor: '#ff6b35',
    primaryColor: '#ff6b35',
    secondaryColor: '#222222',
    personalityTags: [] as string[],
    traits: [] as string[],
    interests: [] as string[],
    likes: [] as string[],
    signatureBeer: '',
    signatureBeerStyle: '',
    cerveza: '',
    signatureAbv: '',
    abv: '',
    tipo: '',
    isActive: true,
  });

  const [newTag, setNewTag] = useState('');
  const [newTrait, setNewTrait] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newLike, setNewLike] = useState('');

  // Cargar personaje desde Supabase
  useEffect(() => {
    const loadCharacter = async () => {
      if (isNew) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const fetchedCharacter = await getCharacterById(id!);
        
        if (!fetchedCharacter) {
          setError('Personaje no encontrado');
          return;
        }

        setCharacter(fetchedCharacter);
        setFormData({
          name: fetchedCharacter.name,
          slug: fetchedCharacter.slug,
          role: fetchedCharacter.role,
          roleSubtitle: fetchedCharacter.roleSubtitle || '',
          biography: fetchedCharacter.biography || '',
          description: fetchedCharacter.description || '',
          signatureQuote: fetchedCharacter.signatureQuote || '',
          quote: fetchedCharacter.quote || '',
          avatarUrl: fetchedCharacter.avatarUrl || '',
          coverImageUrl: fetchedCharacter.coverImageUrl || '',
          videoPresentationUrl: fetchedCharacter.videoPresentationUrl || '',
          accentColor: fetchedCharacter.accentColor || fetchedCharacter.color || '#ff6b35',
          primaryColor: fetchedCharacter.themeConfig?.primaryColor || '#ff6b35',
          secondaryColor: fetchedCharacter.themeConfig?.secondaryColor || '#222222',
          personalityTags: fetchedCharacter.personalityTags || [],
          traits: fetchedCharacter.traits || [],
          interests: fetchedCharacter.interests || [],
          likes: fetchedCharacter.likes || [],
          signatureBeer: fetchedCharacter.signatureBeer || '',
          signatureBeerStyle: fetchedCharacter.signatureBeerStyle || '',
          cerveza: fetchedCharacter.cerveza || '',
          signatureAbv: fetchedCharacter.signatureAbv || '',
          abv: fetchedCharacter.abv || '',
          tipo: fetchedCharacter.tipo || '',
          isActive: fetchedCharacter.isActive ?? true,
        });
      } catch (err) {
        console.error('Error loading character:', err);
        setError('Error al cargar el personaje');
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacter();
  }, [id, isNew]);

  const handleSave = async () => {
    if (!formData.name || !formData.accentColor) {
      alert('Por favor completa los campos obligatorios: Nombre y Color');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const characterData: Partial<Character> = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        role: formData.role || 'Sin Rol',
        roleSubtitle: formData.roleSubtitle || undefined,
        biography: formData.biography || undefined,
        description: formData.description || undefined,
        signatureQuote: formData.signatureQuote || undefined,
        quote: formData.quote || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        coverImageUrl: formData.coverImageUrl || undefined,
        videoPresentationUrl: formData.videoPresentationUrl || undefined,
        accentColor: formData.accentColor,
        themeConfig: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        },
        personalityTags: formData.personalityTags.length > 0 ? formData.personalityTags : undefined,
        traits: formData.traits.length > 0 ? formData.traits : undefined,
        interests: formData.interests.length > 0 ? formData.interests : undefined,
        likes: formData.likes.length > 0 ? formData.likes : undefined,
        signatureBeer: formData.signatureBeer || undefined,
        signatureBeerStyle: formData.signatureBeerStyle || undefined,
        cerveza: formData.cerveza || undefined,
        signatureAbv: formData.signatureAbv || undefined,
        abv: formData.abv || undefined,
        tipo: formData.tipo || undefined,
        isActive: formData.isActive,
        // Legacy fields
        color: formData.accentColor,
        fullBodyArtUrl: formData.avatarUrl || formData.coverImageUrl,
      };

      if (isNew) {
        const created = await createCharacter(characterData as Omit<Character, 'id' | 'createdAt'>);
        alert('Personaje creado correctamente');
        navigate(`/admin/characters/${created.id}`);
      } else {
        await updateCharacter(id!, characterData);
        alert('Personaje actualizado correctamente');
      }
    } catch (err) {
      console.error('Error saving character:', err);
      setError('Error al guardar el personaje. Por favor, intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItem = (field: 'personalityTags' | 'traits' | 'interests' | 'likes', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeArrayItem = (field: 'personalityTags' | 'traits' | 'interests' | 'likes', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        <span className="ml-3 text-text-secondary">Cargando personaje...</span>
      </div>
    );
  }

  if (error && !isNew) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => navigate('/admin/characters')}>Volver a Personajes</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/characters')} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isNew ? 'Nuevo Personaje' : `Editar: ${character?.name || 'Personaje'}`}
            </h1>
            <p className="text-text-secondary">Crea o edita la información del personaje</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/characters')} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
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
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="biography">Biografía</TabsTrigger>
          <TabsTrigger value="personality">Personalidad</TabsTrigger>
          <TabsTrigger value="media">Medios</TabsTrigger>
          <TabsTrigger value="theme">Tema y Colores</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="p-6 bg-[#2C2C2C] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  label="Nombre del Personaje *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Cool Cat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descripción Corta
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción corta del personaje..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-600 bg-[#2C2C2C] text-brand-orange focus:ring-brand-orange"
                />
                <label htmlFor="isActive" className="text-sm text-white cursor-pointer">
                  Personaje activo y visible
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biography Tab */}
        <TabsContent value="biography" className="space-y-6">
          <Card className="p-6 bg-[#2C2C2C] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Biografía y Citas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Biografía Completa
                </label>
                <textarea
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Biografía completa del personaje..."
                  rows={8}
                  className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-6">
          <Card className="p-6 bg-[#2C2C2C] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Personalidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personality Tags */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Etiquetas de Personalidad
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ej. Aventurero, Divertido, Cool"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('personalityTags', newTag);
                        setNewTag('');
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      addArrayItem('personalityTags', newTag);
                      setNewTag('');
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.personalityTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#ff6b35]/10 text-[#ff6b35]"
                    >
                      {tag}
                      <button
                        onClick={() => removeArrayItem('personalityTags', index)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Intereses
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Ej. Cerveza, Música, Deportes"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('interests', newInterest);
                        setNewInterest('');
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      addArrayItem('interests', newInterest);
                      setNewInterest('');
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-400"
                    >
                      {interest}
                      <button
                        onClick={() => removeArrayItem('interests', index)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card className="p-6 bg-[#2C2C2C] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Assets Visuales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  label="URL del Avatar"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://ejemplo.com/avatar.png"
                />
                <p className="text-xs text-text-secondary mt-1">Recomendado: 500x500px, PNG transparente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-6">
          <Card className="p-6 bg-[#2C2C2C] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Tema y Colores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Color de Acento (Principal) *
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      placeholder="#ff6b35"
                      className="pl-10"
                    />
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: formData.accentColor }}
                    />
                  </div>
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="h-10 w-16 rounded cursor-pointer border border-white/10 bg-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CharacterEditor;
