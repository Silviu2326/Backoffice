import { supabase } from '../../../lib/supabase';

/**
 * Tipo para la tienda tal como viene de Supabase
 */
export interface SupabaseStore {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  distance_km?: number;
  rating?: number;
  reviews_count?: number;
  specialties?: string[];
  allow_pickup: boolean;
  pickup_instructions?: string;
  is_active: boolean;
  created_at: string;
  logo_url?: string;
  google_maps_url?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  district?: string;
  postal_code?: string;
  country?: string;
  province?: string;
}

/**
 * Tipo para la tienda en la aplicación
 */
export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  distanceKm?: number;
  rating?: number;
  reviewsCount?: number;
  specialties?: string[];
  allowPickup: boolean;
  pickupInstructions?: string;
  isActive: boolean;
  createdAt: string;
  category?: string;
  // Campos adicionales para el backoffice
  coordinates?: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  email?: string;
  logoUrl?: string;
  googleMapsUrl?: string;
  // Geolocalización
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  province?: string;
}

/**
 * Convierte una tienda de Supabase al tipo Store de la aplicación
 */
function mapSupabaseToStore(supabaseStore: SupabaseStore): Store {
  return {
    id: supabaseStore.id,
    name: supabaseStore.name,
    address: supabaseStore.address,
    city: supabaseStore.city,
    phone: supabaseStore.phone,
    distanceKm: supabaseStore.distance_km,
    rating: supabaseStore.rating,
    reviewsCount: supabaseStore.reviews_count,
    specialties: supabaseStore.specialties,
    allowPickup: supabaseStore.allow_pickup,
    pickupInstructions: supabaseStore.pickup_instructions,
    isActive: supabaseStore.is_active,
    createdAt: supabaseStore.created_at,
    logoUrl: supabaseStore.logo_url,
    googleMapsUrl: supabaseStore.google_maps_url,
    category: supabaseStore.category,
    latitude: supabaseStore.latitude,
    longitude: supabaseStore.longitude,
    neighborhood: supabaseStore.neighborhood,
    district: supabaseStore.district,
    postalCode: supabaseStore.postal_code,
    country: supabaseStore.country,
    province: supabaseStore.province,
  };
}

/**
 * Convierte una tienda de la aplicación al formato de Supabase
 */
function mapStoreToSupabase(store: Partial<Store>): Partial<SupabaseStore> {
  return {
    name: store.name,
    address: store.address,
    city: store.city,
    phone: store.phone,
    distance_km: store.distanceKm,
    rating: store.rating,
    reviews_count: store.reviewsCount,
    specialties: store.specialties,
    allow_pickup: store.allowPickup ?? true,
    pickup_instructions: store.pickupInstructions,
    is_active: store.isActive ?? true,
    logo_url: store.logoUrl,
    google_maps_url: store.googleMapsUrl,
    category: store.category,
    latitude: store.latitude,
    longitude: store.longitude,
    neighborhood: store.neighborhood,
    district: store.district,
    postal_code: store.postalCode,
    country: store.country,
    province: store.province,
  };
}

/**
 * Obtiene todas las tiendas
 */
export async function getStores(filters?: {
  isActive?: boolean;
  city?: string;
  search?: string;
}): Promise<Store[]> {
  try {
    let query = supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToStore);
  } catch (error) {
    console.error('Error in getStores:', error);
    throw error;
  }
}

/**
 * Obtiene una tienda por ID
 */
export async function getStoreById(id: string): Promise<Store | null> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching store:', error);
      throw error;
    }

    return data ? mapSupabaseToStore(data) : null;
  } catch (error) {
    console.error('Error in getStoreById:', error);
    throw error;
  }
}

/**
 * Crea una nueva tienda
 */
export async function createStore(store: Omit<Store, 'id' | 'createdAt'>): Promise<Store> {
  try {
    const supabaseStore = mapStoreToSupabase(store);

    const { data, error } = await supabase
      .from('stores')
      .insert(supabaseStore)
      .select()
      .single();

    if (error) {
      console.error('Error creating store:', error);
      throw error;
    }

    return mapSupabaseToStore(data);
  } catch (error) {
    console.error('Error in createStore:', error);
    throw error;
  }
}

/**
 * Actualiza una tienda existente
 */
export async function updateStore(id: string, updates: Partial<Store>): Promise<Store> {
  try {
    const supabaseUpdates = mapStoreToSupabase(updates);

    const { data, error } = await supabase
      .from('stores')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating store:', error);
      throw error;
    }

    return mapSupabaseToStore(data);
  } catch (error) {
    console.error('Error in updateStore:', error);
    throw error;
  }
}

/**
 * Elimina una tienda
 */
export async function deleteStore(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting store:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteStore:', error);
    throw error;
  }
}








































