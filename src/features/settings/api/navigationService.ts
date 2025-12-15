import { supabase } from '../../../lib/supabase';

/**
 * Configuración de tab/pestaña de navegación
 */
export interface NavigationTab {
  id: string;
  key: string; // 'INICIO', 'EVENTOS', 'CERVEZAS', etc.
  label_es: string; // Nombre en español
  label_en: string; // Nombre en inglés
  icon: string; // Nombre del icono de Ionicons
  order: number; // Orden de aparición
  is_active: boolean; // Si está activo/visible
  is_system: boolean; // Si es una pestaña del sistema (no se puede eliminar)
  created_at?: string;
  updated_at?: string;
}

/**
 * Tipo para crear/actualizar tabs
 */
export type NavigationTabInput = Omit<NavigationTab, 'id' | 'created_at' | 'updated_at'>;

/**
 * Obtiene todas las pestañas de navegación
 */
export async function getAllNavigationTabs(): Promise<NavigationTab[]> {
  const { data, error } = await supabase
    .from('navigation_tabs')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching navigation tabs:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtiene solo las pestañas activas
 */
export async function getActiveNavigationTabs(): Promise<NavigationTab[]> {
  const { data, error } = await supabase
    .from('navigation_tabs')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching active navigation tabs:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtiene una pestaña por ID
 */
export async function getNavigationTabById(id: string): Promise<NavigationTab | null> {
  const { data, error } = await supabase
    .from('navigation_tabs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching navigation tab:', error);
    throw error;
  }

  return data;
}

/**
 * Crea una nueva pestaña de navegación
 */
export async function createNavigationTab(tab: NavigationTabInput): Promise<NavigationTab> {
  const { data, error } = await supabase
    .from('navigation_tabs')
    .insert(tab)
    .select()
    .single();

  if (error) {
    console.error('Error creating navigation tab:', error);
    throw error;
  }

  return data;
}

/**
 * Actualiza una pestaña de navegación
 */
export async function updateNavigationTab(
  id: string,
  tab: Partial<NavigationTabInput>
): Promise<NavigationTab> {
  const { data, error } = await supabase
    .from('navigation_tabs')
    .update({ ...tab, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating navigation tab:', error);
    throw error;
  }

  return data;
}

/**
 * Elimina una pestaña de navegación (solo si no es del sistema)
 */
export async function deleteNavigationTab(id: string): Promise<void> {
  // Verificar que no sea una pestaña del sistema
  const tab = await getNavigationTabById(id);
  if (tab?.is_system) {
    throw new Error('No se pueden eliminar pestañas del sistema');
  }

  const { error } = await supabase
    .from('navigation_tabs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting navigation tab:', error);
    throw error;
  }
}

/**
 * Actualiza el orden de las pestañas
 */
export async function reorderNavigationTabs(
  tabOrders: { id: string; order: number }[]
): Promise<void> {
  const updates = tabOrders.map(({ id, order }) =>
    supabase
      .from('navigation_tabs')
      .update({ order, updated_at: new Date().toISOString() })
      .eq('id', id)
  );

  const results = await Promise.all(updates);

  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.error('Error reordering navigation tabs:', errors);
    throw new Error('Error al reordenar pestañas');
  }
}

/**
 * Inicializa las pestañas por defecto (solo debe ejecutarse una vez)
 */
export async function initializeDefaultTabs(): Promise<void> {
  const defaultTabs: NavigationTabInput[] = [
    {
      key: 'INICIO',
      label_es: 'Inicio',
      label_en: 'Home',
      icon: 'home',
      order: 1,
      is_active: true,
      is_system: true
    },
    {
      key: 'EVENTOS',
      label_es: 'Eventos',
      label_en: 'Events',
      icon: 'calendar',
      order: 2,
      is_active: true,
      is_system: false
    },
    {
      key: 'CERVEZAS',
      label_es: 'Cervezas',
      label_en: 'Beers',
      icon: 'wine',
      order: 3,
      is_active: true,
      is_system: false
    },
    {
      key: 'PERSONAJES',
      label_es: 'Personajes',
      label_en: 'Characters',
      icon: 'people',
      order: 4,
      is_active: true,
      is_system: false
    },
    {
      key: 'BARES',
      label_es: 'Bares',
      label_en: 'Bars',
      icon: 'storefront',
      order: 5,
      is_active: true,
      is_system: false
    },
    {
      key: 'EL GATO COOL PUB',
      label_es: 'El Gato Cool Pub',
      label_en: 'El Gato Cool Pub',
      icon: 'map',
      order: 6,
      is_active: true,
      is_system: false
    },
    {
      key: 'LOGROS',
      label_es: 'Logros y Recompensas',
      label_en: 'Achievements & Rewards',
      icon: 'trophy',
      order: 7,
      is_active: true,
      is_system: false
    },
    {
      key: 'BEER RUN',
      label_es: 'Beer Run',
      label_en: 'Beer Run',
      icon: 'bicycle',
      order: 8,
      is_active: true,
      is_system: false
    },
    {
      key: 'CHAT IA',
      label_es: 'Chat IA',
      label_en: 'AI Chat',
      icon: 'chatbubbles',
      order: 9,
      is_active: true,
      is_system: false
    },
    {
      key: 'CONTACTO',
      label_es: 'Contacto',
      label_en: 'Contact',
      icon: 'mail',
      order: 10,
      is_active: true,
      is_system: false
    }
  ];

  const { error } = await supabase
    .from('navigation_tabs')
    .insert(defaultTabs);

  if (error) {
    console.error('Error initializing default tabs:', error);
    throw error;
  }
}
