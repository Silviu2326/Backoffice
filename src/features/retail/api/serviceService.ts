import { supabase } from '../../../lib/supabase';

/**
 * Tipo para el servicio tal como viene de Supabase
 */
export interface SupabaseService {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

/**
 * Tipo para el servicio en la aplicación
 */
export interface Service {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

/**
 * Convierte un servicio de Supabase al tipo Service de la aplicación
 */
function mapSupabaseToService(supabaseService: SupabaseService): Service {
  return {
    id: supabaseService.id,
    name: supabaseService.name,
    description: supabaseService.description,
    icon: supabaseService.icon,
  };
}

/**
 * Convierte un servicio de la aplicación al formato de Supabase
 */
function mapServiceToSupabase(service: Partial<Service>): Partial<SupabaseService> {
  return {
    name: service.name,
    description: service.description,
    icon: service.icon,
  };
}

/**
 * Obtiene todos los servicios disponibles
 */
export async function getServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToService);
  } catch (error) {
    console.error('Error in getServices:', error);
    throw error;
  }
}

/**
 * Obtiene un servicio por ID
 */
export async function getServiceById(id: string): Promise<Service | null> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching service:', error);
      throw error;
    }

    return data ? mapSupabaseToService(data) : null;
  } catch (error) {
    console.error('Error in getServiceById:', error);
    throw error;
  }
}

/**
 * Crea un nuevo servicio
 */
export async function createService(service: Omit<Service, 'id'>): Promise<Service> {
  try {
    const supabaseService = mapServiceToSupabase(service);

    const { data, error } = await supabase
      .from('services')
      .insert(supabaseService)
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      throw error;
    }

    return mapSupabaseToService(data);
  } catch (error) {
    console.error('Error in createService:', error);
    throw error;
  }
}

/**
 * Actualiza un servicio existente
 */
export async function updateService(id: string, updates: Partial<Service>): Promise<Service> {
  try {
    const supabaseUpdates = mapServiceToSupabase(updates);

    const { data, error } = await supabase
      .from('services')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      throw error;
    }

    return mapSupabaseToService(data);
  } catch (error) {
    console.error('Error in updateService:', error);
    throw error;
  }
}

/**
 * Elimina un servicio
 */
export async function deleteService(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteService:', error);
    throw error;
  }
}




















