import { supabase } from '../../../lib/supabase';
import { Service } from './serviceService';

/**
 * Tipo para la relación store-services tal como viene de Supabase
 */
export interface SupabaseStoreService {
  id: string;
  store_id: string;
  service_id: string;
}

/**
 * Tipo para la relación store-services en la aplicación
 */
export interface StoreService {
  id: string;
  storeId: string;
  serviceId: string;
}

/**
 * Obtiene todos los servicios de una tienda (solo IDs)
 */
export async function getStoreServices(storeId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('store_services')
      .select('service_id')
      .eq('store_id', storeId);

    if (error) {
      console.error('Error fetching store services:', error);
      throw error;
    }

    return (data || []).map(row => row.service_id);
  } catch (error) {
    console.error('Error in getStoreServices:', error);
    throw error;
  }
}

/**
 * Obtiene todos los servicios de una tienda con información completa
 */
export async function getStoreServicesWithDetails(storeId: string): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('store_services')
      .select(`
        service_id,
        services (
          id,
          name,
          description,
          icon
        )
      `)
      .eq('store_id', storeId);

    if (error) {
      console.error('Error fetching store services with details:', error);
      throw error;
    }

    return (data || [])
      .map(row => row.services)
      .filter(Boolean) as Service[];
  } catch (error) {
    console.error('Error in getStoreServicesWithDetails:', error);
    throw error;
  }
}

/**
 * Actualiza los servicios de una tienda
 */
export async function updateStoreServices(
  storeId: string,
  serviceIds: string[]
): Promise<void> {
  try {
    // Primero eliminar todos los servicios existentes
    await supabase
      .from('store_services')
      .delete()
      .eq('store_id', storeId);

    // Crear nuevas relaciones
    if (serviceIds.length > 0) {
      const storeServices = serviceIds.map(serviceId => ({
        store_id: storeId,
        service_id: serviceId,
      }));

      const { error } = await supabase
        .from('store_services')
        .insert(storeServices);

      if (error) {
        console.error('Error updating store services:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in updateStoreServices:', error);
    throw error;
  }
}

/**
 * Agrega un servicio a una tienda
 */
export async function addServiceToStore(storeId: string, serviceId: string): Promise<void> {
  try {
    // Verificar si ya existe la relación
    const { data: existing } = await supabase
      .from('store_services')
      .select('id')
      .eq('store_id', storeId)
      .eq('service_id', serviceId)
      .single();

    if (existing) {
      // Ya existe, no hacer nada
      return;
    }

    const { error } = await supabase
      .from('store_services')
      .insert({
        store_id: storeId,
        service_id: serviceId,
      });

    if (error) {
      console.error('Error adding service to store:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in addServiceToStore:', error);
    throw error;
  }
}

/**
 * Elimina un servicio de una tienda
 */
export async function removeServiceFromStore(storeId: string, serviceId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('store_services')
      .delete()
      .eq('store_id', storeId)
      .eq('service_id', serviceId);

    if (error) {
      console.error('Error removing service from store:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeServiceFromStore:', error);
    throw error;
  }
}

/**
 * Verifica si una tienda tiene un servicio específico
 */
export async function storeHasService(storeId: string, serviceId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('store_services')
      .select('id')
      .eq('store_id', storeId)
      .eq('service_id', serviceId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking store service:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in storeHasService:', error);
    throw error;
  }
}

