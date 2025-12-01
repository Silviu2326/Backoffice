import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Character } from '../../types/core';
import { Plus, Image as ImageIcon, Loader2, Search, Eye, Trash2 } from 'lucide-react';
import { 
  getCharacters, 
  createCharacter, 
  deleteCharacter 
} from '../../features/brand/api/characterService';
import { uploadFile } from '../../utils/storage';

const CharacterList: React.FC = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    role: '',
    accentColor: '#ff6b35',
    avatarUrl: '',
    description: '',
  });

  // Cargar personajes desde Supabase
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const filters: { isActive?: boolean; search?: string } = {};
        
        if (statusFilter === 'active') {
          filters.isActive = true;
        } else if (statusFilter === 'inactive') {
          filters.isActive = false;
        }
        
        if (searchQuery) {
          filters.search = searchQuery;
        }
        
        const fetchedCharacters = await getCharacters(filters);
        setCharacters(fetchedCharacters);
      } catch (err) {
        console.error('Error loading characters:', err);
        setError('Error al cargar los personajes. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, [statusFilter, searchQuery]);

  const handleCreateCharacter = async () => {
    if (!newCharacter.name || !newCharacter.accentColor) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    try {
      setIsCreating(true);
      let avatarUrl = newCharacter.avatarUrl;

      // Upload image if selected
      if (selectedFile) {
        try {
          setIsUploading(true);
          const timestamp = new Date().getTime();
          const fileName = `characters/${timestamp}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          avatarUrl = await uploadFile('media', fileName, selectedFile);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Error al subir la imagen. Se creará el personaje sin imagen.');
        } finally {
          setIsUploading(false);
        }
      }
      
      const characterData: Omit<Character, 'id' | 'createdAt'> = {
        name: newCharacter.name,
        slug: newCharacter.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        role: 'Sin Rol', // Default role since field is removed
        accentColor: newCharacter.accentColor,
        avatarUrl: avatarUrl || undefined,
        description: newCharacter.description || undefined,
        isActive: true,
        // Legacy fields
        color: newCharacter.accentColor,
        fullBodyArtUrl: avatarUrl,
      };

      const createdCharacter = await createCharacter(characterData);
      
      setCharacters([createdCharacter, ...characters]);
      setIsModalOpen(false);
      setNewCharacter({
        name: '',
        role: '',
        accentColor: '#ff6b35',
        avatarUrl: '',
        description: '',
      });
      setSelectedFile(null);
      
      alert('Personaje creado correctamente');
    } catch (err) {
      console.error('Error creating character:', err);
      alert('Error al crear el personaje. Por favor, intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCharacter = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el personaje "${name}"?`)) {
      return;
    }

    try {
      await deleteCharacter(id);
      setCharacters(characters.filter(c => c.id !== id));
      alert('Personaje eliminado correctamente');
    } catch (err) {
      console.error('Error deleting character:', err);
      alert('Error al eliminar el personaje. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CMS Personajes</h1>
          <p className="text-text-secondary mt-2">
            Gestiona los personajes de la marca y sus características visuales
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Personaje
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-[#2C2C2C] p-4 rounded-xl border border-white/5">
        <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Buscar personajes..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Estado"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          <span className="ml-3 text-text-secondary">Cargando personajes...</span>
        </div>
      ) : (
        <>
          {/* Characters Grid */}
          {characters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No se encontraron personajes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {characters.map((character: Character) => (
                <Card key={character.id} className="relative overflow-hidden group hover:border-[#ff6b35]/50 transition-colors">
                  <div className="aspect-[1/2] w-full relative bg-white/5 overflow-hidden">
                    <img
                      src={character.avatarUrl || character.fullBodyArtUrl || character.coverImageUrl || 'https://via.placeholder.com/400x800?text=Sin+Imagen'}
                      alt={character.name}
                      className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x800?text=Sin+Imagen';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      {character.isActive ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="default">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2 text-white">{character.name}</h2>
                    <Badge variant="default" className="mb-3">{character.role}</Badge>
                    {character.roleSubtitle && (
                      <p className="text-sm text-text-secondary mb-3">{character.roleSubtitle}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: character.accentColor || character.color }}
                        ></span>
                        <span className="text-text-secondary text-sm">{character.accentColor || character.color}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/characters/${character.id}`)}
                          className="text-text-secondary hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCharacter(character.id, character.name)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Character Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff6b35]/10 rounded-lg">
              <Plus className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Nuevo Personaje</h2>
              <p className="text-sm text-text-secondary">Crea un nuevo personaje para la marca</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Información Básica
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Nombre del Personaje <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={newCharacter.name}
                    onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                    placeholder="Ej: Morena, Sifrina, Candela"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newCharacter.description}
                    onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                    placeholder="Descripción corta del personaje..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-[#3A3A3A] border border-white/10 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Color del Personaje
              </h3>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Color Principal <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      value={newCharacter.accentColor}
                      onChange={(e) => setNewCharacter({ ...newCharacter, accentColor: e.target.value })}
                      placeholder="#ff6b35"
                      className="w-full pl-10"
                    />
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: newCharacter.accentColor }}
                    />
                  </div>
                  <input
                    type="color"
                    value={newCharacter.accentColor}
                    onChange={(e) => setNewCharacter({ ...newCharacter, accentColor: e.target.value })}
                    className="h-10 w-16 rounded cursor-pointer border border-white/10 bg-transparent"
                  />
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Este color se usará para identificar al personaje en la app
                </p>
              </div>
            </div>

            {/* Imagen */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">
                Imagen del Personaje
              </h3>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Subir Imagen
                </label>
                <div className="space-y-4">
                  <FileUpload
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    onFilesChange={(files) => {
                      if (files.length > 0) {
                        setSelectedFile(files[0]);
                      } else {
                        setSelectedFile(null);
                      }
                    }}
                    isUploading={isUploading}
                  />
                  
                  {selectedFile ? (
                    <p className="text-xs text-green-400">
                      Archivo seleccionado: {selectedFile.name}
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      Arrastra una imagen o haz clic para seleccionar. Recomendado: PNG transparente, 400x800px.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isCreating || isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateCharacter}
            disabled={!newCharacter.name || !newCharacter.accentColor || isCreating || isUploading}
            className="gap-2"
          >
            {isCreating || isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isUploading ? 'Subiendo...' : 'Creando...'}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Crear Personaje
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CharacterList;
