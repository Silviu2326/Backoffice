import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, Trash2, Plus } from 'lucide-react';

interface Tab {
    id: string;
    key: string;
    icon: string;
    label_es: string;
    label_en: string;
    display_order: number;
    active: boolean;
}

export default function TabManager() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTab, setEditingTab] = useState<Tab | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchTabs();
    }, []);

    const fetchTabs = async () => {
        const { data, error } = await supabase
            .from('app_tabs')
            .select('*')
            .order('display_order', { ascending: true });

        if (!error && data) {
            setTabs(data);
        }
        setLoading(false);
    };

    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;

        const items = Array.from(tabs);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update display_order
        const updatedTabs = items.map((tab, index) => ({
            ...tab,
            display_order: index + 1,
        }));

        setTabs(updatedTabs);

        // Save to database
        for (const tab of updatedTabs) {
            await supabase
                .from('app_tabs')
                .update({ display_order: tab.display_order })
                .eq('id', tab.id);
        }
    };

    const toggleActive = async (tab: Tab) => {
        const { error } = await supabase
            .from('app_tabs')
            .update({ active: !tab.active })
            .eq('id', tab.id);

        if (!error) {
            setTabs(tabs.map(t => t.id === tab.id ? { ...t, active: !t.active } : t));
        }
    };

    const deleteTab = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta tab?')) return;

        const { error } = await supabase
            .from('app_tabs')
            .delete()
            .eq('id', id);

        if (!error) {
            setTabs(tabs.filter(t => t.id !== id));
        }
    };

    const saveTab = async (tab: Partial<Tab>) => {
        if (editingTab) {
            // Update
            const { error } = await supabase
                .from('app_tabs')
                .update(tab)
                .eq('id', editingTab.id);

            if (!error) {
                setTabs(tabs.map(t => t.id === editingTab.id ? { ...t, ...tab } : t));
                setEditingTab(null);
            }
        } else {
            // Insert
            const { data, error } = await supabase
                .from('app_tabs')
                .insert([{ ...tab, display_order: tabs.length + 1 }])
                .select();

            if (!error && data) {
                setTabs([...tabs, data[0]]);
                setShowAddModal(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8 bg-brand-dark min-h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-brand-orange rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-dark p-6 font-body">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-text-primary tracking-tight">
                            Gestión de Tabs
                        </h1>
                        <p className="text-text-secondary mt-1">
                            Configura el orden y visibilidad de la navegación en la app móvil.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-brand-orange text-white px-6 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-brand-orange/20 font-medium"
                    >
                        <Plus size={20} />
                        Nueva Tab
                    </button>
                </div>

                <div className="bg-brand-surface rounded-2xl shadow-xl border border-white/5 overflow-hidden">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="tabs">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-white/5">
                                    {tabs.map((tab, index) => (
                                        <Draggable key={tab.id} draggableId={tab.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`flex items-center gap-4 p-5 transition-colors ${snapshot.isDragging ? 'bg-white/5 backdrop-blur-md' : 'hover:bg-white/5'
                                                        }`}
                                                >
                                                    <div {...provided.dragHandleProps} className="cursor-grab p-2 hover:bg-white/10 rounded-lg transition-colors">
                                                        <GripVertical className="text-text-muted" size={20} />
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-4 gap-6">
                                                        <div>
                                                            <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">Key</div>
                                                            <div className="text-text-primary font-medium">{tab.key}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">Icono</div>
                                                            <div className="flex items-center gap-2 text-text-primary">
                                                                <span className="p-1.5 bg-white/5 rounded-md text-text-secondary text-xs font-mono">{tab.icon}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">Label (ES)</div>
                                                            <div className="text-text-primary">{tab.label_es}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">Label (EN)</div>
                                                            <div className="text-text-primary">{tab.label_en}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => toggleActive(tab)}
                                                            className={`p-2.5 rounded-xl transition-all ${tab.active
                                                                    ? 'bg-status-success/10 text-status-success hover:bg-status-success/20'
                                                                    : 'bg-white/5 text-text-muted hover:bg-white/10'
                                                                }`}
                                                            title={tab.active ? 'Desactivar' : 'Activar'}
                                                        >
                                                            {tab.active ? <Eye size={20} /> : <EyeOff size={20} />}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingTab(tab)}
                                                            className="px-4 py-2 text-text-primary bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-sm font-medium"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => deleteTab(tab.id)}
                                                            className="p-2.5 text-status-error bg-status-error/10 hover:bg-status-error/20 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            {/* Modal de edición */}
            {(editingTab || showAddModal) && (
                <TabModal
                    tab={editingTab}
                    onSave={saveTab}
                    onClose={() => {
                        setEditingTab(null);
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
}

interface TabModalProps {
    tab: Tab | null;
    onSave: (tab: Partial<Tab>) => void;
    onClose: () => void;
}

function TabModal({ tab, onSave, onClose }: TabModalProps) {
    const [formData, setFormData] = useState({
        key: tab?.key || '',
        icon: tab?.icon || '',
        label_es: tab?.label_es || '',
        label_en: tab?.label_en || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-surface rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-3xl font-display font-bold text-text-primary mb-6">
                    {tab ? 'Editar Tab' : 'Nueva Tab'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Key (identificador único)
                        </label>
                        <input
                            type="text"
                            value={formData.key}
                            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-text-muted"
                            placeholder="EJ: INICIO"
                            required
                            disabled={!!tab}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Icono (Ionicons)
                        </label>
                        <input
                            type="text"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all placeholder:text-text-muted"
                            placeholder="home, calendar, wine..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Etiqueta (ES)
                            </label>
                            <input
                                type="text"
                                value={formData.label_es}
                                onChange={(e) => setFormData({ ...formData, label_es: e.target.value })}
                                className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Etiqueta (EN)
                            </label>
                            <input
                                type="text"
                                value={formData.label_en}
                                onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                                className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-text-primary hover:bg-white/5 transition-all font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-brand-orange text-white rounded-xl hover:brightness-110 transition-all font-bold shadow-lg shadow-brand-orange/20"
                        >
                            {tab ? 'Actualizar' : 'Crear Tab'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
