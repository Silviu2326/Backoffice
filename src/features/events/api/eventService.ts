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
  recurrence_group_id?: string;
  recurrence_frequency?: string;
  recurrence_count?: number;
  recurrence_index?: number;
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
    recurrenceGroupId: supabaseEvent.recurrence_group_id,
    recurrenceFrequency: supabaseEvent.recurrence_frequency as 'none' | 'daily' | 'weekly' | undefined,
    recurrenceCount: supabaseEvent.recurrence_count,
    recurrenceIndex: supabaseEvent.recurrence_index,
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
  if (event.recurrenceGroupId !== undefined) supabaseEvent.recurrence_group_id = event.recurrenceGroupId;
  if (event.recurrenceFrequency !== undefined) supabaseEvent.recurrence_frequency = event.recurrenceFrequency;
  if (event.recurrenceCount !== undefined) supabaseEvent.recurrence_count = event.recurrenceCount;
  if (event.recurrenceIndex !== undefined) supabaseEvent.recurrence_index = event.recurrenceIndex;

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

/**
 * Obtiene todos los eventos de un grupo de recurrencia
 */
export async function getEventsByRecurrenceGroup(groupId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('recurrence_group_id', groupId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events by recurrence group:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToEvent);
}

/**
 * Actualiza todos los eventos de un grupo de recurrencia
 * @param groupId ID del grupo de recurrencia
 * @param updates Campos a actualizar
 * @param preserveDates Si es true, no actualiza las fechas de inicio/fin
 */
export async function updateEventGroup(
  groupId: string,
  updates: Partial<Event>,
  preserveDates: boolean = true
): Promise<Event[]> {
  const safeUpdates = { ...updates };
  if (preserveDates) {
    delete safeUpdates.startDate;
    delete safeUpdates.endDate;
  }

  const supabaseUpdates = mapEventToSupabase(safeUpdates);

  const { data, error } = await supabase
    .from('events')
    .update(supabaseUpdates)
    .eq('recurrence_group_id', groupId)
    .select();

  if (error) {
    console.error('Error updating event group:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToEvent);
}

/**
 * Elimina todos los eventos de un grupo de recurrencia
 */
export async function deleteEventGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('recurrence_group_id', groupId);

  if (error) {
    console.error('Error deleting event group:', error);
    throw error;
  }
}

/**
 * Desvincula un evento de su grupo de recurrencia
 */
export async function detachFromRecurrenceGroup(eventId: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update({
      recurrence_group_id: null,
      recurrence_frequency: null,
      recurrence_count: null,
      recurrence_index: null,
    })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error detaching event from group:', error);
    throw error;
  }

  return mapSupabaseToEvent(data);
}

/**
 * Crea múltiples eventos recurrentes con un grupo compartido
 */
