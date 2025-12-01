import { supabase } from '../../../lib/supabase';

/**
 * Tipo para el horario tal como viene de Supabase
 */
export interface SupabaseStoreHours {
  id: string;
  store_id: string;
  day_of_week: number; // 0=Domingo, 6=Sábado
  open_time: string; // "09:00:00"
  close_time: string; // "22:00:00"
  is_closed: boolean;
}

/**
 * Tipo para el horario en la aplicación
 */
export interface StoreHours {
  id: string;
  storeId: string;
  dayOfWeek: number; // 0=Domingo, 6=Sábado
  openTime: string; // "09:00"
  closeTime: string; // "22:00"
  isClosed: boolean;
}

/**
 * Convierte un horario de Supabase al tipo StoreHours de la aplicación
 */
function mapSupabaseToStoreHours(supabaseHours: SupabaseStoreHours): StoreHours {
  return {
    id: supabaseHours.id,
    storeId: supabaseHours.store_id,
    dayOfWeek: supabaseHours.day_of_week,
    openTime: supabaseHours.open_time.substring(0, 5), // "09:00:00" -> "09:00"
    closeTime: supabaseHours.close_time.substring(0, 5),
    isClosed: supabaseHours.is_closed,
  };
}

/**
 * Convierte un horario de la aplicación al formato de Supabase
 */
function mapStoreHoursToSupabase(hours: Partial<StoreHours>): Partial<SupabaseStoreHours> {
  return {
    store_id: hours.storeId,
    day_of_week: hours.dayOfWeek,
    open_time: hours.openTime ? `${hours.openTime}:00` : undefined,
    close_time: hours.closeTime ? `${hours.closeTime}:00` : undefined,
    is_closed: hours.isClosed ?? false,
  };
}

/**
 * Obtiene todos los horarios de una tienda
 */
export async function getStoreHours(storeId: string): Promise<StoreHours[]> {
  try {
    const { data, error } = await supabase
      .from('store_hours')
      .select('*')
      .eq('store_id', storeId)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Error fetching store hours:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToStoreHours);
  } catch (error) {
    console.error('Error in getStoreHours:', error);
    throw error;
  }
}

/**
 * Crea o actualiza los horarios de una tienda
 */
export async function upsertStoreHours(
  storeId: string,
  hours: Omit<StoreHours, 'id' | 'storeId'>[]
): Promise<StoreHours[]> {
  try {
    // Primero eliminar todos los horarios existentes
    await supabase
      .from('store_hours')
      .delete()
      .eq('store_id', storeId);

    // Crear nuevos horarios
    const supabaseHours = hours.map(h => ({
      ...mapStoreHoursToSupabase({ ...h, storeId }),
      store_id: storeId,
    }));

    const { data, error } = await supabase
      .from('store_hours')
      .insert(supabaseHours)
      .select();

    if (error) {
      console.error('Error upserting store hours:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToStoreHours);
  } catch (error) {
    console.error('Error in upsertStoreHours:', error);
    throw error;
  }
}

/**
 * Elimina todos los horarios de una tienda
 */
export async function deleteStoreHours(storeId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('store_hours')
      .delete()
      .eq('store_id', storeId);

    if (error) {
      console.error('Error deleting store hours:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteStoreHours:', error);
    throw error;
  }
}

/**
 * Crea un horario individual
 */
export async function createStoreHour(hour: Omit<StoreHours, 'id'>): Promise<StoreHours> {
  try {
    const supabaseHour = mapStoreHoursToSupabase(hour);
    
    const { data, error } = await supabase
      .from('store_hours')
      .insert({
        ...supabaseHour,
        store_id: hour.storeId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating store hour:', error);
      throw error;
    }

    return mapSupabaseToStoreHours(data);
  } catch (error) {
    console.error('Error in createStoreHour:', error);
    throw error;
  }
}

/**
 * Actualiza un horario individual
 */
export async function updateStoreHour(id: string, updates: Partial<StoreHours>): Promise<StoreHours> {
  try {
    const supabaseUpdates = mapStoreHoursToSupabase(updates);

    const { data, error } = await supabase
      .from('store_hours')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating store hour:', error);
      throw error;
    }

    return mapSupabaseToStoreHours(data);
  } catch (error) {
    console.error('Error in updateStoreHour:', error);
    throw error;
  }
}

/**
 * Elimina un horario individual
 */
export async function deleteStoreHour(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('store_hours')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting store hour:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteStoreHour:', error);
    throw error;
  }
}

/**
 * Obtiene el horario de un día específico
 */
export async function getStoreHourByDay(
  storeId: string,
  dayOfWeek: number
): Promise<StoreHours | null> {
  try {
    const { data, error } = await supabase
      .from('store_hours')
      .select('*')
      .eq('store_id', storeId)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching store hour by day:', error);
      throw error;
    }

    return data ? mapSupabaseToStoreHours(data) : null;
  } catch (error) {
    console.error('Error in getStoreHourByDay:', error);
    throw error;
  }
}

/**
 * Verifica si una tienda está abierta en un momento dado
 */
export async function isStoreOpen(storeId: string, dateTime?: Date): Promise<boolean> {
  try {
    const checkDate = dateTime || new Date();
    const dayOfWeek = checkDate.getDay(); // 0=Domingo, 6=Sábado
    const currentTime = `${checkDate.getHours().toString().padStart(2, '0')}:${checkDate.getMinutes().toString().padStart(2, '0')}`;

    const hour = await getStoreHourByDay(storeId, dayOfWeek);
    
    if (!hour || hour.isClosed) {
      return false;
    }

    return currentTime >= hour.openTime && currentTime <= hour.closeTime;
  } catch (error) {
    console.error('Error in isStoreOpen:', error);
    return false;
  }
}

