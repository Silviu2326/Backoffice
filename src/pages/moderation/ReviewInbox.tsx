import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Star, Quote } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  productName: string;
  productImage: string;
  rating: number;
  text: string;
  date: string;
}

// Mock Data
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    userName: 'Ana García',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    productName: 'Camiseta Básica Premium',
    productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    text: '¡Me encanta! La calidad del algodón es increíble y el ajuste es perfecto. Definitivamente compraré más colores.',
    date: 'Hace 2 horas'
  },
  {
    id: '2',
    userName: 'Carlos Ruiz',
    productName: 'Pantalones Chino Slim',
    productImage: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400&q=80',
    rating: 2,
    text: 'La talla es más pequeña de lo esperado. Pedí una M y parece una S. El color tampoco es exacto a la foto.',
    date: 'Hace 5 horas'
  },
  {
    id: '3',
    userName: 'Laura Martínez',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    productName: 'Zapatillas Urban',
    productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    rating: 4,
    text: 'Muy cómodas para el día a día. El único pero es que los cordones son un poco cortos.',
    date: 'Hace 1 día'
  },
   {
    id: '4',
    userName: 'Spam Bot',
    productName: 'Gafas de Sol Retro',
    productImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80',
    rating: 1,
    text: 'CLICK HERE FOR FREE PRIZES!!! www.fakelink.com',
    date: 'Hace 1 día'
  },
   {
    id: '5',
    userName: 'Miguel Ángel',
    productName: 'Mochila Vintage',
    productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    text: 'Es exactamente lo que buscaba. Cabe mi portátil de 15 pulgadas perfectamente y tiene muchos bolsillos.',
    date: 'Hace 2 días'
  }
];

const ReviewInbox = () => {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const currentReview = reviews[0]; // Always show the first one in the queue

  const handleApprove = useCallback(() => {
    if (!currentReview) return;
    setDirection('right');
    setTimeout(() => {
      setReviews(prev => prev.slice(1)); // Remove the first one
      setDirection(null);
    }, 200); 
  }, [currentReview]);

  const handleReject = useCallback(() => {
    if (!currentReview) return;
    setDirection('left');
    setTimeout(() => {
      setReviews(prev => prev.slice(1));
      setDirection(null);
    }, 200);
  }, [currentReview]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleApprove();
      } else if (e.key === 'ArrowLeft') {
        handleReject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleApprove, handleReject]);

  if (!currentReview) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
        <div className="bg-brand-surface/50 p-6 rounded-full mb-6">
           <Check className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">¡Todo al día!</h2>
        <p className="text-text-secondary max-w-md">
          Has moderado todas las reseñas pendientes. Buen trabajo.
        </p>
        <Button 
          variant="outline" 
          className="mt-8"
          onClick={() => setReviews(MOCK_REVIEWS)} // Reset for demo
        >
          Recargar Demo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-white">Moderación de Reseñas</h1>
            <p className="text-text-secondary">Revisa y aprueba el contenido generado por usuarios</p>
        </div>
        <Badge variant="brand" className="px-4 py-1 text-base">
          Pendientes: {reviews.length}
        </Badge>
      </div>

      <div className="flex justify-center">
        <Card className={`w-full max-w-lg relative transition-transform duration-200 ${
            direction === 'left' ? '-translate-x-10 opacity-50' : 
            direction === 'right' ? 'translate-x-10 opacity-50' : ''
        }`}>
          {/* Product Header */}
          <div className="relative h-48 w-full bg-brand-dark/50 overflow-hidden rounded-t-lg">
             <img 
                src={currentReview.productImage} 
                alt={currentReview.productName}
                className="w-full h-full object-cover opacity-80"
             />
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-dark to-transparent p-4">
                <p className="text-sm text-white/80 uppercase tracking-wider font-semibold">Producto</p>
                <h3 className="text-lg text-white font-bold truncate">{currentReview.productName}</h3>
             </div>
          </div>

          <div className="p-6 space-y-6">
            {/* User & Rating */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar 
                        src={currentReview.userAvatar} 
                        fallback={currentReview.userName} 
                        size="lg"
                    />
                    <div>
                        <p className="text-white font-medium">{currentReview.userName}</p>
                        <p className="text-xs text-text-secondary">{currentReview.date}</p>
                    </div>
                </div>
                <div className="flex gap-1 bg-brand-dark/30 p-2 rounded-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                            key={star} 
                            className={`w-5 h-5 ${star <= currentReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                        />
                    ))}
                </div>
            </div>

            {/* Review Text */}
            <div className="relative bg-brand-surface/50 p-6 rounded-xl border border-brand-border/50">
                <Quote className="absolute top-3 left-3 w-6 h-6 text-brand-primary/20 -scale-x-100" />
                <p className="text-lg text-white/90 leading-relaxed italic text-center relative z-10">
                    "{currentReview.text}"
                </p>
                <Quote className="absolute bottom-3 right-3 w-6 h-6 text-brand-primary/20" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-8 pt-4">
                <div className="flex flex-col items-center gap-2 group">
                    <button 
                        onClick={handleReject}
                        className="w-16 h-16 rounded-full bg-brand-surface border-2 border-red-500/20 text-red-500 flex items-center justify-center transition-all hover:bg-red-500 hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                        title="Rechazar (Flecha Izquierda)"
                    >
                        <X className="w-8 h-8" strokeWidth={3} />
                    </button>
                    <span className="text-xs text-text-secondary font-medium group-hover:text-red-500 transition-colors">Rechazar</span>
                </div>

                <div className="text-text-secondary text-sm font-medium bg-brand-surface px-3 py-1 rounded-full opacity-50">
                    Usa las flechas 
                    <span className="inline-block mx-1 border border-text-secondary/30 rounded px-1">←</span>
                    <span className="inline-block border border-text-secondary/30 rounded px-1">→</span>
                </div>

                <div className="flex flex-col items-center gap-2 group">
                    <button 
                        onClick={handleApprove}
                        className="w-16 h-16 rounded-full bg-brand-surface border-2 border-green-500/20 text-green-500 flex items-center justify-center transition-all hover:bg-green-500 hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                        title="Aprobar (Flecha Derecha)"
                    >
                        <Check className="w-8 h-8" strokeWidth={3} />
                    </button>
                    <span className="text-xs text-text-secondary font-medium group-hover:text-green-500 transition-colors">Aprobar</span>
                </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReviewInbox;
