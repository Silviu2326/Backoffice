import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import { RefreshCw, Loader2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  created_at: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

const UserRecords: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, created_at, email, first_name, last_name, phone')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los registros de usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: Column<UserProfile>[] = [
    {
      header: 'Fecha de Registro',
      accessorKey: 'created_at',
      render: (row: UserProfile) => (
        <span className="text-text-secondary">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      render: (row: UserProfile) => (
        <span className="text-white font-medium">
          {row.email}
        </span>
      ),
    },
    {
      header: 'Nombre',
      accessorKey: 'first_name',
      render: (row: UserProfile) => (
        <span className="text-text-secondary">
          {row.first_name || '-'}
        </span>
      ),
    },
    {
      header: 'Apellido',
      accessorKey: 'last_name',
      render: (row: UserProfile) => (
        <span className="text-text-secondary">
          {row.last_name || '-'}
        </span>
      ),
    },
    {
      header: 'Teléfono',
      accessorKey: 'phone',
      render: (row: UserProfile) => (
        <span className="text-text-secondary">
          {row.phone || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Registros de Usuarios</h1>
          <p className="text-text-secondary mt-1">
            Lista de usuarios registrados en la plataforma
          </p>
        </div>
        <Button
          onClick={fetchUsers}
          disabled={isLoading}
          leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        >
          Actualizar
        </Button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2C2C2C] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-orange/10 rounded-lg">
              <Users className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Total Usuarios</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            <span className="ml-3 text-text-secondary">Cargando registros...</span>
          </div>
        ) : error ? (
          <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4 text-status-error">
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            pagination={{
              page: 1,
              pageSize: 10,
              total: users.length,
              onPageChange: () => {},
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserRecords;