export async function createRecurringEvents(
  baseEvent: Omit<Event, 'id' | 'createdAt'>,
  frequency: 'daily' | 'weekly',
  count: number
): Promise<Event[]> {
  const groupId = crypto.randomUUID();
  const eventsToCreate: Partial<SupabaseEvent>[] = [];
  const baseDate = new Date(baseEvent.startDate);
  const baseDuration = new Date(baseEvent.endDate).getTime() - baseDate.getTime();

  for (let i = 0; i < count; i++) {
    const startDate = new Date(baseDate);
    if (frequency === 'weekly') {
      startDate.setDate(startDate.getDate() + (i * 7));
    } else {
      startDate.setDate(startDate.getDate() + i);
    }
    const endDate = new Date(startDate.getTime() + baseDuration);

    const supabaseEvent = mapEventToSupabase(baseEvent);
    eventsToCreate.push({
      ...supabaseEvent,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      recurrence_group_id: groupId,
      recurrence_frequency: frequency,
      recurrence_count: count,
      recurrence_index: i,
    });
  }

  const { data, error } = await supabase
    .from('events')
    .insert(eventsToCreate)
    .select();

  if (error) {
    console.error('Error creating recurring events:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToEvent);
}

/**
 * Extiende una serie recurrente agregando más eventos
 */
export async function extendRecurringSeries(
  groupId: string,
  additionalCount: number
): Promise<Event[]> {
  // Get existing events to determine the pattern
  const existingEvents = await getEventsByRecurrenceGroup(groupId);
  if (existingEvents.length === 0) {
    throw new Error('No events found in group');
  }

  // Sort by date and get the last event
  const sortedEvents = existingEvents.sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  const lastEvent = sortedEvents[sortedEvents.length - 1];
  const firstEvent = sortedEvents[0];

  const frequency = lastEvent.recurrenceFrequency || 'weekly';
  const currentCount = lastEvent.recurrenceCount || existingEvents.length;
  const newTotalCount = currentCount + additionalCount;

  // Calculate duration from first event
  const baseDuration = new Date(firstEvent.endDate).getTime() - new Date(firstEvent.startDate).getTime();

  // Create new events
  const eventsToCreate: Partial<SupabaseEvent>[] = [];
  const lastDate = new Date(lastEvent.startDate);

  for (let i = 1; i <= additionalCount; i++) {
    const startDate = new Date(lastDate);
    if (frequency === 'weekly') {
      startDate.setDate(startDate.getDate() + (i * 7));
    } else {
      startDate.setDate(startDate.getDate() + i);
    }
    const endDate = new Date(startDate.getTime() + baseDuration);

    const supabaseEvent = mapEventToSupabase(firstEvent);
    delete (supabaseEvent as any).id;
    delete (supabaseEvent as any).created_at;

    eventsToCreate.push({
      ...supabaseEvent,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      recurrence_group_id: groupId,
      recurrence_frequency: frequency,
      recurrence_count: newTotalCount,
      recurrence_index: currentCount + i - 1,
    });
  }

  // Insert new events
  const { data: newEvents, error: insertError } = await supabase
    .from('events')
    .insert(eventsToCreate)
    .select();

  if (insertError) {
    console.error('Error extending series:', insertError);
    throw insertError;
  }

  // Update existing events with new count
  await supabase
    .from('events')
    .update({ recurrence_count: newTotalCount })
    .eq('recurrence_group_id', groupId);

  return (newEvents || []).map(mapSupabaseToEvent);
}

/**
 * Elimina eventos de una serie desde una fecha específica
 */
export async function deleteEventsFromDate(
  groupId: string,
  fromDate: string
): Promise<number> {
  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('recurrence_group_id', groupId)
    .gte('start_date', fromDate)
    .select();

  if (error) {
    console.error('Error deleting events from date:', error);
    throw error;
  }

  const deletedCount = data?.length || 0;

  // Update remaining events count
  const remainingEvents = await getEventsByRecurrenceGroup(groupId);
  if (remainingEvents.length > 0) {
    await supabase
      .from('events')
      .update({ recurrence_count: remainingEvents.length })
      .eq('recurrence_group_id', groupId);

    // Re-index remaining events
    for (let i = 0; i < remainingEvents.length; i++) {
      await supabase
        .from('events')
        .update({ recurrence_index: i })
        .eq('id', remainingEvents[i].id);
    }
  }

  return deletedCount;
}

/**
 * Regenera una serie con nueva frecuencia
 */
export async function regenerateRecurringSeries(
  groupId: string,
  newFrequency: 'daily' | 'weekly',
  newCount: number,
  startFromDate?: string
): Promise<Event[]> {
  // Get existing events
  const existingEvents = await getEventsByRecurrenceGroup(groupId);
  if (existingEvents.length === 0) {
    throw new Error('No events found in group');
  }

  const firstEvent = existingEvents.sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )[0];

  // Delete all existing events in the group
  await deleteEventGroup(groupId);

  // Create new series with new frequency
  const baseDate = startFromDate ? new Date(startFromDate) : new Date(firstEvent.startDate);
  const baseDuration = new Date(firstEvent.endDate).getTime() - new Date(firstEvent.startDate).getTime();

  const baseEventData: Omit<Event, 'id' | 'createdAt'> = {
    title: firstEvent.title,
    description: firstEvent.description,
    coverImageUrl: firstEvent.coverImageUrl,
    heroImage: firstEvent.heroImage,
    category: firstEvent.category,
    tags: firstEvent.tags,
    status: firstEvent.status,
    startDate: baseDate.toISOString(),
    endDate: new Date(baseDate.getTime() + baseDuration).toISOString(),
    locationName: firstEvent.locationName,
    location: firstEvent.location,
    city: firstEvent.city,
    address: firstEvent.address,
    latitude: firstEvent.latitude,
    longitude: firstEvent.longitude,
    capacity: firstEvent.capacity,
    maxAttendees: firstEvent.maxAttendees,
    price: firstEvent.price,
    currency: firstEvent.currency,
    isFree: firstEvent.isFree,
    isPremium: firstEvent.isPremium,
    pointsReward: firstEvent.pointsReward,
    ageRestriction: firstEvent.ageRestriction,
  };

  return createRecurringEvents(baseEventData, newFrequency, newCount);
}

/**
 * Actualiza la fecha de un evento individual dentro de un grupo
 */
export async function updateEventDate(
  eventId: string,
  newStartDate: string,
  newEndDate: string
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update({
      start_date: newStartDate,
      end_date: newEndDate,
    })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error updating event date:', error);
    throw error;
  }

  return mapSupabaseToEvent(data);
}




































