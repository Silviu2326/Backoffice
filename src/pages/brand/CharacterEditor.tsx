import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Save, ArrowLeft, Loader2, Plus, X, Languages } from 'lucide-react';
import { Character } from '../../types/core';
import {
  getCharacterById,
  createCharacter,
  updateCharacter
} from '../../features/brand/api/characterService';
import { uploadFile } from '../../utils/storage';

const CharacterEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    slug: '',
    role: '',
    roleEn: '',
    roleSubtitle: '',
    roleSubtitleEn: '',
    biography: '',
    biographyEn: '',
    description: '',
    descriptionEn: '',
    signatureQuote: '',
    signatureQuoteEn: '',
    quote: '',
    avatarUrl: '',
    coverImageUrl: '',
    videoUrl: '',
    videoPresentationUrl: '',
    accentColor: '#ff6b35',
    primaryColor: '#ff6b35',
    secondaryColor: '#222222',
    personalityTags: [] as string[],
    personalityTagsEn: [] as string[],
    traits: [] as string[],
    traitsEn: [] as string[],
    interests: [] as string[],
    interestsEn: [] as string[],
    likes: [] as string[],
    likesEn: [] as string[],
    signatureBeer: '',
    signatureBeerStyle: '',
    cerveza: '',
    signatureAbv: '',
    abv: '',
    tipo: '',
    isActive: true,
  });

  const [newTag, setNewTag] = useState('');
  const [newTagEn, setNewTagEn] = useState('');
  const [newTrait, setNewTrait] = useState('');
  const [newTraitEn, setNewTraitEn] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newInterestEn, setNewInterestEn] = useState('');
  const [newLike, setNewLike] = useState('');
  const [newLikeEn, setNewLikeEn] = useState('');

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
          nameEn: fetchedCharacter.nameEn || '',
          slug: fetchedCharacter.slug,
          role: fetchedCharacter.role,
          roleEn: fetchedCharacter.roleEn || '',
          roleSubtitle: fetchedCharacter.roleSubtitle || '',
          roleSubtitleEn: fetchedCharacter.roleSubtitleEn || '',
          biography: fetchedCharacter.biography || '',
          biographyEn: fetchedCharacter.biographyEn || '',
          description: fetchedCharacter.description || '',
          descriptionEn: fetchedCharacter.descriptionEn || '',
          signatureQuote: fetchedCharacter.signatureQuote || '',
          signatureQuoteEn: fetchedCharacter.signatureQuoteEn || '',
          quote: fetchedCharacter.quote || '',
          avatarUrl: fetchedCharacter.avatarUrl || '',
          coverImageUrl: fetchedCharacter.coverImageUrl || '',
          videoUrl: (fetchedCharacter as any).videoUrl || fetchedCharacter.videoPresentationUrl || '',
          videoPresentationUrl: fetchedCharacter.videoPresentationUrl || '',
          accentColor: fetchedCharacter.accentColor || fetchedCharacter.color || '#ff6b35',
          primaryColor: fetchedCharacter.themeConfig?.primaryColor || '#ff6b35',
          secondaryColor: fetchedCharacter.themeConfig?.secondaryColor || '#222222',
          personalityTags: fetchedCharacter.personalityTags || [],
          personalityTagsEn: (fetchedCharacter as any).personalityTagsEn || [],
          traits: fetchedCharacter.traits || [],
          traitsEn: (fetchedCharacter as any).traitsEn || [],
          interests: fetchedCharacter.interests || [],
          interestsEn: (fetchedCharacter as any).interestsEn || [],
          likes: fetchedCharacter.likes || [],
          likesEn: (fetchedCharacter as any).likesEn || [],
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
      
      let finalVideoUrl = formData.videoUrl;

      // Upload video if selected
      if (selectedVideoFile) {
        try {
          setIsUploading(true);
          const timestamp = new Date().getTime();
          const fileName = `characters/videos/${timestamp}_${selectedVideoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          finalVideoUrl = await uploadFile('media', fileName, selectedVideoFile);
        } catch (uploadError) {
          console.error('Error uploading video:', uploadError);
          alert('Error al subir el video. Se guardará sin actualizar el video.');
        } finally {
          setIsUploading(false);
        }
      }

      const characterData: Partial<Character> & { videoUrl?: string } = {
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        slug: formData.slug || formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        role: formData.role || 'Sin Rol',
        roleEn: formData.roleEn || undefined,
        roleSubtitle: formData.roleSubtitle || undefined,
        roleSubtitleEn: formData.roleSubtitleEn || undefined,
        biography: formData.biography || undefined,
        biographyEn: formData.biographyEn || undefined,
        description: formData.description || undefined,
        descriptionEn: formData.descriptionEn || undefined,
        signatureQuote: formData.signatureQuote || undefined,
        signatureQuoteEn: formData.signatureQuoteEn || undefined,
        quote: formData.quote || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        coverImageUrl: formData.coverImageUrl || undefined,
        videoUrl: finalVideoUrl || undefined,
        videoPresentationUrl: finalVideoUrl || formData.videoPresentationUrl || undefined,
        accentColor: formData.accentColor,
        themeConfig: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        },
        personalityTags: formData.personalityTags.length > 0 ? formData.personalityTags : undefined,
        personalityTagsEn: formData.personalityTagsEn.length > 0 ? formData.personalityTagsEn : undefined,
        traits: formData.traits.length > 0 ? formData.traits : undefined,
        traitsEn: formData.traitsEn.length > 0 ? formData.traitsEn : undefined,
        interests: formData.interests.length > 0 ? formData.interests : undefined,
        interestsEn: formData.interestsEn.length > 0 ? formData.interestsEn : undefined,
        likes: formData.likes.length > 0 ? formData.likes : undefined,
        likesEn: formData.likesEn.length > 0 ? formData.likesEn : undefined,
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

  const addArrayItem = (field: 'personalityTags' | 'personalityTagsEn' | 'traits' | 'traitsEn' | 'interests' | 'interestsEn' | 'likes' | 'likesEn', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeArrayItem = (field: 'personalityTags' | 'personalityTagsEn' | 'traits' | 'traitsEn' | 'interests' | 'interestsEn' | 'likes' | 'likesEn', index: number) => {
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

              {/* Translations Section */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="w-5 h-5 text-brand-orange" />
                  <h3 className="text-lg font-medium text-white">Traducciones / Translations</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Spanish Column */}
                  <div className="space-y-4 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🇪🇸</span>
                      <span className="text-sm font-semibold text-white">Español</span>
                    </div>
                    <div>
                      <Input
                        label="Nombre del Personaje *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej. Cool Cat"
                      />
                    </div>
                    <div>
                      <Input
                        label="Rol"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Ej. El Aventurero"
                      />
                    </div>
                    <div>
                      <Input
                        label="Subtítulo del Rol"
                        value={formData.roleSubtitle}
                        onChange={(e) => setFormData({ ...formData, roleSubtitle: e.target.value })}
                        placeholder="Ej. Maestro Cervecero"
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
                  </div>

                  {/* English Column */}
                  <div className="space-y-4 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🇬🇧</span>
                      <span className="text-sm font-semibold text-white">English</span>
                    </div>
                    <div>
                      <Input
                        label="Character Name"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        placeholder="E.g. Cool Cat"
                      />
                    </div>
                    <div>
                      <Input
                        label="Role"
                        value={formData.roleEn}
                        onChange={(e) => setFormData({ ...formData, roleEn: e.target.value })}
                        placeholder="E.g. The Adventurer"
                      />
                    </div>
                    <div>
                      <Input
                        label="Role Subtitle"
                        value={formData.roleSubtitleEn}
                        onChange={(e) => setFormData({ ...formData, roleSubtitleEn: e.target.value })}
                        placeholder="E.g. Master Brewer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Short Description
                      </label>
                      <textarea
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                        placeholder="Short character description..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biography Tab */}
        <TabsContent value="biography" className="space-y-6">
          <Card className="p-6 bg-[#2C2C2C] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-brand-orange" />
                <CardTitle className="text-white">Biografía y Citas / Biography & Quotes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spanish Column */}
                <div className="space-y-4 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🇪🇸</span>
                    <span className="text-sm font-semibold text-white">Español</span>
                  </div>
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
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Cita Característica
                    </label>
                    <textarea
                      value={formData.signatureQuote}
                      onChange={(e) => setFormData({ ...formData, signatureQuote: e.target.value })}
                      placeholder="Frase característica del personaje..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* English Column */}
                <div className="space-y-4 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🇬🇧</span>
                    <span className="text-sm font-semibold text-white">English</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Full Biography
                    </label>
                    <textarea
                      value={formData.biographyEn}
                      onChange={(e) => setFormData({ ...formData, biographyEn: e.target.value })}
                      placeholder="Full character biography..."
                      rows={8}
                      className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Signature Quote
                    </label>
                    <textarea
                      value={formData.signatureQuoteEn}
                      onChange={(e) => setFormData({ ...formData, signatureQuoteEn: e.target.value })}
                      placeholder="Character's signature quote..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-6">
          <Card className="p-6 bg-[#2C2C2C] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-brand-orange" />
                <CardTitle className="text-white">Personalidad / Personality</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personality Tags */}
              <div>
                <h3 className="text-md font-medium text-white mb-4">Etiquetas de Personalidad / Personality Tags</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Spanish */}
                  <div className="space-y-3 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇪🇸</span>
                      <span className="text-sm font-semibold text-white">Español</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Ej. Aventurero, Divertido"
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
                  {/* English */}
                  <div className="space-y-3 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇬🇧</span>
                      <span className="text-sm font-semibold text-white">English</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTagEn}
                        onChange={(e) => setNewTagEn(e.target.value)}
                        placeholder="E.g. Adventurous, Fun"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('personalityTagsEn', newTagEn);
                            setNewTagEn('');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          addArrayItem('personalityTagsEn', newTagEn);
                          setNewTagEn('');
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.personalityTagsEn.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#ff6b35]/10 text-[#ff6b35]"
                        >
                          {tag}
                          <button
                            onClick={() => removeArrayItem('personalityTagsEn', index)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div>
                <h3 className="text-md font-medium text-white mb-4">Intereses / Interests</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Spanish */}
                  <div className="space-y-3 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇪🇸</span>
                      <span className="text-sm font-semibold text-white">Español</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Ej. Cerveza, Música"
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
                  {/* English */}
                  <div className="space-y-3 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇬🇧</span>
                      <span className="text-sm font-semibold text-white">English</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newInterestEn}
                        onChange={(e) => setNewInterestEn(e.target.value)}
                        placeholder="E.g. Beer, Music"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('interestsEn', newInterestEn);
                            setNewInterestEn('');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          addArrayItem('interestsEn', newInterestEn);
                          setNewInterestEn('');
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.interestsEn.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-400"
                        >
                          {interest}
                          <button
                            onClick={() => removeArrayItem('interestsEn', index)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Traits */}
              <div>
                <h3 className="text-md font-medium text-white mb-4">Rasgos / Traits</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Spanish */}
                  <div className="space-y-3 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇪🇸</span>
                      <span className="text-sm font-semibold text-white">Español</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTrait}
                        onChange={(e) => setNewTrait(e.target.value)}
                        placeholder="Ej. Valiente, Leal"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('traits', newTrait);
                            setNewTrait('');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          addArrayItem('traits', newTrait);
                          setNewTrait('');
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.traits.map((trait, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-400"
                        >
                          {trait}
                          <button
                            onClick={() => removeArrayItem('traits', index)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* English */}
                  <div className="space-y-3 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇬🇧</span>
                      <span className="text-sm font-semibold text-white">English</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTraitEn}
                        onChange={(e) => setNewTraitEn(e.target.value)}
                        placeholder="E.g. Brave, Loyal"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('traitsEn', newTraitEn);
                            setNewTraitEn('');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          addArrayItem('traitsEn', newTraitEn);
                          setNewTraitEn('');
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.traitsEn.map((trait, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-400"
                        >
                          {trait}
                          <button
                            onClick={() => removeArrayItem('traitsEn', index)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Likes */}
              <div>
                <h3 className="text-md font-medium text-white mb-4">Gustos / Likes</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Spanish */}
                  <div className="space-y-3 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇪🇸</span>
                      <span className="text-sm font-semibold text-white">Español</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newLike}
                        onChange={(e) => setNewLike(e.target.value)}
                        placeholder="Ej. Fiestas, Amigos"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('likes', newLike);
                            setNewLike('');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          addArrayItem('likes', newLike);
                          setNewLike('');
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.likes.map((like, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-500/10 text-purple-400"
                        >
                          {like}
                          <button
                            onClick={() => removeArrayItem('likes', index)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* English */}
                  <div className="space-y-3 p-4 rounded-lg bg-[#1A1A1A] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🇬🇧</span>
                      <span className="text-sm font-semibold text-white">English</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newLikeEn}
                        onChange={(e) => setNewLikeEn(e.target.value)}
                        placeholder="E.g. Parties, Friends"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('likesEn', newLikeEn);
                            setNewLikeEn('');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          addArrayItem('likesEn', newLikeEn);
                          setNewLikeEn('');
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.likesEn.map((like, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-500/10 text-purple-400"
                        >
                          {like}
                          <button
                            onClick={() => removeArrayItem('likesEn', index)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
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

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Video del Personaje
                </label>
                <div className="space-y-4">
                  <FileUpload
                    accept="video/*"
                    maxSize={50 * 1024 * 1024} // 50MB
                    onFilesChange={(files) => {
                      if (files.length > 0) {
                        setSelectedVideoFile(files[0]);
                      } else {
                        setSelectedVideoFile(null);
                      }
                    }}
                    isUploading={isUploading}
                  />
                  
                  {selectedVideoFile ? (
                    <p className="text-xs text-green-400">
                      Archivo seleccionado: {selectedVideoFile.name}
                    </p>
                  ) : formData.videoUrl ? (
                    <div className="bg-[#3A3A3A] p-2 rounded-lg border border-white/10">
                      <p className="text-xs text-text-secondary mb-1">Video actual:</p>
                      <a href={formData.videoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-orange text-sm hover:underline truncate block">
                        {formData.videoUrl}
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      Arrastra un video o haz clic para seleccionar. Formato MP4 recomendado.
                    </p>
                  )}
                </div>
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
