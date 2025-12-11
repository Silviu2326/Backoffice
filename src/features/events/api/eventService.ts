import { supabase } from '../../../lib/supabase';
import { Event } from '../../../types/core';

/**
 * Tipo para el evento tal como viene de Supabase
 */
export interface SupabaseEvent {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  hero_image?: string;
  category?: string;
  tags?: string[];
  status: string;
  start_date: string;
  end_date: string;
  location_name?: string;
  location?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  max_attendees?: number;
  registered_attendees?: number;
  sold_tickets?: number;
  price?: number;
  currency?: string;
  is_free?: boolean;
  is_premium?: boolean;
  is_recurring?: boolean;
  recurring?: boolean;
  points_reward?: number;
  distance_km?: number;
  age_restriction?: string;
  created_at: string;
}

/**
 * Convierte un evento de Supabase al tipo Event de la aplicación
 */
function mapSupabaseToEvent(supabaseEvent: SupabaseEvent): Event {
  return {
    id: supabaseEvent.id,
    title: supabaseEvent.title,
    description: supabaseEvent.description,
    coverImageUrl: supabaseEvent.cover_image_url,
    heroImage: supabaseEvent.hero_image,
    category: supabaseEvent.category,
    tags: Array.isArray(supabaseEvent.tags) ? supabaseEvent.tags : [],
    status: supabaseEvent.status as 'published' | 'draft' | 'cancelled',
    startDate: supabaseEvent.start_date,
    endDate: supabaseEvent.end_date,
    locationName: supabaseEvent.location_name,
    location: supabaseEvent.location,
    city: supabaseEvent.city,
    address: supabaseEvent.address,
    latitude: supabaseEvent.latitude,
    longitude: supabaseEvent.longitude,
    capacity: supabaseEvent.capacity,
    maxAttendees: supabaseEvent.max_attendees,
    registeredAttendees: supabaseEvent.registered_attendees,
    soldTickets: supabaseEvent.sold_tickets,
    price: supabaseEvent.price,
    currency: supabaseEvent.currency,
    isFree: supabaseEvent.is_free,
    isPremium: supabaseEvent.is_premium,
    isRecurring: supabaseEvent.is_recurring,
    recurring: supabaseEvent.recurring,
    pointsReward: supabaseEvent.points_reward,
    distanceKm: supabaseEvent.distance_km,
    ageRestriction: supabaseEvent.age_restriction,
    createdAt: supabaseEvent.created_at,
  };
}

/**
 * Convierte un evento de la aplicación al formato de Supabase
 */
function mapEventToSupabase(event: Partial<Event>): Partial<SupabaseEvent> {
  const supabaseEvent: Partial<SupabaseEvent> = {};

  if (event.title !== undefined) supabaseEvent.title = event.title;
  if (event.description !== undefined) supabaseEvent.description = event.description;
  if (event.coverImageUrl !== undefined) supabaseEvent.cover_image_url = event.coverImageUrl;
  if (event.heroImage !== undefined) supabaseEvent.hero_image = event.heroImage;
  if (event.category !== undefined) supabaseEvent.category = event.category;
  if (event.tags !== undefined) supabaseEvent.tags = event.tags;
  if (event.status !== undefined) supabaseEvent.status = event.status;
  if (event.startDate !== undefined) supabaseEvent.start_date = event.startDate;
  if (event.endDate !== undefined) supabaseEvent.end_date = event.endDate;
  if (event.locationName !== undefined) supabaseEvent.location_name = event.locationName;
  if (event.location !== undefined) supabaseEvent.location = event.location;
  if (event.city !== undefined) supabaseEvent.city = event.city;
  if (event.address !== undefined) supabaseEvent.address = event.address;
  if (event.latitude !== undefined) supabaseEvent.latitude = event.latitude;
  if (event.longitude !== undefined) supabaseEvent.longitude = event.longitude;
  if (event.capacity !== undefined) supabaseEvent.capacity = event.capacity;
  if (event.maxAttendees !== undefined) supabaseEvent.max_attendees = event.maxAttendees;
  if (event.registeredAttendees !== undefined) supabaseEvent.registered_attendees = event.registeredAttendees;
  if (event.soldTickets !== undefined) supabaseEvent.sold_tickets = event.soldTickets;
  if (event.price !== undefined) supabaseEvent.price = event.price;
  if (event.currency !== undefined) supabaseEvent.currency = event.currency;
  if (event.isFree !== undefined) supabaseEvent.is_free = event.isFree;
  if (event.isPremium !== undefined) supabaseEvent.is_premium = event.isPremium;
  if (event.isRecurring !== undefined) supabaseEvent.is_recurring = event.isRecurring;
  if (event.recurring !== undefined) supabaseEvent.recurring = event.recurring;
  if (event.pointsReward !== undefined) supabaseEvent.points_reward = event.pointsReward;
  if (event.distanceKm !== undefined) supabaseEvent.distance_km = event.distanceKm;
  if (event.ageRestriction !== undefined) supabaseEvent.age_restriction = event.ageRestriction;

  return supabaseEvent;
}

/**
 * Obtiene todos los eventos
 */
export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToEvent);
}

/**
 * Obtiene un evento por ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching event:', error);
    throw error;
  }

  return data ? mapSupabaseToEvent(data) : null;
}

/**
 * Obtiene eventos por rango de fechas
 */
export async function getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_date', startDate)
    .lte('end_date', endDate)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events by date range:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToEvent);
}

/**
 * Obtiene eventos por categoría
 */
export async function getEventsByCategory(category: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('category', category)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events by category:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToEvent);
}

/**
 * Obtiene eventos por estado
 */
export async function getEventsByStatus(status: 'published' | 'draft' | 'cancelled'): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', status)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events by status:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToEvent);
}

/**
 * Crea un nuevo evento
 */
export async function createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
  const supabaseEvent = mapEventToSupabase(event);

  const { data, error } = await supabase
    .from('events')
    .insert(supabaseEvent)
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return mapSupabaseToEvent(data);
}

/**
 * Actualiza un evento existente
 */
export async function updateEvent(id: string, event: Partial<Event>): Promise<Event> {
  const supabaseEvent = mapEventToSupabase(event);

  const { data, error } = await supabase
    .from('events')
    .update(supabaseEvent)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return mapSupabaseToEvent(data);
}

/**
 * Elimina un evento
 */
export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}
















