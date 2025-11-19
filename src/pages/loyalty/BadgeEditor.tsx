import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'; // Assuming heroicons are available or will be installed

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  locked: boolean;
}

const mockBadges: Badge[] = [
  { id: '1', name: 'Primer Pedido', description: 'Realiza tu primer pedido', icon: '🛒', condition: 'Pedidos > 0', locked: false },
  { id: '2', name: 'Gran Comprador', description: 'Más de 10 pedidos', icon: '🏆', condition: 'Pedidos > 10', locked: true },
  { id: '3', name: 'Gastador Elite', description: 'Gasto total > 500€', icon: '💰', condition: 'Gasto > 500', locked: false },
];

const BadgeEditor: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>(mockBadges);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

  const handleEdit = (badge: Badge) => {
    setEditingBadge({ ...badge });
  };

  const handleSave = () => {
    if (editingBadge) {
      if (editingBadge.id) {
        setBadges(badges.map((b) => (b.id === editingBadge.id ? editingBadge : b)));
      } else {
        setBadges([...badges, { ...editingBadge, id: String(Date.now()), locked: true }]);
      }
      setEditingBadge(null);
    }
  };

  const handleDelete = (id: string) => {
    setBadges(badges.filter((b) => b.id !== id));
  };

  const handleCancel = () => {
    setEditingBadge(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Editor de Medallas de Lealtad</h1>

      {/* Grid de medallas existentes */}
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Medallas Existentes</h2>
          <Button onClick={() => setEditingBadge({ id: '', name: '', description: '', icon: '', condition: '', locked: true })}>
            <PlusIcon className="h-5 w-5 mr-2" /> Nueva Medalla
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <Card key={badge.id} className="p-4 flex flex-col items-center text-center">
              <span className={`text-5xl mb-2 ${badge.locked ? 'grayscale' : ''}`}>
                {badge.icon}
              </span>
              <h3 className="text-lg font-semibold">{badge.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
              <Badge variant={badge.locked ? 'warning' : 'default'}>
                {badge.locked ? 'Bloqueada' : 'Desbloqueada'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(badge)} className="mt-2">
                Editar
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(badge.id)} className="mt-2">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* Editor de Medalla */}
      {editingBadge && (
        <Card className="p-6">
          <h2 className="text-xl font-medium mb-4">{editingBadge.id ? 'Editar Medalla' : 'Crear Nueva Medalla'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Logro</label>
              <Input
                id="name"
                value={editingBadge.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingBadge({ ...editingBadge, name: e.target.value })}
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
              <Input
                id="description"
                value={editingBadge.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icono</label>
              <Select

                value={editingBadge.icon}
              onChange={(value: string) => setEditingBadge({ ...editingBadge, icon: value })}
                options={[
                  { label: '🛒 Carrito', value: '🛒' },
                  { label: '🏆 Trofeo', value: '🏆' },
                  { label: '💰 Dinero', value: '💰' },
                  { label: '⭐ Estrella', value: '⭐' },
                  { label: '🎁 Regalo', value: '🎁' },
                ]}
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condición</label>
              <Select

                value={editingBadge.condition}
              onChange={(value: string) => setEditingBadge({ ...editingBadge, condition: value })}
                options={[
                  { label: 'Pedidos > X', value: 'Pedidos > X' },
                  { label: 'Gasto > Y', value: 'Gasto > Y' },
                  { label: 'Producto Z comprado', value: 'Producto Z comprado' },
                ]}
                className="mt-1 block w-full"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BadgeEditor;
