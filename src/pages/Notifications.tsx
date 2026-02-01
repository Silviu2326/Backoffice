import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Notifications: React.FC = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `push-images/${fileName}`;

            // Asegúrate de crear el bucket 'notifications' en Supabase Storage (público)
            const { error: uploadError } = await supabase.storage
                .from('notifications')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('notifications')
                .getPublicUrl(filePath);

            setImageUrl(data.publicUrl);
            toast({
                title: 'Imagen subida',
                description: 'La imagen se ha cargado correctamente',
                variant: 'success'
            });

        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast({
                title: 'Error subiendo imagen',
                description: 'Asegúrate de que el bucket "notifications" existe y es público. ' + error.message,
                variant: 'error'
            });
        } finally {
            setIsUploading(false);
        }
    };

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
                // Crear array de mensajes para el batch
                const messages = chunk.map((token: string) => {
                    const message: any = {
                        to: token,
                        sound: 'default',
                        title: title,
                        body: body,
                        priority: 'high',
                        channelId: 'default',
                    };

                    if (imageUrl.trim()) {
                        const cleanImageUrl = imageUrl.trim();

                        // CRÍTICO: Incluir imagen en el campo data
                        // Expo procesa las imágenes desde el campo data
                        message.data = {
                            image: cleanImageUrl,
                        };

                        // Para Android - usar el campo correcto según Expo
                        message.android = {
                            channelId: 'default',
                            priority: 'high',
                            sound: 'default',
                            // FORMATO CORRECTO: usar "image" en lugar de "imageUrl"
                            image: cleanImageUrl,
                        };

                        // Para iOS - requiere Notification Service Extension
                        message.ios = {
                            sound: 'default',
                            _displayInForeground: true,
                            attachments: [{
                                url: cleanImageUrl,
                            }],
                        };
                    } else {
                        message.data = {};
                    }

                    return message;
                });

                // El payload es el array de mensajes
                const payload = messages;

                // Usamos el backend configurado en Railway
                const BACKEND_URL = 'https://mrcoolcatbackend-production.up.railway.app/api/send-push-notification';

                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
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
            setImageUrl('');

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

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Imagen de la notificación
                        </label>

                        <div className="flex items-start gap-4">
                            {imageUrl && (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => setImageUrl('')}
                                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hover:bg-red-500/80 transition-colors"
                                    >
                                        <div className="w-4 h-4 text-white flex items-center justify-center font-bold">×</div>
                                    </button>
                                </div>
                            )}

                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-300 hover:text-white hover:border-[#F76934] transition-all"
                                    >
                                        {isUploading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#F76934] border-t-transparent"></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                        )}
                                        {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Se recomienda una imagen horizontal (ej. 2:1). Se subirá al bucket "notifications".
                                </p>
                            </div>
                        </div>
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
