import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Menu,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react';
import {
  NavigationTab,
  getAllNavigationTabs,
  updateNavigationTab,
  deleteNavigationTab,
  createNavigationTab,
  reorderNavigationTabs,
  initializeDefaultTabs
} from '../../features/settings/api/navigationService';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

// Iconos disponibles de Ionicons
const AVAILABLE_ICONS = [
  { value: 'home', label: 'Home' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'wine', label: 'Wine' },
  { value: 'people', label: 'People' },
  { value: 'storefront', label: 'Storefront' },
  { value: 'map', label: 'Map' },
  { value: 'trophy', label: 'Trophy' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'chatbubbles', label: 'Chatbubbles' },
  { value: 'mail', label: 'Mail' },
  { value: 'settings', label: 'Settings' },
  { value: 'cart', label: 'Cart' },
  { value: 'search', label: 'Search' },
  { value: 'star', label: 'Star' },
  { value: 'heart', label: 'Heart' },
  { value: 'gift', label: 'Gift' },
  { value: 'book', label: 'Book' },
  { value: 'camera', label: 'Camera' },
  { value: 'document', label: 'Document' },
  { value: 'folder', label: 'Folder' },
];

const NavigationManager: React.FC = () => {
  const [tabs, setTabs] = useState<NavigationTab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const [newTab, setNewTab] = useState({
    key: '',
    label_es: '',
    label_en: '',
    icon: 'home',
    is_active: true,
    is_system: false
  });

  useEffect(() => {
    loadTabs();
  }, []);

  const loadTabs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allTabs = await getAllNavigationTabs();
      setTabs(allTabs);
    } catch (err) {
      console.error('Error loading navigation tabs:', err);
      setError('Error al cargar las pestañas de navegación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (tab: NavigationTab) => {
    try {
      const updated = await updateNavigationTab(tab.id, { is_active: !tab.is_active });
      setTabs(tabs.map(t => t.id === updated.id ? updated : t));
    } catch (err) {
      console.error('Error toggling tab:', err);
      setError('Error al cambiar el estado de la pestaña');
    }
  };

  const handleDelete = async (tab: NavigationTab) => {
    if (tab.is_system) {
      alert('No se pueden eliminar pestañas del sistema');
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la pestaña "${tab.label_es}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteNavigationTab(tab.id);
      setTabs(tabs.filter(t => t.id !== tab.id));
    } catch (err) {
      console.error('Error deleting tab:', err);
      setError('Error al eliminar la pestaña');
    }
  };

  const handleCreateTab = async () => {
    if (!newTab.key || !newTab.label_es || !newTab.label_en) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const maxOrder = Math.max(...tabs.map(t => t.order), 0);
      const created = await createNavigationTab({
        ...newTab,
        order: maxOrder + 1
      });

      setTabs([...tabs, created]);
      setIsCreateModalOpen(false);
      setNewTab({
        key: '',
        label_es: '',
        label_en: '',
        icon: 'home',
        is_active: true,
        is_system: false
      });
    } catch (err) {
      console.error('Error creating tab:', err);
      setError('Error al crear la pestaña');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTabs = [...tabs];
    const draggedTab = newTabs[draggedIndex];
    newTabs.splice(draggedIndex, 1);
    newTabs.splice(index, 0, draggedTab);

    setTabs(newTabs);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      // Actualizar el orden de todas las pestañas
      const tabOrders = tabs.map((tab, index) => ({
        id: tab.id,
        order: index + 1
      }));

      await reorderNavigationTabs(tabOrders);
      setDraggedIndex(null);
    } catch (err) {
      console.error('Error reordering tabs:', err);
      setError('Error al reordenar las pestañas');
      // Recargar para obtener el orden correcto
      loadTabs();
    }
  };

  const handleInitializeDefaults = async () => {
    const confirmInit = window.confirm(
      '¿Estás seguro de que deseas inicializar las pestañas por defecto? Esto solo debe hacerse si la base de datos está vacía.'
    );

    if (!confirmInit) return;

    try {
      setIsInitializing(true);
      await initializeDefaultTabs();
      await loadTabs();
      alert('Pestañas por defecto creadas correctamente');
    } catch (err) {
      console.error('Error initializing default tabs:', err);
      setError('Error al inicializar pestañas. Puede que ya existan en la base de datos.');
    } finally {
      setIsInitializing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Menu className="w-6 h-6 text-blue-500" />
            Gestión de Navegación de la App
          </h1>
          <p className="text-gray-400 mt-1">
            Configura las pestañas visibles en la aplicación móvil
          </p>
        </div>
        {tabs.length === 0 && (
          <Button
            variant="outline"
            onClick={handleInitializeDefaults}
            isLoading={isInitializing}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Inicializar Pestañas
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-500/10 border-blue-500/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-semibold mb-1">Información importante:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                <li>Las pestañas marcadas con el icono de escudo <Shield className="w-3 h-3 inline" /> son del sistema y no pueden eliminarse</li>
                <li>Arrastra las pestañas para reordenarlas</li>
                <li>Los cambios se sincronizan automáticamente con la aplicación móvil</li>
                <li>Las pestañas desactivadas no aparecerán en la app móvil</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs List */}
      <Card className="bg-[#1E1E1E] border-white/10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Pestañas de Navegación</h2>

          {tabs.length === 0 ? (
            <div className="text-center py-12">
              <Menu className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No hay pestañas configuradas</p>
              <Button onClick={handleInitializeDefaults} isLoading={isInitializing}>
                Inicializar Pestañas por Defecto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-4 p-4 bg-[#252525] rounded-lg border border-white/5 hover:border-white/10 transition-all cursor-move ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-500" />

                  <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-mono text-sm">#{tab.order}</span>
                      <span className="text-white font-semibold">{tab.key}</span>
                      {tab.is_system && (
                        <Shield className="w-4 h-4 text-blue-400" title="Pestaña del sistema" />
                      )}
                    </div>

                    <div>
                      <p className="text-gray-300 text-sm">{tab.label_es}</p>
                      <p className="text-gray-500 text-xs">{tab.label_en}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Icono:</span>
                      <span className="text-blue-400 font-mono text-sm">{tab.icon}</span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(tab)}
                        className={tab.is_active ? 'text-green-400' : 'text-gray-500'}
                      >
                        {tab.is_active ? (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Oculto
                          </>
                        )}
                      </Button>

                      {!tab.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tab)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalHeader>Nueva Pestaña de Navegación</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Clave (KEY)"
              value={newTab.key}
              onChange={(e) => setNewTab({ ...newTab, key: e.target.value.toUpperCase() })}
              placeholder="Ej. MI_SECCION"
              helperText="Identificador único en mayúsculas"
            />

            <Input
              label="Nombre en Español"
              value={newTab.label_es}
              onChange={(e) => setNewTab({ ...newTab, label_es: e.target.value })}
              placeholder="Ej. Mi Sección"
            />

            <Input
              label="Nombre en Inglés"
              value={newTab.label_en}
              onChange={(e) => setNewTab({ ...newTab, label_en: e.target.value })}
              placeholder="Ej. My Section"
            />

            <Select
              label="Icono"
              options={AVAILABLE_ICONS}
              value={newTab.icon}
              onChange={(val) => setNewTab({ ...newTab, icon: val })}
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newTab.is_active}
                onChange={(e) => setNewTab({ ...newTab, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-[#252525] text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300">Activo por defecto</span>
            </label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateTab} leftIcon={<Save className="w-4 h-4" />}>
            Crear Pestaña
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default NavigationManager;
