import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Plus, Trash2, Save, X, Loader2, Filter, Search } from 'lucide-react';
import { Achievement } from '../../types/core';
import { 
  getAllAchievements, 
  createAchievement, 
  updateAchievement, 
  deleteAchievement,
  getAchievementsByCategory 
} from '../../features/gamification/api/achievementService';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';

const CATEGORIES = [
  { value: 'cervezas', label: 'Cervezas' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'beer-run', label: 'Beer Run' },
  { value: 'personajes', label: 'Personajes' },
  { value: 'social', label: 'Social' },
];

const DIFFICULTIES = [
  { value: 'fácil', label: 'Fácil' },
  { value: 'medio', label: 'Medio' },
  { value: 'difícil', label: 'Difícil' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
];

const BadgeEditor: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load achievements from Supabase
  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allAchievements = await getAllAchievements();
      setAchievements(allAchievements);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError('Error al cargar los logros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingAchievement({
      id: '',
      name: '',
      description: '',
      category: 'cervezas',
      difficulty: 'fácil',
      status: 'draft',
      rewardPoints: 0,
      displayOrder: achievements.length + 1,
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement({ ...achievement });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingAchievement || !editingAchievement.name) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (editingAchievement.id) {
        // Update existing
        await updateAchievement(editingAchievement.id, editingAchievement);
      } else {
        // Create new
        await createAchievement(editingAchievement as Omit<Achievement, 'id' | 'createdAt'>);
      }

      await loadAchievements();
      setIsModalOpen(false);
      setEditingAchievement(null);
    } catch (err) {
      console.error('Error saving achievement:', err);
      setError('Error al guardar el logro');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este logro?')) {
      return;
    }

    try {
      await deleteAchievement(id);
      await loadAchievements();
    } catch (err) {
      console.error('Error deleting achievement:', err);
      setError('Error al eliminar el logro');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingAchievement(null);
    setError(null);
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'fácil': return 'bg-green-500/20 text-green-400';
      case 'medio': return 'bg-yellow-500/20 text-yellow-400';
      case 'difícil': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'cervezas': return 'bg-blue-500/20 text-blue-400';
      case 'eventos': return 'bg-purple-500/20 text-purple-400';
      case 'beer-run': return 'bg-orange-500/20 text-orange-400';
      case 'personajes': return 'bg-pink-500/20 text-pink-400';
      case 'social': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Editor de Logros</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona los logros y medallas del sistema de gamificación</p>
        </div>
        <Button onClick={handleCreateNew} leftIcon={<Plus className="w-4 h-4" />}>
          Nuevo Logro
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-[#1E1E1E] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar logros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#252525]"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                options={[
                  { value: 'all', label: 'Todas las categorías' },
                  ...CATEGORIES
                ]}
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAchievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className="bg-[#1E1E1E] border-white/10 hover:border-brand-orange/50 transition-colors"
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-orange/20 to-brand-orange/5 flex items-center justify-center mb-3 text-3xl">
                {achievement.icon || achievement.iconName || '🏆'}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-1">{achievement.name}</h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{achievement.description || 'Sin descripción'}</p>
              
              <div className="flex flex-wrap gap-2 mb-3 justify-center">
                {achievement.category && (
                  <Badge className={getCategoryColor(achievement.category)}>
                    {achievement.category}
                  </Badge>
                )}
                {achievement.difficulty && (
                  <Badge className={getDifficultyColor(achievement.difficulty)}>
                    {achievement.difficulty}
                  </Badge>
                )}
                {achievement.status && (
                  <Badge variant={achievement.status === 'published' ? 'success' : 'default'}>
                    {achievement.status === 'published' ? 'Publicado' : 'Borrador'}
                  </Badge>
                )}
              </div>

              {achievement.rewardPoints && (
                <div className="text-sm text-brand-orange font-bold mb-3">
                  +{achievement.rewardPoints} pts
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-3 w-full">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEdit(achievement)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(achievement.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <Card className="bg-[#1E1E1E] border-white/10">
          <CardContent className="p-12 text-center">
            <p className="text-gray-400 mb-4">No se encontraron logros</p>
            <Button onClick={handleCreateNew} variant="outline">
              Crear Primer Logro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCancel}>
        <ModalHeader>
          {editingAchievement?.id ? 'Editar Logro' : 'Crear Nuevo Logro'}
        </ModalHeader>
        <ModalBody>
          {editingAchievement && (
            <div className="space-y-4">
              <Input
                label="Nombre del Logro *"
                value={editingAchievement.name}
                onChange={(e) => setEditingAchievement({ ...editingAchievement, name: e.target.value })}
                placeholder="Ej. Primera Cerveza"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={editingAchievement.description || ''}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, description: e.target.value })}
                  placeholder="Describe el logro..."
                  rows={3}
                  className="w-full px-4 py-2 bg-[#252525] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Categoría"
                  options={CATEGORIES}
                  value={editingAchievement.category || 'cervezas'}
                  onChange={(val) => setEditingAchievement({ ...editingAchievement, category: val })}
                />
                <Select
                  label="Dificultad"
                  options={DIFFICULTIES}
                  value={editingAchievement.difficulty || 'fácil'}
                  onChange={(val) => setEditingAchievement({ ...editingAchievement, difficulty: val as any })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Puntos de Recompensa"
                  type="number"
                  value={editingAchievement.rewardPoints?.toString() || '0'}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, rewardPoints: parseInt(e.target.value) || 0 })}
                />
                <Input
                  label="Orden de Visualización"
                  type="number"
                  value={editingAchievement.displayOrder?.toString() || '0'}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>

              <Input
                label="Icono (emoji o nombre)"
                value={editingAchievement.icon || editingAchievement.iconName || ''}
                onChange={(e) => setEditingAchievement({ ...editingAchievement, icon: e.target.value, iconName: e.target.value })}
                placeholder="🏆 o trophy"
              />

              <Input
                label="Color de Acento"
                type="color"
                value={editingAchievement.accentColor || '#ff6b35'}
                onChange={(e) => setEditingAchievement({ ...editingAchievement, accentColor: e.target.value })}
              />

              <Select
                label="Estado"
                options={STATUS_OPTIONS}
                value={editingAchievement.status || 'draft'}
                onChange={(val) => setEditingAchievement({ ...editingAchievement, status: val as any })}
              />

              <Input
                label="URL Icono Bloqueado"
                value={editingAchievement.iconLockedUrl || ''}
                onChange={(e) => setEditingAchievement({ ...editingAchievement, iconLockedUrl: e.target.value })}
                placeholder="https://..."
              />

              <Input
                label="URL Icono Desbloqueado"
                value={editingAchievement.iconUnlockedUrl || ''}
                onChange={(e) => setEditingAchievement({ ...editingAchievement, iconUnlockedUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
          <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Guardar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default BadgeEditor;
