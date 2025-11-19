import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { GripVertical, Calendar, Trash2, Plus, ImageIcon } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired';
}

const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Summer Sale Campaign',
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'New Collection Launch',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '3',
    title: 'Flash Deal Weekend',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
    startDate: '2024-12-01',
    endDate: '2024-12-03',
    status: 'expired',
  },
];

const BannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [draggedItem, setDraggedItem] = useState<Banner | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Banner) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    // Ghost image opacity handled by browser usually, but can be customized
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const draggedIndex = banners.findIndex((b) => b.id === draggedItem.id);
    if (draggedIndex === index) return;

    const newBanners = [...banners];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedItem);
    setBanners(newBanners);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getStatusBadge = (status: Banner['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" dot>Activo</Badge>;
      case 'scheduled':
        return <Badge variant="brand" dot>Programado</Badge>;
      case 'expired':
        return <Badge variant="default">Expirado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Banners</h1>
          <p className="text-gray-400 mt-2">Organiza los banners activos en la página de inicio</p>
        </div>
        <Button className="bg-[#F97316] hover:bg-[#EA580C] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Banner
        </Button>
      </div>

      <Card className="bg-[#1E1E1E] border-white/5">
        <CardHeader>
          <CardTitle>Banners Activos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              draggable
              onDragStart={(e) => handleDragStart(e, banner)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                relative flex items-center gap-4 p-4 rounded-lg border border-white/5 bg-[#252525]
                transition-all duration-200 cursor-move group hover:border-white/10
                ${draggedItem?.id === banner.id ? 'opacity-50 border-dashed border-white/30' : ''}
              `}
            >
              {/* Drag Handle */}
              <div className="text-gray-500 group-hover:text-white transition-colors">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Thumbnail */}
              <div className="h-16 w-24 rounded-md overflow-hidden bg-gray-800 flex-shrink-0 relative">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-600">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <div className="absolute top-0 left-0 w-full h-full bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-medium text-white truncate">{banner.title}</h4>
                  {getStatusBadge(banner.status)}
                </div>
                
                <div className="flex items-center text-sm text-gray-400 gap-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400 hover:bg-red-400/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay banners configurados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BannerManager;
