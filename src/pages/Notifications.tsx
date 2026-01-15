import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Notifications: React.FC = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const handleSendNotification = async () => {
        if (!title.trim() || !body.trim()) {
            toast({
                title: 'Error',
                description: 'Por favor completa el título y el mensaje',
                variant: 'error'
            });
            return;
        }

        setIsSending(true);

        try {
            // 1. Fetch all users with a push token
            const { data: users, error } = await supabase
                .from('user_profiles')
                .select('expo_push_token')
                .not('expo_push_token', 'is', null);

            if (error) throw error;

            if (!users || users.length === 0) {
                toast({
                    title: 'Info',
                    description: 'No hay usuarios registrados con token de notificación',
                    variant: 'info'
                });
                setIsSending(false);
                return;
            }

            const tokens = users.map(u => u.expo_push_token).filter(t => t);
            const chunks = [];
            const chunkSize = 100; // Expo limit per request

            for (let i = 0; i < tokens.length; i += chunkSize) {
                chunks.push(tokens.slice(i, i + chunkSize));
            }

            // 2. Send notifications in batches
            let successCount = 0;

            for (const chunk of chunks) {
                const message = {
                    to: chunk,
                    sound: 'default',
                    title: title,
                    body: body,
                    data: { someData: 'goes here' },
                };

                const response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message),
                });

                if (response.ok) {
                    successCount += chunk.length;
                } else {
                    console.error('Error sending batch:', await response.text());
                }
            }

            toast({
                title: 'Notificación enviada',
                description: `Notificación enviada a ${successCount} usuarios`,
                variant: 'success'
            });
            setTitle('');
            setBody('');

        } catch (error: any) {
            console.error('Error sending notifications:', error);
            toast({
                title: 'Error',
                description: 'Error al enviar notificaciones: ' + error.message,
                variant: 'error'
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bell className="w-8 h-8 text-[#F76934]" />
                        Enviar Notificaciones Push
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Envía mensajes a todos los usuarios con la app instalada
                    </p>
                </div>
            </div>

            <div className="bg-[#2C2C2C] rounded-xl p-6 max-w-2xl border border-white/5">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Título
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Nueva Cerveza Disponible!"
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F76934]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Mensaje
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Escribe el contenido de la notificación..."
                            rows={4}
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F76934]"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSendNotification}
                            disabled={isSending}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${isSending
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#F76934] to-[#ff8f6b] hover:shadow-lg hover:shadow-[#F76934]/20'
                                }`}
                        >
                            <Send className="w-5 h-5" />
                            {isSending ? 'Enviando...' : 'Enviar Notificación'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-[#2C2C2C] rounded-xl p-6 max-w-2xl border border-white/5">
                <h3 className="text-white font-bold mb-2">Recomendaciones</h3>
                <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm">
                    <li>Usa títulos cortos y llamativos.</li>
                    <li>No envíes demasiadas notificaciones seguidas para evitar molestar.</li>
                    <li>Prueba con un mensaje corto antes de enviar información importante.</li>
                </ul>
            </div>
        </div>
    );
};

export default Notifications;
