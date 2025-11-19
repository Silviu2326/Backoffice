import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { MOCK_CHARACTERS } from '../../data/mockFactory';
import { Character } from '../../types/core';
import { Plus, Image as ImageIcon } from 'lucide-react';

const CharacterList: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(MOCK_CHARACTERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    role: '',
    color: '#ff6b35',
    fullBodyArtUrl: '',
  });

  const roleOptions = [
    { value: '', label: 'Seleccionar rol...' },
    { value: 'Protagonista', label: 'Protagonista' },
    { value: 'Secundario', label: 'Secundario' },
    { value: 'Antagonista', label: 'Antagonista' },
    { value: 'Narrador', label: 'Narrador' },
    { value: 'Compañero', label: 'Compañero' },
  ];

  const handleCreateCharacter = () => {
    if (!newCharacter.name || !newCharacter.role || !newCharacter.color) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const character: Character = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCharacter.name,
      role: newCharacter.role,
      color: newCharacter.color,
      fullBodyArtUrl: newCharacter.fullBodyArtUrl || 'https://via.placeholder.com/400x800?text=Sin+Imagen',
    };

    setCharacters([...characters, character]);
    setIsModalOpen(false);
    setNewCharacter({
      name: '',
      role: '',
      color: '#ff6b35',
      fullBodyArtUrl: '',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
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

      {/* Characters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {characters.map((character: Character) => (
          <Card key={character.id} className="relative overflow-hidden group hover:border-[#ff6b35]/50 transition-colors">
            <div className="aspect-[1/2] w-full relative bg-white/5 overflow-hidden">
              <img
                src={character.fullBodyArtUrl}
                alt={character.name}
                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x800?text=Sin+Imagen';
                }}
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 text-white">{character.name}</h2>
              <Badge variant="default" className="mb-3">{character.role}</Badge>
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: character.color }}
                ></span>
                <span className="text-text-secondary text-sm">{character.color}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

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
                    Rol <span className="text-red-400">*</span>
                  </label>
                  <Select
                    options={roleOptions}
                    value={newCharacter.role}
                    onChange={(value) => setNewCharacter({ ...newCharacter, role: value })}
                    placeholder="Seleccionar rol"
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
                      value={newCharacter.color}
                      onChange={(e) => setNewCharacter({ ...newCharacter, color: e.target.value })}
                      placeholder="#ff6b35"
                      className="w-full pl-10"
                    />
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: newCharacter.color }}
                    />
                  </div>
                  <input
                    type="color"
                    value={newCharacter.color}
                    onChange={(e) => setNewCharacter({ ...newCharacter, color: e.target.value })}
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
                  URL de la Imagen (Full Body)
                </label>
                <div className="space-y-2">
                  <Input
                    value={newCharacter.fullBodyArtUrl}
                    onChange={(e) => setNewCharacter({ ...newCharacter, fullBodyArtUrl: e.target.value })}
                    placeholder="https://ejemplo.com/imagen-personaje.png"
                    className="w-full"
                  />
                  <p className="text-xs text-text-secondary">
                    URL de la imagen del personaje completo. Recomendado: PNG transparente, 400x800px
                  </p>
                </div>

                {/* Preview */}
                {newCharacter.fullBodyArtUrl && (
                  <div className="mt-4 p-4 bg-[#2C2C2C] rounded-lg border border-white/10">
                    <p className="text-xs text-text-secondary mb-2">Vista Previa:</p>
                    <div className="aspect-[1/2] w-32 mx-auto bg-white/5 rounded-lg overflow-hidden">
                      <img
                        src={newCharacter.fullBodyArtUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {!newCharacter.fullBodyArtUrl && (
                  <div className="mt-4 p-8 bg-[#2C2C2C] rounded-lg border border-dashed border-white/10 text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
                    <p className="text-sm text-text-secondary">
                      Se mostrará una imagen placeholder hasta que agregues una URL
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateCharacter}
            disabled={!newCharacter.name || !newCharacter.role || !newCharacter.color}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Personaje
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CharacterList;
