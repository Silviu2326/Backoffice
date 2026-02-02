import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, AlertCircle, CheckCircle, Bug, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface NotificationLog {
    id: string;
    created_at: string;
    user_id: string;
    log_type: string;
    event_name: string;
    title: string | null;
    body: string | null;
    has_image: boolean;
    image_url: string | null;
    data: any;
    platform: string;
    device_info: any;
    error_message: string | null;
    stack_trace: string | null;
}

const NotificationLogs: React.FC = () => {
    const [logs, setLogs] = useState<NotificationLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterImage, setFilterImage] = useState<string>('all');
    const { toast } = useToast();

    useEffect(() => {
        loadLogs();
    }, [filterType, filterImage]);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('notification_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            // Aplicar filtros
            if (filterType !== 'all') {
                query = query.eq('log_type', filterType);
            }

            if (filterImage === 'with_image') {
                query = query.eq('has_image', true);
            } else if (filterImage === 'without_image') {
                query = query.eq('has_image', false);
            }

            const { data, error } = await query;

            if (error) throw error;

            setLogs(data || []);
        } catch (error: any) {
            console.error('Error cargando logs:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los logs: ' + error.message,
                variant: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getLogTypeIcon = (type: string) => {
        switch (type) {
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'received':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'opened':
                return <Eye className="w-5 h-5 text-blue-500" />;
            case 'debug':
                return <Bug className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getLogTypeColor = (type: string) => {
        switch (type) {
            case 'error':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'received':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'opened':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'debug':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Bug className="w-8 h-8 text-[#F76934]" />
                    Logs de Notificaciones
                </h1>
                <p className="text-gray-400 mt-1">
                    Debug de notificaciones push desde dispositivos reales
                </p>
            </div>

            {/* Filtros */}
            <div className="bg-[#2C2C2C] rounded-xl p-4 mb-6 border border-white/5">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Tipo de Log
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F76934]"
                        >
                            <option value="all">Todos</option>
                            <option value="received">Recibidas</option>
                            <option value="opened">Abiertas</option>
                            <option value="error">Errores</option>
                            <option value="debug">Debug</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Imágenes
                        </label>
                        <select
                            value={filterImage}
                            onChange={(e) => setFilterImage(e.target.value)}
                            className="bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F76934]"
                        >
                            <option value="all">Todas</option>
                            <option value="with_image">Con imagen</option>
                            <option value="without_image">Sin imagen</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={loadLogs}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-[#F76934] text-white rounded-lg hover:bg-[#F76934]/80 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refrescar
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de Logs */}
            <div className="bg-[#2C2C2C] rounded-xl border border-white/5 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Cargando logs...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        No hay logs disponibles
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#1A1A1A] border-b border-white/5">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Fecha/Hora
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Evento
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Título
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Imagen
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Platform
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {getLogTypeIcon(log.log_type)}
                                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getLogTypeColor(log.log_type)}`}>
                                                    {log.log_type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {log.event_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {log.title || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.has_image ? (
                                                <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs">
                                                    ✓ Sí
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-500/10 text-gray-500 rounded text-xs">
                                                    ✗ No
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300 uppercase">
                                            {log.platform}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-[#F76934] hover:text-[#F76934]/80 text-sm font-medium"
                                            >
                                                Ver detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Detalles */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
                    <div className="bg-[#2C2C2C] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-[#1A1A1A] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Detalles del Log</h2>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Información básica */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-2">Información Básica</h3>
                                <div className="bg-[#1A1A1A] rounded-lg p-4 space-y-2">
                                    <div><span className="text-gray-400">ID:</span> <span className="text-white font-mono text-sm">{selectedLog.id}</span></div>
                                    <div><span className="text-gray-400">Fecha:</span> <span className="text-white">{formatDate(selectedLog.created_at)}</span></div>
                                    <div><span className="text-gray-400">Tipo:</span> <span className="text-white">{selectedLog.log_type}</span></div>
                                    <div><span className="text-gray-400">Evento:</span> <span className="text-white">{selectedLog.event_name}</span></div>
                                    <div><span className="text-gray-400">Platform:</span> <span className="text-white uppercase">{selectedLog.platform}</span></div>
                                </div>
                            </div>

                            {/* Contenido de la notificación */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-2">Contenido</h3>
                                <div className="bg-[#1A1A1A] rounded-lg p-4 space-y-2">
                                    <div><span className="text-gray-400">Título:</span> <span className="text-white">{selectedLog.title || 'N/A'}</span></div>
                                    <div><span className="text-gray-400">Mensaje:</span> <span className="text-white">{selectedLog.body || 'N/A'}</span></div>
                                    <div><span className="text-gray-400">Tiene imagen:</span> <span className="text-white">{selectedLog.has_image ? 'Sí' : 'No'}</span></div>
                                    {selectedLog.image_url && (
                                        <div>
                                            <span className="text-gray-400">URL imagen:</span>
                                            <div className="mt-2">
                                                <a href={selectedLog.image_url} target="_blank" rel="noopener noreferrer" className="text-[#F76934] hover:underline break-all text-sm">
                                                    {selectedLog.image_url}
                                                </a>
                                                <img src={selectedLog.image_url} alt="Preview" className="mt-2 max-w-full rounded-lg border border-white/10" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Data */}
                            {selectedLog.data && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Data (JSON)</h3>
                                    <pre className="bg-[#1A1A1A] rounded-lg p-4 text-sm text-white overflow-x-auto">
                                        {JSON.stringify(selectedLog.data, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Device Info */}
                            {selectedLog.device_info && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Información del Dispositivo</h3>
                                    <pre className="bg-[#1A1A1A] rounded-lg p-4 text-sm text-white overflow-x-auto">
                                        {JSON.stringify(selectedLog.device_info, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Error */}
                            {selectedLog.error_message && (
                                <div>
                                    <h3 className="text-sm font-medium text-red-400 mb-2">Error</h3>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                        <p className="text-red-400">{selectedLog.error_message}</p>
                                        {selectedLog.stack_trace && (
                                            <pre className="mt-2 text-xs text-red-300 overflow-x-auto">
                                                {selectedLog.stack_trace}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationLogs;
