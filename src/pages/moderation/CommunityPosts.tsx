import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RefreshCw, Loader2, MessageSquare, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CommunityPost {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes_count: number;
  user_id: string;
  parent_id: string | null;
  user_profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

const PAGE_SIZE = 15;

const CommunityPosts: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);

      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id,
          content,
          image_url,
          created_at,
          likes_count,
          user_id,
          parent_id,
          user_profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingId(postId);

      // Primero eliminar las respuestas (posts hijos)
      const { error: childError } = await supabase
        .from('community_posts')
        .delete()
        .eq('parent_id', postId);

      if (childError) {
        console.error('Error deleting child posts:', childError);
      }

      // Eliminar los likes asociados
      const { error: likesError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId);

      if (likesError) {
        console.error('Error deleting likes:', likesError);
      }

      // Eliminar el post principal
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        throw error;
      }

      // Actualizar la lista local
      setPosts(prev => prev.filter(p => p.id !== postId && p.parent_id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Error al eliminar el comentario: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: Column<CommunityPost>[] = [
    {
      header: 'Fecha',
      accessorKey: 'created_at',
      render: (row: CommunityPost) => (
        <span className="text-text-secondary text-sm">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      header: 'Usuario',
      accessorKey: 'user_profiles',
      render: (row: CommunityPost) => {
        const profile = row.user_profiles;
        const name = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Sin nombre'
          : 'Usuario desconocido';
        return (
          <div className="flex flex-col">
            <span className="text-white font-medium">{name}</span>
            {profile?.email && (
              <span className="text-text-muted text-xs">{profile.email}</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Contenido',
      accessorKey: 'content',
      render: (row: CommunityPost) => (
        <div className="max-w-md">
          <p className="text-text-secondary truncate" title={row.content}>
            {row.content || <span className="italic text-text-muted">Sin texto</span>}
          </p>
          {row.image_url && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-400 mt-1">
              <ImageIcon className="h-3 w-3" />
              Con imagen
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessorKey: 'parent_id',
      render: (row: CommunityPost) => (
        <Badge variant={row.parent_id ? 'warning' : 'success'}>
          {row.parent_id ? 'Respuesta' : 'Post'}
        </Badge>
      ),
    },
    {
      header: 'Likes',
      accessorKey: 'likes_count',
      render: (row: CommunityPost) => (
        <span className="text-brand-orange font-semibold">
          {row.likes_count || 0}
        </span>
      ),
    },
    {
      header: 'Acciones',
      render: (row: CommunityPost) => (
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
          onClick={() => handleDelete(row.id)}
          disabled={deletingId === row.id}
          leftIcon={
            deletingId === row.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )
          }
        >
          Eliminar
        </Button>
      ),
    },
  ];

  const mainPosts = posts.filter(p => !p.parent_id);
  const replies = posts.filter(p => p.parent_id);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Moderacion del Muro</h1>
          <p className="text-text-secondary mt-1">
            Gestiona y elimina comentarios de la comunidad
          </p>
        </div>
        <Button
          onClick={fetchPosts}
          disabled={isLoading}
          leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        >
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2C2C2C] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-orange/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Total Posts</p>
              <p className="text-2xl font-bold text-white">{mainPosts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#2C2C2C] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Respuestas</p>
              <p className="text-2xl font-bold text-white">{replies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#2C2C2C] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Total Comentarios</p>
              <p className="text-2xl font-bold text-white">{posts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            <span className="ml-3 text-text-secondary">Cargando comentarios...</span>
          </div>
        ) : error ? (
          <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4 text-status-error">
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
            pagination={{
              page: currentPage,
              pageSize: PAGE_SIZE,
              total: posts.length,
              onPageChange: setCurrentPage,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CommunityPosts;
